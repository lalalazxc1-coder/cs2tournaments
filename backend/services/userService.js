const { sequelize, User, PlayerSummary, Lobby, TournamentBracket, TeamMember, Team, Friend, WallPost, WallPostLike, WallPostComment, NicknameHistory } = require('../models');
const { Op } = require('sequelize');

class UserService {
    /**
     * Get user profile statistics including rank, rating, and match counts
     * @param {Object} user - The user model instance
     * @returns {Promise<Object>} Stats object
     */
    async getUserStats(user) {
        let stats = null;

        if (user.steam_id) {
            try {
                const playerStats = await PlayerSummary.findOne({
                    where: { player_steamid: user.steam_id }
                });

                if (playerStats) {
                    const rating = parseInt(playerStats.rating || 0);
                    const totalMatches = parseInt(playerStats.total_matches || 0);
                    const isQualified = totalMatches >= 5 ? 1 : 0;

                    const qualifiedLiteral = '(CASE WHEN total_matches >= 5 THEN 1 ELSE 0 END)';

                    // Calculate rank
                    const [{ count }] = await sequelize.query(`
                        SELECT COUNT(*) as count 
                        FROM player_summary 
                        JOIN users ON player_summary.player_steamid = users.steam_id
                        WHERE 
                            (${qualifiedLiteral} > :isQualified) 
                            OR 
                            (${qualifiedLiteral} = :isQualified AND rating > :rating)
                            OR
                            (${qualifiedLiteral} = :isQualified AND rating = :rating AND total_matches > :totalMatches)
                    `, {
                        replacements: {
                            isQualified,
                            rating,
                            totalMatches
                        },
                        type: sequelize.QueryTypes.SELECT
                    });

                    const rank = parseInt(count) + 1;

                    stats = {
                        player_name: playerStats.player_name || user.nickname,
                        last_updated: playerStats.last_updated,
                        rating,
                        rank
                    };
                }
            } catch (error) {
                throw new Error(`Error calculating user stats: ${error.message}`);
            }
        }

        // Default stats if none found
        if (!stats) {
            stats = {
                player_name: user.nickname || `User_${user.id}`,
                last_updated: null,
                k_d_ratio: 0.0,
                avg_adr: 0.0,
                avg_hs_percent: 0.0,
                rating: 0,
                rank: 0
            };
        }

        // Calculate internal match counts (lobbies + tournaments)
        const [lobbyCount] = await sequelize.query(`
            SELECT COUNT(DISTINCT l.id) as count
            FROM participants p
            JOIN lobbies l ON p.tournament_id = l.id
            WHERE p.user_id = :userId AND l.status = 'finished'
        `, { replacements: { userId: user.id } });

        const [tournamentMatchCount] = await sequelize.query(`
            SELECT COUNT(DISTINCT tb.id) as count
            FROM tournament_brackets tb
            JOIN team_members tm ON (tb.team1_id = tm.team_id OR tb.team2_id = tm.team_id)
            WHERE tm.user_id = :userId
            AND tb.status = 'completed'
            AND tb.winner_id IS NOT NULL
        `, { replacements: { userId: user.id } });

        stats.internal_matches_count = (parseInt(lobbyCount[0]?.count) || 0) + (parseInt(tournamentMatchCount[0]?.count) || 0);

        return stats;
    }

    /**
     * Get recent tournaments for a user
     * @param {number} userId 
     * @param {number} limit 
     * @returns {Promise<Array>} List of tournaments
     */
    async getRecentTournaments(userId, limit = 5) {
        const [recentTournamentsData] = await sequelize.query(`
            SELECT p.team_number, t.id, t.name, t.date_time, t.format, t.status
            FROM participants p
            JOIN lobbies t ON p.tournament_id = t.id
            WHERE p.user_id = :userId
            ORDER BY t.date_time DESC
            LIMIT :limit
        `, { replacements: { userId, limit } });

        return recentTournamentsData;
    }

