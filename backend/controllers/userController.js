const {
    User,
    Participant,
    PlayerSummary,
    Team,
    TeamMember,
    Friend,
    WallPost,
    WallPostLike,
    WallPostComment,
    UserSession,
    NicknameHistory,
    sequelize
} = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Get user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Parse privacy settings safely
        let privacy = user.privacy_settings;
        if (typeof privacy === 'string') {
            try {
                privacy = JSON.parse(privacy);
            } catch (e) {
                privacy = {};
            }
        }
        // Ensure defaults
        privacy = {
            profile_visibility: 'public',
            wall_visibility: 'public',
            friends_visibility: 'public',
            ...privacy
        };

        const userService = require('../services/userService');

        // Parallelize independent data fetching
        const [
            tournamentCount,
            stats,
            formattedTournaments,
            formattedFriends,
            teams,
            tournaments,
            wallData,
            nicknameHistory
        ] = await Promise.all([
            userService.getTournamentCount(userId),
            userService.getUserStats(user),
            userService.getRecentTournaments(userId),
            userService.getUserFriends(userId),
            userService.getUserTeams(userId),
            userService.getRealTournaments(userId),
            userService.getWallPosts(userId, userId), // viewer is self
            userService.getNicknameHistory(userId)
        ]);

        logger.debug(`[DEBUG] User ${userId} match count: ${tournamentCount}`);

        res.json({
            user: {
                id: user.id,
                nickname: user.nickname,
                steam_id: user.steam_id,
                avatar_full: user.avatar_full,
                avatar_medium: user.avatar_medium,
                profile_url: user.profile_url,
                real_name: user.real_name,
                gender: user.gender,
                email: user.email,
                custom_url: user.custom_url,
                profile_bg: user.profile_bg,
                privacy_settings: privacy,
                last_seen: user.last_seen,
                player_label: user.player_label,
                role: user.role,
                created_at: user.created_at,
                tournaments_count: tournamentCount,
                nickname_history: nicknameHistory
            },
            stats,
            friends: formattedFriends,
            teams: teams,
            tournaments: tournaments,
            wall_posts: wallData.posts,
            wall_posts_count: wallData.count,
            friendship_status: 'self',
            privacy: {
                can_post_on_wall: true
            }
        });

    } catch (error) {
        logger.error('Profile error:', error);
        next(error);
    }
};

exports.updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const userId = req.user.userId;
        const { nickname, real_name, gender, email, custom_url, privacy_settings, player_label, avatar_full, avatar_medium, profile_bg } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check nickname uniqueness and rate limit if changed
        if (nickname !== undefined && nickname !== user.nickname) {
            if (nickname && nickname.trim().length > 0) {
                // Rate limit check
                if (user.nickname_changed_at) {
                    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    if (user.nickname_changed_at > thirtyDaysAgo) {
                        const nextChangeDate = new Date(user.nickname_changed_at.getTime() + 30 * 24 * 60 * 60 * 1000);
                        return res.status(400).json({
                            message: `Никнейм можно менять только раз в 30 дней. Следующая смена доступна ${nextChangeDate.toLocaleDateString()}`
                        });
                    }
                }

                const existingNickname = await User.findOne({ where: { nickname } });
                if (existingNickname) {
                    return res.status(400).json({ message: 'Nickname already taken' });
                }
            } else if (nickname === '') {
                return res.status(400).json({ message: 'Nickname cannot be empty' });
            }
        }

        // Check custom_url uniqueness if changed
        if (custom_url !== undefined && custom_url !== user.custom_url) {
            if (custom_url && custom_url.trim().length > 0) {
                const existing = await User.findOne({ where: { custom_url } });
                if (existing) {
                    return res.status(400).json({ message: 'Custom URL already taken' });
                }
            }
        }

        if (nickname !== undefined) {
            if (nickname !== user.nickname) {
                // Save old nickname to history
                if (user.nickname) {
                    await NicknameHistory.create({
                        user_id: user.id,
                        nickname: user.nickname
                    });
                }

                user.nickname = nickname;
                user.nickname_changed_at = new Date();
            }
        }
        if (real_name !== undefined) user.real_name = real_name;
        if (gender !== undefined) user.gender = gender;
        if (email !== undefined) user.email = email;
        if (custom_url !== undefined) user.custom_url = custom_url || null;
        if (profile_bg !== undefined) user.profile_bg = profile_bg;
        if (player_label !== undefined) user.player_label = player_label;
        if (avatar_full !== undefined) {
            user.avatar_full = avatar_full;
            user.avatar_changed_at = new Date();
        }
        if (avatar_medium !== undefined) {
            user.avatar_medium = avatar_medium;
            user.avatar_changed_at = new Date();
        }

        if (privacy_settings) {
            let currentSettings = user.privacy_settings;
            if (typeof currentSettings === 'string') {
                try {
                    currentSettings = JSON.parse(currentSettings);
                } catch (e) {
                    currentSettings = {};
                }
            }
            user.privacy_settings = { ...currentSettings, ...privacy_settings };
            user.changed('privacy_settings', true);
        }

        await user.save();

        res.json({ message: 'Profile updated', user });

    } catch (error) {
        logger.error('Update profile error:', error);
        next(error);
    }
};

