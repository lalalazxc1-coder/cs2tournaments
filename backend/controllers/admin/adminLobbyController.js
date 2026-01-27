const { Lobby, Participant, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

exports.getLobbies = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }

        const { count, rows } = await Lobby.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            lobbies: rows,
            total: count,
            pages: Math.ceil(count / limit),
            current_page: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching lobbies:', error);
        res.status(500).json({ message: 'Ошибка при получении лобби' });
    }
};

exports.getLobbyParticipants = async (req, res) => {
    try {
        const lobbyId = req.params.id;

        const [participants] = await sequelize.query(`
            SELECT 
                p.team_number, 
                p.created_at as registered_at, 
                u.id as user_id, 
                u.nickname, 
                u.steam_id,
                COALESCE(ps.k_d_ratio, 0.00) as k_d,
                COALESCE(ps.win_rate, 0.00) as win_rate,
                COALESCE(ps.total_matches, 0) as matches
            FROM participants p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN player_summary ps ON u.steam_id = ps.player_steamid
            WHERE p.tournament_id = ?
            ORDER BY p.created_at
        `, { replacements: [lobbyId] });

        res.json({ participants });
    } catch (error) {
        console.error('Error fetching lobby participants:', error);
        res.status(500).json({ message: 'Ошибка при получении участников' });
    }
};

exports.updateLobby = async (req, res) => {
    try {
        const { name, status, map_pool, format, max_participants, date_time } = req.body;
        const lobby = await Lobby.findByPk(req.params.id);

        if (!lobby) {
            return res.status(404).json({ message: 'Лобби не найдено' });
        }

        await lobby.update({
            name: name || lobby.name,
            status: status || lobby.status,
            map_pool: map_pool ? (typeof map_pool === 'object' ? JSON.stringify(map_pool) : map_pool) : lobby.map_pool,
            format: format || lobby.format,
            max_participants: max_participants || lobby.max_participants,
            date_time: date_time || lobby.date_time
        });

        res.json({ message: 'Лобби обновлено', lobby });
    } catch (error) {
        console.error('Error updating lobby:', error);
        res.status(500).json({ message: 'Ошибка при обновлении лобби' });
    }
};

exports.deleteLobby = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const lobbyId = req.params.id;
        const lobby = await Lobby.findByPk(lobbyId);

        if (!lobby) {
            await t.rollback();
            return res.status(404).json({ message: 'Лобби не найдено' });
        }

        await Participant.destroy({
            where: { tournament_id: lobbyId },
            transaction: t
        });

        await lobby.destroy({ transaction: t });

        await t.commit();
        res.json({ message: 'Лобби удалено' });
    } catch (error) {
        await t.rollback();
        console.error('Error deleting lobby:', error);
        res.status(500).json({ message: 'Ошибка при удалении лобби' });
    }
};

exports.kickUserFromLobby = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { user_id } = req.body;
        const lobbyId = req.params.id;

        const participant = await Participant.findOne({
            where: {
                tournament_id: lobbyId,
                user_id: user_id
            }
        });

        if (!participant) {
            return res.status(404).json({ message: 'Участник не найден в этом лобби' });
        }

        await participant.destroy();

        const count = await Participant.count({ where: { tournament_id: lobbyId } });
        await Lobby.update(
            { current_participants: count },
            { where: { id: lobbyId } }
        );

        res.json({ message: 'Участник исключен из лобби' });
    } catch (error) {
        console.error('Error kicking user from lobby:', error);
        res.status(500).json({ message: 'Ошибка при исключении участника' });
    }
};

