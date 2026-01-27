const { PlayerSummary, sequelize } = require('../../models');
const { validationResult } = require('express-validator');

exports.getMatches = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const [matches] = await sequelize.query(`
            SELECT 
                match_id, 
                map_name, 
                team_a_score, 
                team_b_score, 
                winning_team_name, 
                game_date, 
                total_rounds,
                demo_filename
            FROM matches 
            ORDER BY match_id DESC 
            LIMIT :limit OFFSET :offset
        `, {
            replacements: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

        const [countResult] = await sequelize.query('SELECT COUNT(*) as total FROM matches');
        const total = countResult[0].total;

        res.json({
            matches,
            total,
            pages: Math.ceil(total / limit),
            current_page: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ message: 'Ошибка при получении матчей' });
    }
};

exports.deleteMatch = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const t = await sequelize.transaction();
    try {
        const matchId = req.params.id;

        const [playerStats] = await sequelize.query(
            'SELECT * FROM player_stats WHERE match_id = ?',
            { replacements: [matchId], transaction: t }
        );

        if (playerStats.length === 0) {
            await t.rollback();
            return res.status(404).json({ message: 'Матч или статистика не найдены' });
        }

        for (const stat of playerStats) {
            const summary = await PlayerSummary.findOne({
                where: { player_steamid: stat.player_steamid },
                transaction: t
            });

            if (summary) {
                const N = summary.total_matches;
                if (N > 1) {
                    const newTotalMatches = N - 1;
                    const newWins = Math.max(0, summary.wins - (stat.is_winner ? 1 : 0));
                    const newLosses = Math.max(0, summary.losses - (stat.is_winner ? 0 : 1));
                    const newTotalKills = Math.max(0, summary.total_kills - stat.kills);
                    const newTotalDeaths = Math.max(0, summary.total_deaths - stat.deaths);
                    const newTotalAssists = Math.max(0, summary.total_assists - stat.assists);

                    const currentAvgAdr = summary.avg_adr || 0;
                    const currentAvgHs = summary.avg_hs_percent || 0;

                    const newAvgAdr = (currentAvgAdr * N - stat.adr) / newTotalMatches;
                    const newAvgHs = (currentAvgHs * N - stat.hs_percent) / newTotalMatches;

                    await summary.update({
                        total_matches: newTotalMatches,
                        wins: newWins,
                        losses: newLosses,
                        win_rate: (newWins / newTotalMatches) * 100,
                        total_kills: newTotalKills,
                        total_deaths: newTotalDeaths,
                        total_assists: newTotalAssists,
                        k_d_ratio: newTotalDeaths > 0 ? newTotalKills / newTotalDeaths : newTotalKills,
                        avg_adr: Math.max(0, newAvgAdr),
                        avg_hs_percent: Math.max(0, newAvgHs)
                    }, { transaction: t });
                } else {
                    await summary.destroy({ transaction: t });
                }
            }
        }

        await sequelize.query(
            'DELETE FROM player_stats WHERE match_id = ?',
            { replacements: [matchId], transaction: t }
        );

        await sequelize.query(
            'DELETE FROM matches WHERE match_id = ?',
            { replacements: [matchId], transaction: t }
        );

        await t.commit();
        res.json({ message: 'Матч удален и статистика откатана' });

    } catch (error) {
        await t.rollback();
        console.error('Error deleting match:', error);
        res.status(500).json({ message: 'Ошибка при удалении матча' });
    }
};

exports.getMatchStats = async (req, res) => {
    try {
        const { matchId } = req.params;

        const [matches] = await sequelize.query(
            'SELECT * FROM matches WHERE match_id = ?',
            { replacements: [matchId] }
        );

        if (matches.length === 0) {
            return res.status(404).json({ message: 'Матч не найден' });
        }

        const match = matches[0];

        const [playerStats] = await sequelize.query(`
            SELECT 
                ps.*,
                u.nickname,
                u.avatar_medium,
                u.custom_url,
                u.id as user_id
            FROM player_stats ps
            LEFT JOIN users u ON ps.player_steamid = u.steam_id
            WHERE ps.match_id = ?
            ORDER BY ps.team_name, ps.kills DESC
        `, { replacements: [matchId] });

        res.json({
            match,
            playerStats
        });
    } catch (error) {
        console.error('Error fetching match stats:', error);
        res.status(500).json({ message: 'Ошибка при получении статистики матча' });
    }
};