exports.updateLabel = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const userId = req.user.userId;
        let { label } = req.body;

        // Handle empty label (delete)
        if (!label) {
            await User.update({ player_label: null }, { where: { id: userId } });
            return res.json({ message: 'Метка удалена', label: null });
        }

        // Profanity Filter
        const forbiddenWords = [
            'admin', 'moderator', 'system', 'root', 'support',
            'bitch', 'fuck', 'shit', 'ass', 'cunt', 'dick', 'pussy', 'whore', 'slut', 'nigger', 'faggot',
            'хуй', 'пизда', 'ебать', 'бля', 'сука', 'мудак', 'гандон', 'пидор', 'шлюха'
        ];

        const lowerLabel = label.toLowerCase();
        const hasProfanity = forbiddenWords.some(word => lowerLabel.includes(word));

        if (hasProfanity) {
            return res.status(400).json({ message: 'Метка содержит недопустимые слова' });
        }

        await User.update({ player_label: label }, { where: { id: userId } });

        res.json({ message: 'Метка обновлена', label });

    } catch (error) {
        logger.error('Update label error:', error);
        next(error);
    }
};

exports.getSessions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const sessions = await UserSession.findAll({
            where: { user_id: userId, is_active: true },
            order: [['last_active', 'DESC']]
        });
        res.json({ sessions });
    } catch (error) {
        logger.error('Get sessions error:', error);
        next(error);
    }
};

exports.revokeSession = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
        const userId = req.user.userId;
        const sessionId = req.params.id;

        const session = await UserSession.findOne({
            where: { id: sessionId, user_id: userId }
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        await session.destroy();

        res.json({ message: 'Session revoked' });
    } catch (error) {
        logger.error('Revoke session error:', error);
        next(error);
    }
};