    /**
     * Get user's friends list (formatted)
     * @param {number} userId 
     * @returns {Promise<Array>} Formatted friends list
     */
    async getUserFriends(userId) {
        const friendsInitiated = await Friend.findAll({
            where: { user_id: userId, status: 'accepted' },
            include: [{ model: User, as: 'friendProfile', attributes: ['id', 'nickname', 'avatar_medium', 'steam_id', 'custom_url'] }]
        });

        const friendsReceived = await Friend.findAll({
            where: { friend_id: userId, status: 'accepted' },
            include: [{ model: User, as: 'userProfile', attributes: ['id', 'nickname', 'avatar_medium', 'steam_id', 'custom_url'] }]
        });

        const pendingSent = await Friend.findAll({
            where: { user_id: userId, status: 'pending' },
            include: [{ model: User, as: 'friendProfile', attributes: ['id', 'nickname', 'avatar_medium', 'steam_id', 'custom_url'] }]
        });

        const pendingReceived = await Friend.findAll({
            where: { friend_id: userId, status: 'pending' },
            include: [{ model: User, as: 'userProfile', attributes: ['id', 'nickname', 'avatar_medium', 'steam_id', 'custom_url'] }]
        });

        return [
            ...friendsInitiated.map(f => f.friendProfile ? ({ ...f.friendProfile.toJSON(), friendship_status: 'accepted', friendship_id: f.id }) : null).filter(Boolean),
            ...friendsReceived.map(f => f.userProfile ? ({ ...f.userProfile.toJSON(), friendship_status: 'accepted', friendship_id: f.id }) : null).filter(Boolean),
            ...pendingSent.map(f => f.friendProfile ? ({ ...f.friendProfile.toJSON(), friendship_status: 'pending_sent', friendship_id: f.id }) : null).filter(Boolean),
            ...pendingReceived.map(f => f.userProfile ? ({ ...f.userProfile.toJSON(), friendship_status: 'pending_received', friendship_id: f.id }) : null).filter(Boolean)
        ];
    }

    /**
     * Get user's teams with stats
     * @param {number} userId 
     * @returns {Promise<Array>} Teams list
     */
    async getUserTeams(userId) {
        const teamMemberships = await TeamMember.findAll({
            where: { user_id: userId },
            include: [{ model: Team, as: 'team' }]
        });

        return Promise.all(teamMemberships.map(async (tm) => {
            const team = tm.team.toJSON();
            team.members_count = await TeamMember.count({ where: { team_id: team.id } });

            const [winsCount] = await sequelize.query(`
                SELECT COUNT(*) as count 
                FROM tournament_brackets 
                WHERE winner_id = :teamId
            `, { replacements: { teamId: team.id } });

            team.wins = parseInt(winsCount[0]?.count) || 0;
            return team;
        }));
    }

