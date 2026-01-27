const { Lobby, Participant, User, SystemSetting, Notification, Match, PlayerMatchStats } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { emitTournamentUpdate, emitDraftUpdate } = require('../websocket');
const { generateVetoSequence } = require('../utils/tournamentLogic');
const sequelize = require('../config/database').sequelize;
const logger = require('../utils/logger');

exports.createLobby = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { name, description, date_time, format, max_participants, map_pool, password, image_url } = req.body;

        if (map_pool && map_pool.length > 7) return res.status(400).json({ message: 'Максимальное количество карт в пуле: 7' });
        const userId = req.user.userId;

        const user = await User.findByPk(userId);
        if (!user || !user.isOrganizer()) return res.status(403).json({ message: 'Доступ запрещен. Требуются права организатора.' });
        if (user.is_blocked) return res.status(403).json({ message: 'Ваш аккаунт заблокирован' });

        const limitSetting = await SystemSetting.findByPk('max_concurrent_matches');
        const limit = limitSetting ? parseInt(limitSetting.value) : 5;

        const activeLobbiesCount = await Lobby.count({
            where: { creator_id: userId, status: { [Op.in]: ['registering', 'in_progress'] } }
        });

        if (activeLobbiesCount >= limit) return res.status(400).json({ message: `Вы достигли лимита активных лобби (${limit}).` });

        const lobby = await Lobby.create({
            name, description, date_time, format,
            max_participants: 10,
            creator_id: userId,
            status: 'registering',
            map_pool: map_pool ? JSON.stringify(map_pool) : JSON.stringify(["Ancient", "Dust II", "Inferno", "Mirage", "Nuke", "Train", "Overpass"]),
            password: password || null,
            image_url: image_url || null
        });

        res.status(201).json(lobby);
    } catch (error) {
        logger.error(`Create lobby error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка при создании лобби' });
    }
};

exports.getLobbies = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { status, limit = 10, offset = 0 } = req.query;
        let userId = (req.user && req.user.userId) ? req.user.userId : 0;

        const [results] = await sequelize.query(`
            SELECT t.id, t.name, t.description, t.image_url, t.format, t.max_participants, t.status, t.date_time, t.created_at,
            CASE WHEN t.password IS NOT NULL AND t.password != '' THEN 1 ELSE 0 END as is_private,
            COUNT(p.id) as current_participants,
            MAX(CASE WHEN p.user_id = :userId THEN 1 ELSE 0 END) as is_joined
            FROM lobbies t
            LEFT JOIN participants p ON t.id = p.tournament_id
            WHERE ${status ? 't.status = :status' : '1=1'}
            GROUP BY t.id
            ORDER BY t.created_at DESC
            LIMIT :limit OFFSET :offset
        `, { replacements: { status: status || null, limit: parseInt(limit), offset: parseInt(offset), userId } });

        const lobbies = results.map(lobby => ({
            ...lobby,
            current_participants: parseInt(lobby.current_participants) || 0,
            is_joined: !!lobby.is_joined,
            is_private: !!lobby.is_private
        }));

        res.json({ tournaments: lobbies });
    } catch (error) {
        logger.error(`Lobbies error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка при получении списка лобби' });
    }
};