exports.getPublicProfile = async (req, res) => {
    try {
        const { identifier } = req.params;
        const viewerId = req.user ? req.user.userId : null;

        let user;
        // Check if identifier is numeric (ID) or string (Custom URL)
        if (/^\d+$/.test(identifier)) {
            user = await User.findByPk(identifier);
        } else {
            user = await User.findOne({ where: { custom_url: identifier } });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = user.id;

        // Parse privacy settings
        let privacy = user.privacy_settings;
        if (typeof privacy === 'string') {
            try { privacy = JSON.parse(privacy); } catch (e) { privacy = {}; }
        }
        privacy = { profile_visibility: 'public', wall_visibility: 'public', friends_visibility: 'public', ...privacy };

        // Check Friendship Status
        let isFriend = false;
        let friendshipStatus = 'none';

        if (viewerId && viewerId !== userId) {
            const friendship = await Friend.findOne({
                where: {
                    [Op.or]: [
                        { user_id: userId, friend_id: viewerId },
                        { user_id: viewerId, friend_id: userId }
                    ]
                }
            });

            if (friendship) {
                if (friendship.status === 'accepted') {
                    isFriend = true;
                    friendshipStatus = 'friends';
                } else if (friendship.status === 'pending') {
                    if (friendship.user_id === viewerId) {
                        friendshipStatus = 'pending_sent';
                    } else {
                        friendshipStatus = 'pending_received';
                    }
                }
            }
        } else if (viewerId === userId) {
            friendshipStatus = 'self';
        }

        // Check Profile Visibility
        let isPrivate = false;
        if (privacy.profile_visibility === 'private') {
            isPrivate = true;
        } else if (privacy.profile_visibility === 'friends') {
            if (!viewerId) {
                isPrivate = true;
            } else if (viewerId !== userId && !isFriend) {
                isPrivate = true;
            }
        }

        // If viewer is self, always show
        if (viewerId === userId) isPrivate = false;

        if (isPrivate) {
            return res.status(403).json({
                message: 'This profile is private',
                is_private: true,
                user: {
                    id: user.id,
                    nickname: user.nickname,
                    avatar_full: user.avatar_full,
                    avatar_medium: user.avatar_medium,
                    privacy_settings: privacy
                }
            });
        }

        const userService = require('../services/userService');

        // Prepare promises for parallel execution
        const promises = [
            userService.getTournamentCount(userId),
            userService.getUserStats(user),
            userService.getUserTeams(userId),
            userService.getRealTournaments(userId),
            userService.getNicknameHistory(userId)
        ];

        // Fetch Friends if visible
        let friendsPromise = Promise.resolve([]);
        const canViewFriends = privacy.friends_visibility === 'public' ||
            (privacy.friends_visibility === 'friends' && (isFriend || viewerId === userId)) ||
            viewerId === userId;

        if (canViewFriends) {
            friendsPromise = userService.getUserFriends(userId);
        }
        promises.push(friendsPromise);

        // Fetch Wall Posts if visible
        let wallPromise = Promise.resolve({ posts: [], count: 0 });
        if (privacy.wall_visibility === 'public' || (privacy.wall_visibility === 'friends' && (isFriend || viewerId === userId))) {
            wallPromise = userService.getWallPosts(userId, viewerId);
        }
        promises.push(wallPromise);


        // Execute all
        const [
            tournamentCount,
            stats,
            teams,
            tournaments,
            nicknameHistory,
            allFriends,
            wallData
        ] = await Promise.all(promises);

        // Filter friends for public view (usually only accepted are shown publicly)
        const formattedFriends = allFriends.filter(f => f.friendship_status === 'accepted');

        res.json({
            user: {
                id: user.id,
                nickname: user.nickname,
                steam_id: user.steam_id,
                avatar_full: user.avatar_full,
                avatar_medium: user.avatar_medium,
                profile_url: user.profile_url,
                real_name: user.real_name,
                gender: user.gender,
                // email: user.email, // Hidden for privacy
                custom_url: user.custom_url,
                profile_bg: user.profile_bg,
                privacy_settings: privacy,
                last_seen: user.last_seen,
                player_label: user.player_label,
                role: user.role,
                created_at: user.created_at,
                tournaments_count: tournamentCount,
                nickname_history: nicknameHistory
            },
            stats,
            friends: formattedFriends,
            teams,
            tournaments,
            wall_posts: wallData.posts,
            wall_posts_count: wallData.count,
            friendship_status: friendshipStatus,
            privacy: {
                can_post_on_wall: privacy.wall_visibility === 'public' || (privacy.wall_visibility === 'friends' && isFriend) || viewerId === userId,
                can_view_friends: canViewFriends
            }
        });

    } catch (error) {
        logger.error('Public profile error:', error);
        next(error);
    }
};

exports.getUserTournaments = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const userService = require('../services/userService');
        const tournamentsData = await userService.getUserTournamentsWithDetails(userId);
        res.json({ tournaments: tournamentsData });
    } catch (error) {
        logger.error('User tournaments error:', error);
        next(error);
    }
};


exports.getUserMatches = async (req, res, next) => {
    try {
        const { identifier } = req.params;
        const { limit = 10, offset = 0 } = req.query;

        // Find user by ID or Custom URL
        let user;
        if (!isNaN(identifier)) {
            user = await User.findByPk(identifier);
        } else {
            user = await User.findOne({ where: { custom_url: identifier } });
        }

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Privacy check
        let privacy = user.privacy_settings;
        if (typeof privacy === 'string') {
            try { privacy = JSON.parse(privacy); } catch (e) { privacy = {}; }
        }
        privacy = { profile_visibility: 'public', ...privacy };

        const isOwner = req.user && req.user.userId === user.id;
        const isAdmin = req.user && req.user.role === 2;

        if (!isOwner && !isAdmin && privacy.profile_visibility === 'private') {
            return res.status(403).json({ message: 'Профиль скрыт' });
        }

        const userService = require('../services/userService');
        const { matches, total } = await userService.getUserMatchesWithPagination(user.id, parseInt(limit), parseInt(offset));

        res.json({
            matches,
            total
        });

    } catch (error) {
        logger.error('Get user matches error:', error);
        next(error);
    }
};
