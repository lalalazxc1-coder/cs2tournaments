const { User, Participant, PlayerSummary, TeamMember, TournamentTeam, Tournament, Lobby, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const jwtConfig = require('../../config/jwt');
const jwt = require('jsonwebtoken');

exports.getUsers = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                { nickname: { [Op.like]: `%${search}%` } },
                { steam_id: { [Op.like]: `%${search}%` } },
                { real_name: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            attributes: { include: ['last_seen'] }
        });

        res.json({
            users: rows,
            total: count,
            pages: Math.ceil(count / limit),
            current_page: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Ошибка при получении пользователей' });
    }
};

exports.getUserStats = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const tournamentCount = await Participant.count({ where: { user_id: userId } });

        let stats = null;
        if (user.steam_id) {
            const playerStats = await PlayerSummary.findOne({
                where: { player_steamid: user.steam_id }
            });

            if (playerStats) {
                stats = {
                    player_name: playerStats.player_name || user.nickname,
                    last_updated: playerStats.last_updated,
                    total_matches: playerStats.total_matches,
                    wins: playerStats.wins,
                    losses: playerStats.losses,
                    win_rate: playerStats.win_rate,
                    total_kills: playerStats.total_kills,
                    total_deaths: playerStats.total_deaths,
                    k_d_ratio: playerStats.k_d_ratio,
                    avg_adr: playerStats.avg_adr,
                    avg_hs_percent: playerStats.avg_hs_percent
                };
            }
        }

        if (!stats) {
            stats = {
                player_name: user.nickname,
                total_matches: 0,
                wins: 0,
                losses: 0,
                win_rate: 0,
                k_d_ratio: 0.0,
                avg_adr: 0.0,
                avg_hs_percent: 0.0
            };
        }

        res.json({
            user: {
                id: user.id,
                nickname: user.nickname,
                steam_id: user.steam_id,
                role: user.role,
                created_at: user.created_at,
                tournaments_count: tournamentCount,
                player_label: user.player_label
            },
            stats
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Ошибка при получении статистики' });
    }
};

exports.updateUserProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const {
            nickname, steam_id, player_label,
            real_name, email, custom_url, avatar_full, gender
        } = req.body;

        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        if (steam_id && steam_id !== user.steam_id) {
            if (!/^\d+$/.test(steam_id)) {
                return res.status(400).json({ message: 'Steam ID должен состоять только из цифр' });
            }
            const existing = await User.findOne({
                where: {
                    steam_id: steam_id,
                    id: { [Op.ne]: user.id }
                }
            });
            if (existing) {
                return res.status(400).json({ message: 'Этот Steam ID уже используется другим пользователем' });
            }
        }

        if (custom_url && custom_url !== user.custom_url) {
            const existingUrl = await User.findOne({
                where: {
                    custom_url: custom_url,
                    id: { [Op.ne]: user.id }
                }
            });
            if (existingUrl) {
                return res.status(400).json({ message: 'Этот Custom URL уже занят' });
            }
        }

        user.nickname = nickname;
        user.steam_id = steam_id;
        user.player_label = player_label;
        user.real_name = real_name;
        user.email = email;
        user.custom_url = custom_url || null;
        user.avatar_full = avatar_full;
        user.gender = gender;

        await user.save();

        res.json({ message: 'Профиль обновлен', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Ошибка при обновлении профиля' });
    }
};

exports.impersonateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            jwtConfig.secret,
            { expiresIn: '24h' }
        );

        res.json({ token, user });
    } catch (error) {
        console.error('Error impersonating user:', error);
        res.status(500).json({ message: 'Ошибка при авторизации под пользователем' });
    }
};

exports.updateUserRole = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { role } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        if (![0, 1, 2].includes(role)) {
            return res.status(400).json({ message: 'Некорректная роль' });
        }

        user.role = role;
        await user.save();

        res.json({ message: 'Роль пользователя обновлена', user });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Ошибка при обновлении роли' });
    }
};

exports.banUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { is_blocked, blocked_until } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        user.is_blocked = is_blocked;
        user.blocked_until = blocked_until || null;
        await user.save();

        res.json({ message: `Пользователь ${is_blocked ? 'заблокирован' : 'разблокирован'}`, user });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({ message: 'Ошибка при изменении статуса блокировки' });
    }
};

exports.getUserLobbies = async (req, res) => {
    try {
        const userId = req.params.id;

        const participants = await Participant.findAll({
            where: { user_id: userId },
            attributes: ['tournament_id']
        });

        const lobbyIds = participants.map(p => p.tournament_id);

        const lobbies = await Lobby.findAll({
            where: { id: lobbyIds },
            order: [['created_at', 'DESC']]
        });

        res.json({ lobbies });
    } catch (error) {
        console.error('Error fetching user lobbies:', error);
        res.status(500).json({ message: 'Ошибка при получении истории лобби' });
    }
};

exports.getUserTournaments = async (req, res) => {
    try {
        const userId = req.params.id;

        const teamMembers = await TeamMember.findAll({
            where: { user_id: userId },
            attributes: ['team_id']
        });
        const teamIds = teamMembers.map(tm => tm.team_id);

        if (teamIds.length === 0) {
            return res.json({ tournaments: [] });
        }

        const tournamentTeams = await TournamentTeam.findAll({
            where: { team_id: teamIds }
        });

        const tournamentIds = tournamentTeams.map(tt => tt.tournament_id);

        const tournaments = await Tournament.findAll({
            where: { id: tournamentIds },
            order: [['start_date', 'DESC']]
        });

        res.json({ tournaments });
    } catch (error) {
        console.error('Error fetching user tournaments:', error);
        res.status(500).json({ message: 'Ошибка при получении истории турниров' });
    }
};