    /**
     * Get real tournaments participation
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    async getRealTournaments(userId) {
        const [tournaments] = await sequelize.query(`
            SELECT DISTINCT
                t.id, 
                t.name, 
                t.start_date as date_time, 
                t.format, 
                t.status, 
                t.max_teams as max_participants,
                (SELECT COUNT(*) FROM tournament_teams tt_count WHERE tt_count.tournament_id = t.id) as current_participants,
                tt.status as team_status
            FROM tournaments t
            JOIN tournament_teams tt ON t.id = tt.tournament_id
            JOIN teams tm ON tt.team_id = tm.id
            JOIN team_members mem ON tm.id = mem.team_id
            WHERE mem.user_id = :userId
            ORDER BY t.start_date DESC
        `, { replacements: { userId } });

        return tournaments;
    }

    /**
     * Get wall posts for a user
     * @param {number} userId - Owner of the wall
     * @param {number} viewerId - Who is viewing (for like status)
     * @param {number} limit 
     * @returns {Promise<Object>} { posts, count }
     */
    async getWallPosts(userId, viewerId, limit = 5) {
        const wallPostsData = await WallPost.findAll({
            where: { user_id: userId },
            include: [
                { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar_medium', 'custom_url'] },
                { model: WallPostLike, as: 'likes', attributes: ['user_id'] },
                {
                    model: WallPostComment,
                    as: 'comments',
                    include: [{ model: User, as: 'author', attributes: ['id', 'nickname', 'avatar_medium', 'custom_url'] }]
                }
            ],
            order: [
                ['created_at', 'DESC'],
                [{ model: WallPostComment, as: 'comments' }, 'created_at', 'ASC']
            ],
            limit
        });

        const count = await WallPost.count({ where: { user_id: userId } });

        const posts = wallPostsData.map(post => {
            const plainPost = post.toJSON();
            plainPost.likes_count = plainPost.likes.length;
            plainPost.is_liked = viewerId ? plainPost.likes.some(like => like.user_id === viewerId) : false;
            delete plainPost.likes;
            return plainPost;
        });

        return { posts, count };
    }

    /**
     * Get nickname history
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    async getNicknameHistory(userId) {
        try {
            return await NicknameHistory.findAll({
                where: { user_id: userId },
                order: [['changed_at', 'DESC']]
            });
        } catch (err) {
            console.error('Error fetching nickname history:', err); // Keep console or use logger if passed
            return [];
        }
    }

    /**
     * Get total tournament count (lobbies)
     * @param {number} userId 
     * @returns {Promise<number>}
     */
    async getTournamentCount(userId) {
        const [matchesData] = await sequelize.query(`
            SELECT DISTINCT l.id
            FROM lobbies l
            JOIN participants p ON l.id = p.tournament_id
            WHERE p.user_id = :userId
        `, { replacements: { userId } });
        return matchesData.length;
    }
    /**
     * Get user tournaments with details (for profile tab)
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    async getUserTournamentsWithDetails(userId) {
        const [tournamentsData] = await sequelize.query(`
            SELECT DISTINCT
                t.id, 
                t.name, 
                t.start_date as date_time, 
                t.format, 
                t.status, 
                t.max_teams as max_participants,
                (SELECT COUNT(*) FROM tournament_teams tt_count WHERE tt_count.tournament_id = t.id) as current_participants,
                tt.status as team_status
            FROM tournaments t
            JOIN tournament_teams tt ON t.id = tt.tournament_id
            JOIN teams tm ON tt.team_id = tm.id
            JOIN team_members mem ON tm.id = mem.team_id
            WHERE mem.user_id = :userId
            ORDER BY t.start_date DESC
        `, { replacements: { userId } });
        return tournamentsData;
    }

    /**
     * Get user matches (lobbies) with pagination
     * @param {number} userId 
     * @param {number} limit 
     * @param {number} offset 
     * @returns {Promise<Object>} { matches, total }
     */
    async getUserMatchesWithPagination(userId, limit = 10, offset = 0) {
        const [matches] = await sequelize.query(`
            SELECT DISTINCT
                l.id, l.name, l.date_time, l.status, l.format, l.map_pool,
                p.team_number,
                (SELECT COUNT(*) FROM participants WHERE tournament_id = l.id) as participants_count
            FROM lobbies l
            JOIN participants p ON l.id = p.tournament_id
            WHERE p.user_id = :userId AND l.status IN ('registering', 'drafting', 'in_progress', 'finished', 'completed')
            ORDER BY l.date_time DESC
            LIMIT :limit OFFSET :offset
        `, {
            replacements: { userId, limit, offset }
        });

        const [countResult] = await sequelize.query(`
            SELECT COUNT(DISTINCT l.id) as count
            FROM lobbies l
            JOIN participants p ON l.id = p.tournament_id
            WHERE p.user_id = :userId AND l.status IN ('registering', 'drafting', 'in_progress', 'finished', 'completed')
        `, { replacements: { userId } });

        return {
            matches,
            total: countResult[0]?.count || 0
        };
    }
}

module.exports = new UserService();