exports.joinLobby = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const lobbyId = req.params.id;
        const userId = req.user.userId;

        const user = await User.findByPk(userId, { transaction: t });
        if (user.is_blocked) { await t.rollback(); return res.status(403).json({ message: 'Ваш аккаунт заблокирован' }); }

        const lobby = await Lobby.findByPk(lobbyId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!lobby) { await t.rollback(); return res.status(404).json({ message: 'Лобби не найдено' }); }
        if (lobby.status !== 'registering') { await t.rollback(); return res.status(400).json({ message: 'Регистрация закрыта' }); }

        if (lobby.password && lobby.password !== '') {
            const providedPassword = req.body.password ? req.body.password.trim() : '';
            if (providedPassword !== lobby.password) { await t.rollback(); return res.status(403).json({ message: 'Неверный пароль лобби' }); }
        }

        const existing = await Participant.findOne({ where: { tournament_id: lobbyId, user_id: userId }, transaction: t });
        if (existing) { await t.rollback(); return res.status(400).json({ message: 'Вы уже зарегистрированы' }); }

        const count = await Participant.count({ where: { tournament_id: lobbyId }, transaction: t });
        if (count >= 10) { await t.rollback(); return res.status(400).json({ message: 'Лобби заполнено' }); }

        await Participant.create({ tournament_id: lobbyId, user_id: userId }, { transaction: t });
        await t.commit();

        emitTournamentUpdate(lobbyId, { type: 'participant_update' });
        res.json({ message: 'Вы успешно присоединились к лобби' });
    } catch (error) {
        await t.rollback();
        logger.error(`Join lobby error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка при присоединении' });
    }
};

exports.leaveLobby = async (req, res) => {
    try {
        const lobbyId = req.params.id;
        const userId = req.user.userId;

        const lobby = await Lobby.findByPk(lobbyId);
        if (!lobby) return res.status(404).json({ message: 'Лобби не найдено' });
        if (lobby.status !== 'registering') return res.status(400).json({ message: 'Нельзя покинуть лобби сейчас' });

        const participant = await Participant.findOne({ where: { tournament_id: lobbyId, user_id: userId } });
        if (!participant) return res.status(400).json({ message: 'Вы не зарегистрированы' });

        await participant.destroy();
        emitTournamentUpdate(lobbyId, { type: 'participant_update' });
        res.json({ message: 'Вы покинули лобби' });
    } catch (error) {
        logger.error(`Leave lobby error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка при выходе' });
    }
};