exports.addUserToLobby = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { user_id } = req.body;
        const lobbyId = req.params.id;

        if (!user_id || isNaN(parseInt(user_id))) {
            return res.status(400).json({ message: 'Некорректный ID пользователя' });
        }

        const lobby = await Lobby.findByPk(lobbyId);
        if (!lobby) {
            return res.status(404).json({ message: 'Лобби не найдено' });
        }

        if (lobby.current_participants >= lobby.max_participants) {
            return res.status(400).json({ message: 'Лобби заполнено' });
        }

        const existing = await Participant.findOne({
            where: {
                tournament_id: lobbyId,
                user_id: user_id
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'Пользователь уже участвует' });
        }

        await Participant.create({
            tournament_id: lobbyId,
            user_id: user_id
        });

        const count = await Participant.count({ where: { tournament_id: lobbyId } });
        await lobby.update({ current_participants: count });

        res.json({ message: 'Участник добавлен в лобби' });
    } catch (error) {
        console.error('Error adding user to lobby:', error);
        res.status(500).json({ message: 'Ошибка при добавлении участника' });
    }
};

exports.getUnlinkedMatches = async (req, res) => {
    try {
        const { lobbyId } = req.params;
        const { limit = 50 } = req.query;

        const lobby = await Lobby.findByPk(lobbyId);
        if (!lobby) {
            return res.status(404).json({ message: 'Лобби не найдено' });
        }

        const [participants] = await sequelize.query(`
            SELECT u.steam_id 
            FROM participants p
            JOIN users u ON p.user_id = u.id
            WHERE p.tournament_id = ? AND u.steam_id IS NOT NULL
        `, { replacements: [lobbyId] });

        const participantSteamIds = participants.map(p => p.steam_id);

        if (participantSteamIds.length === 0) {
            return res.json({ matches: [] });
        }

        const lobbyDateStr = lobby.date_time.replace('T', ' ') + ':00';
        const lobbyDate = new Date(lobby.date_time);

        const steamIdPlaceholders = participantSteamIds.map(() => '?').join(',');

        const [matches] = await sequelize.query(`
            SELECT 
                m.match_id,
                m.map_name,
                m.team_a_score,
                m.team_b_score,
                m.winning_team_name,
                m.game_date,
                m.total_rounds,
                COUNT(DISTINCT ps.player_steamid) as matching_players
            FROM matches m
            LEFT JOIN player_stats ps ON m.match_id = ps.match_id 
                AND ps.player_steamid IN (${steamIdPlaceholders})
            WHERE m.lobby_id IS NULL
                AND m.game_date >= DATE_SUB(?, INTERVAL 90 DAY)
                AND m.game_date <= DATE_ADD(?, INTERVAL 90 DAY)
            GROUP BY m.match_id
            HAVING matching_players > 0
            ORDER BY matching_players DESC, m.game_date DESC
            LIMIT ?
        `, {
            replacements: [...participantSteamIds, lobbyDateStr, lobbyDateStr, parseInt(limit)]
        });

        const matchIds = matches.map(m => m.match_id);
        let matchesWithPlayers = matches;

        if (matchIds.length > 0) {
            const [allPlayers] = await sequelize.query(`
                SELECT match_id, player_name, player_steamid 
                FROM player_stats 
                WHERE match_id IN (?)
            `, { replacements: [matchIds] });

            matchesWithPlayers = matches.map(match => {
                const players = allPlayers.filter(p => p.match_id === match.match_id);
                return {
                    ...match,
                    match_percentage: Math.round((match.matching_players / participantSteamIds.length) * 100),
                    players: players.map(p => ({ name: p.player_name, steam_id: p.player_steamid }))
                };
            });
        } else {
            matchesWithPlayers = matches.map(match => ({
                ...match,
                match_percentage: Math.round((match.matching_players / participantSteamIds.length) * 100),
                players: []
            }));
        }

        res.json({ matches: matchesWithPlayers });
    } catch (error) {
        console.error('Error fetching unlinked matches:', error);
        res.status(500).json({ message: 'Ошибка при получении несвязанных матчей' });
    }
};

