const { Lobby, User } = require('../models');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

class DashboardService {

    async getStats() {
        const totalPlayers = await User.count();
        const totalLobbies = await Lobby.count();
        const activeLobbies = await Lobby.count({
            where: { status: 'registering' }
        });

        return {
            total_players: totalPlayers,
            total_tournaments: totalLobbies,
            active_tournaments: activeLobbies
        };
    }

    async getActiveTournaments(limit = 5) {
        const lobbies = await Lobby.findAll({
            where: { status: 'registering' },
            attributes: ['id', 'name', 'date_time', 'format', 'max_participants'],
            order: [['date_time', 'ASC']],
            limit
        });

        const result = await Promise.all(lobbies.map(async (lobby) => {
            try {
                const [results] = await sequelize.query(
                    'SELECT COUNT(*) as count FROM participants WHERE tournament_id = ?',
                    { replacements: [lobby.id] }
                );
                const participantCount = parseInt(results[0].count) || 0;

                let formattedDate = null;
                if (lobby.date_time) {
                    const date = new Date(lobby.date_time);
                    if (!isNaN(date.getTime())) {
                        formattedDate = date.toISOString().slice(0, 16).replace('T', ' ');
                    }
                }

                return {
                    id: lobby.id,
                    name: lobby.name,
                    date_time: formattedDate,
                    format: lobby.format,
                    current_participants: participantCount,
                    max_participants: lobby.max_participants
                };
            } catch (error) {
                logger.error(`Error counting participants for lobby ${lobby.id}:`, error);
                return {
                    id: lobby.id,
                    name: lobby.name,
                    date_time: lobby.date_time ? lobby.date_time.toISOString().slice(0, 16).replace('T', ' ') : null,
                    format: lobby.format,
                    current_participants: 0,
                    max_participants: lobby.max_participants
                };
            }
        }));

        return result;
    }

    async getTopPlayers(limit = 3) {
        const [players] = await sequelize.query(`
            SELECT
                ps.player_name,
                ps.k_d_ratio,
                ps.win_rate,
                ps.total_matches,
                ps.wins,
                ps.losses,
                ps.total_kills,
                ps.total_deaths,
                ps.avg_adr,
                ps.avg_hs_percent,
                u.nickname,
                u.id as user_id,
                u.steam_id,
                u.custom_url,
                u.avatar_medium as avatar_url,
                (COALESCE(ps.win_rate, 0) * 5 + COALESCE(ps.k_d_ratio, 0) * 500 + COALESCE(ps.total_matches, 0) * 5) as rating
            FROM player_summary ps
            LEFT JOIN users u ON ps.player_steamid = u.steam_id
            WHERE ps.total_matches >= 5
            ORDER BY rating DESC
            LIMIT ?
        `, {
            replacements: [limit]
        });

        return players.map((player, index) => {
            let displayName = player.player_name;

            if (player.nickname) {
                displayName = player.nickname;
            }

            return {
                rank: index + 1,
                name: displayName || 'Игрок',
                kd_ratio: Math.round(parseFloat(player.k_d_ratio || 0) * 100) / 100,
                win_rate: Math.round(parseFloat(player.win_rate || 0) * 10) / 10,
                matches: parseInt(player.total_matches || 0),
                wins: parseInt(player.wins || 0),
                losses: parseInt(player.losses || 0),
                kills: parseInt(player.total_kills || 0),
                deaths: parseInt(player.total_deaths || 0),
                adr: Math.round(parseFloat(player.avg_adr || 0) * 10) / 10,
                hs_percent: Math.round(parseFloat(player.avg_hs_percent || 0) * 10) / 10,
                id: player.user_id,
                steam_id: player.steam_id,
                custom_url: player.custom_url,
                avatar_url: player.avatar_url
            };
        });
    }
}

module.exports = new DashboardService();