exports.getLobbyDetails = async (req, res) => {
    try {
        const lobbyId = req.params.id;
        const lobby = await Lobby.findByPk(lobbyId, {
            include: [{
                model: User,
                as: 'creator',
                attributes: ['nickname', 'avatar_full']
            }]
        });
        if (!lobby) return res.status(404).json({ message: 'Лобби не найдено' });

        // Debug logging
        // console.log('Lobby fetched:', lobby.id);
        // console.log('Lobby creator:', lobby.creator);

        const [participants] = await sequelize.query(`
            SELECT p.team_number, p.created_at as registered_at, u.id as user_id, u.steam_id, u.nickname, u.custom_url, u.avatar_full,
            COALESCE(ps.k_d_ratio, 0.00) as k_d, COALESCE(ps.win_rate, 0.00) as win_rate, COALESCE(ps.total_matches, 0) as matches
            FROM participants p JOIN users u ON p.user_id = u.id LEFT JOIN player_summary ps ON u.steam_id = ps.player_steamid
            WHERE p.tournament_id = ? ORDER BY p.created_at
        `, { replacements: [lobbyId] });

        const lobbyData = lobby.toJSON();
        // Ensure creator is present in the final object
        if (lobby.creator) {
            lobbyData.creator = lobby.creator.toJSON();
        }

        res.json({
            lobby: { ...lobbyData, current_participants: participants.length },
            participants
        });
    } catch (error) {
        logger.error(`Lobby details error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка при получении лобби' });
    }
};

exports.getParticipants = async (req, res) => {
    try {
        const lobbyId = req.params.id;
        const [participants] = await sequelize.query(`
            SELECT p.team_number, p.created_at as registered_at, u.id as user_id, u.nickname, u.username,
            COALESCE(ps.k_d_ratio, 0.00) as k_d, COALESCE(ps.win_rate, 0.00) as win_rate
            FROM participants p JOIN users u ON p.user_id = u.id LEFT JOIN player_summary ps ON u.steam_id = ps.player_steamid
            WHERE p.tournament_id = ? ORDER BY p.created_at
        `, { replacements: [lobbyId] });
        res.json({ participants });
    } catch (error) {
        logger.error(`Participants error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка при получении участников' });
    }
};

exports.kickParticipant = async (req, res) => {
    try {
        const { user_id } = req.body;
        const lobbyId = req.params.id;
        const requesterId = req.user.userId;

        const lobby = await Lobby.findByPk(lobbyId);
        if (!lobby) return res.status(404).json({ message: 'Лобби не найдено' });

        const user = await User.findByPk(requesterId);
        if (lobby.creator_id !== requesterId && !user.isAdmin()) return res.status(403).json({ message: 'Нет прав' });
        if (lobby.status !== 'registering') return res.status(400).json({ message: 'Лобби уже началось' });

        await Participant.destroy({ where: { tournament_id: lobbyId, user_id } });
        emitTournamentUpdate(lobbyId, { type: 'participant_update' });
        res.json({ message: 'Участник исключен' });
    } catch (error) {
        logger.error(`Kick error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка при исключении' });
    }
};

exports.resetLobby = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const lobbyId = req.params.id;
        const requesterId = req.user.userId;

        const lobby = await Lobby.findByPk(lobbyId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!lobby) { await t.rollback(); return res.status(404).json({ message: 'Лобби не найдено' }); }

        const user = await User.findByPk(requesterId);
        if (lobby.creator_id !== requesterId && !user.isAdmin()) { await t.rollback(); return res.status(403).json({ message: 'Нет прав' }); }

        if (lobby.status !== 'drafting' && lobby.status !== 'in_progress') { await t.rollback(); return res.status(400).json({ message: 'Нельзя сбросить' }); }

        lobby.status = 'registering';
        lobby.draft_state = null;
        lobby.captain1_id = null;
        lobby.captain2_id = null;
        await lobby.save({ transaction: t });
        await Participant.update({ team_number: null }, { where: { tournament_id: lobbyId }, transaction: t });
        await t.commit();

        emitTournamentUpdate(lobbyId, { status: 'registering', draft_state: null });
        res.json({ message: 'Лобби сброшено' });
    } catch (error) {
        await t.rollback();
        logger.error(`Reset error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка сброса' });
    }
};

exports.cancelLobby = async (req, res) => {
    try {
        const lobbyId = req.params.id;
        const requesterId = req.user.userId;
        const lobby = await Lobby.findByPk(lobbyId);
        if (!lobby) return res.status(404).json({ message: 'Лобби не найдено' });

        const user = await User.findByPk(requesterId);
        if (lobby.creator_id !== requesterId && !user.isAdmin()) return res.status(403).json({ message: 'Нет прав' });

        lobby.status = 'cancelled';
        await lobby.save();
        emitTournamentUpdate(lobbyId, { status: 'cancelled' });
        res.json({ message: 'Лобби отменено' });
    } catch (error) {
        logger.error(`Cancel error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка при отмене' });
    }
};

exports.startAuto = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const lobbyId = req.params.id;
        const requesterId = req.user.userId;

        const lobby = await Lobby.findByPk(lobbyId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!lobby) { await t.rollback(); return res.status(404).json({ message: 'Лобби не найдено' }); }
        if (lobby.creator_id !== requesterId) { await t.rollback(); return res.status(403).json({ message: 'Нет прав' }); }

        const [participantsData] = await sequelize.query(`
            SELECT p.user_id, ps.rating FROM participants p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN player_summary ps ON u.steam_id = ps.player_steamid
            WHERE p.tournament_id = ?
        `, { replacements: [lobbyId], transaction: t });

        const participants = participantsData.map(p => ({
            user_id: p.user_id,
            rating: (parseInt(p.rating) || 1500) + (parseInt(p.rating) || 1500) * 0.1 * (Math.random() - 0.5)
        })).sort((a, b) => b.rating - a.rating);

        if (participants.length !== 10) { await t.rollback(); return res.status(400).json({ message: 'Нужно 10 участников' }); }

        const team1 = [], team2 = [];
        for (let i = 0; i < participants.length; i++) {
            const team = (Math.floor(i / 2) % 2 === 0) ? (i % 2 === 0 ? 1 : 2) : (i % 2 === 0 ? 2 : 1);
            await Participant.update({ team_number: team }, { where: { tournament_id: lobbyId, user_id: participants[i].user_id }, transaction: t });
            if (team === 1) team1.push(participants[i].user_id); else team2.push(participants[i].user_id);
        }

        const captain1 = team1[Math.floor(Math.random() * team1.length)];
        const captain2 = team2[Math.floor(Math.random() * team2.length)];
        const mapPool = JSON.parse(lobby.map_pool || '[]');
        const sequence = generateVetoSequence(lobby.format || 'BO3', mapPool.length);

        const draftState = {
            stage: 'team_naming',
            captains: { 1: captain1, 2: captain2 },
            teams: { 1: { players: team1, name: null }, 2: { players: team2, name: null } },
            pool: [], turn: captain1,
            veto: { sequence, current_step: 0, banned: [], picked: [] }
        };

        lobby.status = 'drafting';
        lobby.draft_state = draftState;
        lobby.captain1_id = captain1;
        lobby.captain2_id = captain2;
        await lobby.save({ transaction: t });
        await t.commit();

        emitTournamentUpdate(lobbyId, { status: 'drafting', draft_state: draftState });
        emitDraftUpdate(lobbyId, draftState);
        res.json({ message: 'Лобби запущено' });
    } catch (error) {
        await t.rollback();
        logger.error(`Start auto error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка запуска' });
    }
};

exports.startDraft = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const lobbyId = req.params.id;
        const requesterId = req.user.userId;

        const lobby = await Lobby.findByPk(lobbyId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!lobby) { await t.rollback(); return res.status(404).json({ message: 'Лобби не найдено' }); }
        if (lobby.creator_id !== requesterId) { await t.rollback(); return res.status(403).json({ message: 'Нет прав' }); }

        const participants = await Participant.findAll({ where: { tournament_id: lobbyId }, transaction: t });
        if (participants.length !== 10) { await t.rollback(); return res.status(400).json({ message: 'Нужно 10 участников' }); }

        const pool = participants.map(p => p.user_id);
        const draftState = {
            stage: 'captains_selection', pool, captains: {}, teams: { 1: [], 2: [] }, turn: null,
            veto: { banned: [], picked: [], sequence: [] }
        };

        lobby.status = 'drafting';
        lobby.draft_state = draftState;
        await lobby.save({ transaction: t });
        await t.commit();

        emitTournamentUpdate(lobbyId, { status: 'drafting', draft_state: draftState });
        emitDraftUpdate(lobbyId, draftState);
        res.json({ message: 'Драфт запущен', draft_state: draftState });
    } catch (error) {
        await t.rollback();
        logger.error(`Start draft error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка запуска драфта' });
    }
};

exports.setCaptains = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { captain1_id, captain2_id } = req.body;
        const lobbyId = req.params.id;
        const requesterId = req.user.userId;

        const lobby = await Lobby.findByPk(lobbyId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!lobby) { await t.rollback(); return res.status(404).json({ message: 'Лобби не найдено' }); }
        if (lobby.creator_id !== requesterId) { await t.rollback(); return res.status(403).json({ message: 'Нет прав' }); }

        let state = typeof lobby.draft_state === 'string' ? JSON.parse(lobby.draft_state) : lobby.draft_state;
        if (state.stage !== 'captains_selection') { await t.rollback(); return res.status(400).json({ message: 'Неверная стадия' }); }

        state.pool = state.pool.filter(id => id !== captain1_id && id !== captain2_id);
        state.captains = { 1: captain1_id, 2: captain2_id };
        state.teams = { 1: { players: [captain1_id], name: null }, 2: { players: [captain2_id], name: null } };

        const winner = Math.random() > 0.5 ? captain1_id : captain2_id;
        state.turn = winner;
        state.first_pick_captain = winner;
        state.stage = 'team_naming';

        lobby.draft_state = state;
        lobby.captain1_id = captain1_id;
        lobby.captain2_id = captain2_id;
        await lobby.save({ transaction: t });

        await Participant.update({ team_number: 1 }, { where: { tournament_id: lobbyId, user_id: captain1_id }, transaction: t });
        await Participant.update({ team_number: 2 }, { where: { tournament_id: lobbyId, user_id: captain2_id }, transaction: t });
        await t.commit();

        emitDraftUpdate(lobbyId, state);
        res.json({ message: 'Капитаны выбраны', draft_state: state });
    } catch (error) {
        await t.rollback();
        logger.error(`Set captains error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка' });
    }
};

exports.setTeamNames = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { name } = req.body;
        const lobbyId = req.params.id;
        const requesterId = req.user.userId;

        const lobby = await Lobby.findByPk(lobbyId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!lobby) { await t.rollback(); return res.status(404).json({ message: 'Лобби не найдено' }); }

        let state = typeof lobby.draft_state === 'string' ? JSON.parse(lobby.draft_state) : lobby.draft_state;
        if (state.stage !== 'team_naming') { await t.rollback(); return res.status(400).json({ message: 'Неверная стадия' }); }

        let teamNum = state.captains[1] === requesterId ? 1 : state.captains[2] === requesterId ? 2 : null;
        if (!teamNum) { await t.rollback(); return res.status(403).json({ message: 'Вы не капитан' }); }

        state.teams[teamNum].name = name;

        if (state.teams[1].name && state.teams[2].name) {
            const isAutoBalance = state.teams[1].players.length > 1;
            if (isAutoBalance) {
                state.stage = 'veto';
                state.turn = state.captains[1];
            } else {
                state.stage = 'player_picking';
                state.turn = state.first_pick_captain;
            }
        }

        lobby.draft_state = state;
        await lobby.save({ transaction: t });
        await t.commit();

        emitDraftUpdate(lobbyId, state);
        res.json({ message: 'Название установлено', draft_state: state });
    } catch (error) {
        await t.rollback();
        logger.error(`Set team name error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка' });
    }
};

exports.draftPick = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { picked_user_id } = req.body;
        const lobbyId = req.params.id;
        const requesterId = req.user.userId;

        const lobby = await Lobby.findByPk(lobbyId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!lobby) { await t.rollback(); return res.status(404).json({ message: 'Лобби не найдено' }); }

        let state = typeof lobby.draft_state === 'string' ? JSON.parse(lobby.draft_state) : lobby.draft_state;
        if (state.stage !== 'player_picking') { await t.rollback(); return res.status(400).json({ message: 'Не стадия пика' }); }
        if (state.turn !== requesterId) { await t.rollback(); return res.status(403).json({ message: 'Не ваш ход' }); }
        if (!state.pool.includes(picked_user_id)) { await t.rollback(); return res.status(400).json({ message: 'Игрок не в пуле' }); }

        let teamNum = state.captains[1] === requesterId ? 1 : 2;
        state.teams[teamNum].players.push(picked_user_id);
        state.pool = state.pool.filter(id => id !== picked_user_id);

        await Participant.update({ team_number: teamNum }, { where: { tournament_id: lobbyId, user_id: picked_user_id }, transaction: t });

        state.turn = state.turn === state.captains[1] ? state.captains[2] : state.captains[1];

        if (state.pool.length === 0) {
            state.stage = 'veto';
            state.turn = state.captains[1];

            if (!state.veto || !state.veto.sequence || state.veto.sequence.length === 0) {
                const mapPool = JSON.parse(lobby.map_pool || '[]');
                const format = lobby.format || 'BO3';
                console.log(`[DraftPick] Generating sequence for Lobby ${lobbyId}. Format: ${format}, Pool: ${mapPool.length}`);

                state.veto = {
                    sequence: generateVetoSequence(format, mapPool.length),
                    current_step: 0,
                    banned: [],
                    picked: []
                };
            }
        }

        lobby.draft_state = state;
        await lobby.save({ transaction: t });
        await t.commit();

        emitDraftUpdate(lobbyId, state);
        res.json({ message: 'Игрок выбран', draft_state: state });
    } catch (error) {
        await t.rollback();
        logger.error(`Draft pick error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка пика' });
    }
};

exports.vetoMap = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { map_name, action } = req.body;
        const lobbyId = req.params.id;
        const requesterId = req.user.userId;

        const lobby = await Lobby.findByPk(lobbyId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!lobby) { await t.rollback(); return res.status(404).json({ message: 'Лобби не найдено' }); }

        let state = typeof lobby.draft_state === 'string' ? JSON.parse(lobby.draft_state) : lobby.draft_state;
        if (state.stage !== 'veto') { await t.rollback(); return res.status(400).json({ message: 'Не стадия вето' }); }
        if (state.turn !== requesterId) { await t.rollback(); return res.status(403).json({ message: 'Не ваш ход' }); }

        const currentAction = state.veto.sequence[state.veto.current_step];
        if (action && action !== currentAction) { await t.rollback(); return res.status(400).json({ message: `Ожидалось: ${currentAction}` }); }

        // Check if map is already used
        const usedMaps = [...state.veto.banned, ...state.veto.picked.map(p => p.map)];
        if (usedMaps.includes(map_name)) { await t.rollback(); return res.status(400).json({ message: 'Карта уже использована' }); }

        if (currentAction === 'ban') state.veto.banned.push(map_name);
        else state.veto.picked.push({ map: map_name, picked_by: requesterId === state.captains[1] ? 1 : 2 });

        state.veto.current_step++;

        if (state.veto.current_step >= state.veto.sequence.length) {
            state.stage = 'completed';
            lobby.status = 'in_progress';

            const finalUsedMaps = [...state.veto.banned, ...state.veto.picked.map(p => p.map)];
            const mapPool = JSON.parse(lobby.map_pool || '[]');
            const remaining = mapPool.filter(m => !finalUsedMaps.includes(m));

            console.log(`[VetoComplete] Lobby ${lobbyId}. Used: ${finalUsedMaps.length}, Remaining: ${remaining.length}`);

            if (remaining.length === 1) {
                state.veto.picked.push({ map: remaining[0], picked_by: 'decider' });
            } else if (remaining.length > 0) {
                console.warn(`[VetoComplete] Unexpected remaining maps: ${remaining.join(', ')}`);
                if (lobby.format === 'BO5' && state.veto.picked.length < 5) {
                    state.veto.picked.push({ map: remaining[0], picked_by: 'decider' });
                }
            }
        } else {
            state.turn = state.turn === state.captains[1] ? state.captains[2] : state.captains[1];
        }

        lobby.draft_state = state;
        await lobby.save({ transaction: t });
        await t.commit();

        emitDraftUpdate(lobbyId, state);
        if (lobby.status === 'in_progress') emitTournamentUpdate(lobbyId, { status: 'in_progress' });

        res.json({ message: 'Вето обновлено', draft_state: state });
    } catch (error) {
        await t.rollback();
        logger.error(`Veto error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка вето' });
    }
};

exports.invite = async (req, res) => {
    try {
        const { user_id } = req.body;
        const lobbyId = req.params.id;
        const requesterId = req.user.userId;

        const lobby = await Lobby.findByPk(lobbyId);
        if (!lobby) return res.status(404).json({ message: 'Лобби не найдено' });
        if (lobby.creator_id !== requesterId) return res.status(403).json({ message: 'Нет прав' });

        await Notification.create({
            user_id: user_id,
            type: 'lobby_invite',
            message: `Вас пригласили в лобби ${lobby.name}`,
            related_id: lobby.id,
            link: `/lobbies/${lobby.id}`,
            data: JSON.stringify({ lobbyId: lobby.id })
        });

        res.json({ message: 'Приглашение отправлено' });
    } catch (error) {
        logger.error(`Invite error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка приглашения' });
    }
};