async function checkLobbyCompletion(lobbyId) {
    try {
        const lobby = await Lobby.findByPk(lobbyId);
        if (!lobby) return;

        const [matches] = await sequelize.query(
            'SELECT * FROM matches WHERE lobby_id = ?',
            { replacements: [lobbyId] }
        );

        let requiredMatches = 1;
        if (lobby.format === 'BO3') requiredMatches = 2;
        if (lobby.format === 'BO5') requiredMatches = 3;

        const teamAWins = matches.filter(m => m.winning_team_name === 'Team A').length;
        const teamBWins = matches.filter(m => m.winning_team_name === 'Team B').length;

        let winner = null;
        let shouldComplete = false;

        if (lobby.format === 'BO1') {
            if (matches.length >= 1) {
                shouldComplete = true;
                winner = matches[0].winning_team_name;
            }
        } else {
            if (teamAWins >= requiredMatches) {
                shouldComplete = true;
                winner = 'Team A';
            } else if (teamBWins >= requiredMatches) {
                shouldComplete = true;
                winner = 'Team B';
            }
        }

        let draft_state = lobby.draft_state;
        if (typeof draft_state === 'string') {
            try {
                draft_state = JSON.parse(draft_state);
            } catch (e) {
                draft_state = {};
            }
        }
        draft_state = draft_state || {};

        if (shouldComplete && lobby.status !== 'completed') {
            draft_state.winner = winner;

            await lobby.update({
                status: 'completed',
                draft_state: draft_state
            });
        } else if (!shouldComplete && lobby.status === 'completed') {
            if (draft_state.winner) delete draft_state.winner;

            await lobby.update({
                status: 'in_progress',
                draft_state: draft_state
            });
        }
    } catch (error) {
        console.error('Error checking lobby completion:', error);
    }
}

exports.linkMatchToLobby = async (req, res) => {
    try {
        const { lobbyId } = req.params;
        const { match_id } = req.body;

        if (!match_id) {
            return res.status(400).json({ message: 'match_id обязателен' });
        }

        const lobby = await Lobby.findByPk(lobbyId);
        if (!lobby) {
            return res.status(404).json({ message: 'Лобби не найдено' });
        }

        const [matches] = await sequelize.query(
            'SELECT * FROM matches WHERE match_id = ?',
            { replacements: [match_id] }
        );

        if (matches.length === 0) {
            return res.status(404).json({ message: 'Матч не найден' });
        }

        const match = matches[0];
        if (match.lobby_id !== null) {
            return res.status(400).json({ message: 'Матч уже привязан к другому лобби' });
        }

        await sequelize.query(
            'UPDATE matches SET lobby_id = ? WHERE match_id = ?',
            { replacements: [lobbyId, match_id] }
        );

        await checkLobbyCompletion(lobbyId);

        res.json({ message: 'Матч привязан к лобби', match_id });
    } catch (error) {
        console.error('Error linking match:', error);
        res.status(500).json({ message: 'Ошибка при привязке матча' });
    }
};

exports.unlinkMatchFromLobby = async (req, res) => {
    try {
        const { lobbyId, matchId } = req.params;

        const [result] = await sequelize.query(
            'UPDATE matches SET lobby_id = NULL WHERE match_id = ? AND lobby_id = ?',
            { replacements: [matchId, lobbyId] }
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Матч не найден или не привязан к этому лобби' });
        }

        await checkLobbyCompletion(lobbyId);

        res.json({ message: 'Матч отвязан от лобби' });
    } catch (error) {
        console.error('Error unlinking match:', error);
        res.status(500).json({ message: 'Ошибка при отвязке матча' });
    }
};

exports.getLobbyMatches = async (req, res) => {
    try {
        const { lobbyId } = req.params;

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
            WHERE lobby_id = ?
            ORDER BY game_date ASC
        `, { replacements: [lobbyId] });

        res.json({ matches });
    } catch (error) {
        console.error('Error fetching lobby matches:', error);
        res.status(500).json({ message: 'Ошибка при получении матчей лобби' });
    }
};