exports.updateLobby = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const lobbyId = req.params.id;
        const { name, description, date_time, map_pool, format, image_url } = req.body;
        const requesterId = req.user.userId;

        const lobby = await Lobby.findByPk(lobbyId);
        if (!lobby) return res.status(404).json({ message: 'Лобби не найдено' });

        const user = await User.findByPk(requesterId);
        if (lobby.creator_id !== requesterId && !user.isAdmin()) {
            return res.status(403).json({ message: 'Нет прав' });
        }

        if (lobby.status !== 'registering') {
            return res.status(400).json({ message: 'Нельзя редактировать лобби после начала' });
        }

        if (name) lobby.name = name;
        if (description !== undefined) lobby.description = description;
        if (date_time) lobby.date_time = date_time;
        if (format) lobby.format = format;
        if (image_url !== undefined) lobby.image_url = image_url;
        if (map_pool) {
            if (map_pool.length > 7) return res.status(400).json({ message: 'Максимум 7 карт' });
            lobby.map_pool = JSON.stringify(map_pool);
        }

        await lobby.save();

        emitTournamentUpdate(lobbyId, { type: 'update', lobby });

        res.json(lobby);
    } catch (error) {
        logger.error(`Update lobby error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка обновления лобби' });
    }
};

exports.getLobbyMatches = async (req, res) => {
    try {
        const { id } = req.params;

        const matches = await Match.findAll({
            where: { lobby_id: id },
            order: [['match_id', 'ASC']]
        });

        res.json({ matches });
    } catch (error) {
        logger.error(`Get lobby matches error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка при получении матчей лобби' });
    }
};

exports.getMatchStats = async (req, res) => {
    try {
        const { id } = req.params;

        const match = await Match.findByPk(id, {
            include: [{
                model: PlayerMatchStats,
                as: 'playerStats'
            }]
        });

        if (!match) {
            return res.status(404).json({ message: 'Матч не найден' });
        }

        res.json(match);
    } catch (error) {
        logger.error(`Get match stats error: ${error.message}`);
        res.status(500).json({ message: 'Ошибка при получении статистики матча' });
    }
};
