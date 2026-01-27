const { Tournament, TournamentTeam, TournamentBracket, Team, User, Match, sequelize } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { propagateWinner } = require('../utils/tournamentLogic');

exports.getTournaments = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { status, limit = 10, offset = 0 } = req.query;
        const where = {};
        if (status) where.status = status;

        const tournaments = await Tournament.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['start_date', 'ASC']],
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM tournament_teams AS tt
                            WHERE
                                tt.tournament_id = Tournament.id
                        )`),
                        'teams_count'
                    ]
                ]
            }
        });

        res.json({
            tournaments: tournaments.rows,
            total: tournaments.count
        });
    } catch (error) {
        console.error('Get tournaments error:', error);
        res.status(500).json({ message: 'Ошибка при получении турниров' });
    }
};

exports.getTournamentTeams = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const teams = await TournamentTeam.findAll({
            where: { tournament_id: req.params.id },
            include: [{ model: Team, as: 'team' }]
        });
        res.json(teams);
    } catch (error) {
        console.error('Get tournament teams error:', error);
        res.status(500).json({ message: 'Ошибка при получении команд турнира' });
    }
};

exports.getTournamentBrackets = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const brackets = await TournamentBracket.findAll({
            where: { tournament_id: req.params.id },
            include: [
                { model: Team, as: 'team1' },
                { model: Team, as: 'team2' },
                { model: Team, as: 'winner' },
                { model: Match, as: 'parserMatches' }
            ]
        });

        const safeBrackets = brackets.map(b => {
            const bracket = b.toJSON();
            if (bracket.map_state && typeof bracket.map_state === 'string') {
                try {
                    bracket.map_state = JSON.parse(bracket.map_state);
                    if (typeof bracket.map_state === 'string') {
                        bracket.map_state = JSON.parse(bracket.map_state);
                    }
                } catch (e) {
                    console.error('Error parsing map_state for bracket:', bracket.id, e);
                    bracket.map_state = null;
                }
            }
            return bracket;
        });

        res.json(safeBrackets);
    } catch (error) {
        console.error('Get brackets error:', error);
        res.status(500).json({ message: 'Ошибка при получении сетки' });
    }
};

exports.getTournamentDetails = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const tournamentId = req.params.id;
        const tournament = await Tournament.findByPk(tournamentId, {
            include: [
                {
                    model: TournamentBracket,
                    as: 'brackets',
                    include: [
                        { model: Team, as: 'team1' },
                        { model: Team, as: 'team2' },
                        { model: Team, as: 'winner' },
                        { model: Match, as: 'parserMatches' }
                    ]
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'nickname', 'avatar_full']
                }
            ]
        });

        if (!tournament) return res.status(404).json({ message: 'Турнир не найден' });

        const teams = await TournamentTeam.findAll({
            where: { tournament_id: tournamentId },
            include: [{ model: Team, as: 'team' }]
        });

        const tournamentData = tournament.toJSON();

        if (tournamentData.brackets) {
            tournamentData.brackets.forEach(bracket => {
                if (bracket.map_state && typeof bracket.map_state === 'string') {
                    try {
                        bracket.map_state = JSON.parse(bracket.map_state);
                        if (typeof bracket.map_state === 'string') {
                            bracket.map_state = JSON.parse(bracket.map_state);
                        }
                    } catch (e) {
                        console.error('Error parsing map_state for bracket:', bracket.id, e);
                        bracket.map_state = null;
                    }
                }
            });
        }

        if (tournamentData.map_pool && typeof tournamentData.map_pool === 'string') {
            try {
                tournamentData.map_pool = JSON.parse(tournamentData.map_pool);
            } catch (e) {
                console.error('Error parsing map_pool:', e);
                tournamentData.map_pool = [];
            }
        }

        if (tournamentData.prize_distribution && typeof tournamentData.prize_distribution === 'string') {
            try {
                tournamentData.prize_distribution = JSON.parse(tournamentData.prize_distribution);
            } catch (e) {
                console.error('Error parsing prize_distribution:', e);
                tournamentData.prize_distribution = [];
            }
        }

        tournamentData.teams = teams;
        tournamentData.teams_count = teams.length;

        res.json(tournamentData);
    } catch (error) {
        console.error('Get tournament details error:', error);
        res.status(500).json({ message: 'Ошибка при получении турнира' });
    }
};

exports.createTournament = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, format, max_teams, start_date, prize_pool, rules, round_config, banner_url, map_pool, prize_distribution, registration_start_date, registration_end_date } = req.body;
        const userId = req.user.userId;

        const user = await User.findByPk(userId);
        if (!user.isOrganizer()) return res.status(403).json({ message: 'Требуются права организатора' });

        const tournament = await Tournament.create({
            name,
            description,
            format,
            max_teams,
            start_date,
            registration_start_date,
            registration_end_date,
            prize_pool,
            rules,
            round_config,
            banner_url,
            map_pool,
            prize_distribution,
            creator_id: userId,
            status: 'upcoming'
        });

        res.status(201).json(tournament);
    } catch (error) {
        console.error('Create tournament error:', error);
        res.status(500).json({ message: 'Ошибка при создании турнира' });
    }
};

exports.updateTournament = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const tournamentId = req.params.id;
        const userId = req.user.userId;
        const { name, description, format, max_teams, start_date, prize_pool, rules, map_pool, registration_start_date, registration_end_date } = req.body;

        const tournament = await Tournament.findByPk(tournamentId);
        if (!tournament) return res.status(404).json({ message: 'Турнир не найден' });

        if (tournament.creator_id !== userId && req.user.role !== 2) {
            return res.status(403).json({ message: 'Нет прав на редактирование этого турнира' });
        }

        await tournament.update({
            name,
            description,
            format,
            max_teams,
            start_date,
            prize_pool,
            rules,
            map_pool,
            registration_start_date,
            registration_end_date
        });

        res.json(tournament);
    } catch (error) {
        console.error('Update tournament error:', error);
        res.status(500).json({ message: 'Ошибка при обновлении турнира' });
    }
};

exports.registerTeam = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { team_id } = req.body;
        const teamIdInt = team_id;
        const userId = req.user.userId;
        const tournamentId = req.params.id;

        const tournament = await Tournament.findByPk(tournamentId);
        if (!tournament) return res.status(404).json({ message: 'Турнир не найден' });
        if (tournament.status !== 'upcoming' && tournament.status !== 'registration') {
            return res.status(400).json({ message: 'Регистрация закрыта' });
        }

        const team = await Team.findByPk(teamIdInt);
        if (!team) return res.status(404).json({ message: 'Команда не найдена' });
        if (team.captain_id !== userId) return res.status(403).json({ message: 'Только капитан может регистрировать команду' });

        const existing = await TournamentTeam.findOne({ where: { tournament_id: tournamentId, team_id: teamIdInt } });
        if (existing) return res.status(400).json({ message: 'Команда уже зарегистрирована' });

        const count = await TournamentTeam.count({ where: { tournament_id: tournamentId } });
        if (count >= tournament.max_teams) return res.status(400).json({ message: 'Турнир заполнен' });

        await TournamentTeam.create({
            tournament_id: tournamentId,
            team_id: teamIdInt,
            status: 'registered'
        });

        const newCount = await TournamentTeam.count({ where: { tournament_id: tournamentId } });
        if (newCount >= tournament.max_teams) {
            tournament.status = 'registration_closed';
            await tournament.save();
        }

        res.json({ message: 'Команда зарегистрирована' });
    } catch (error) {
        console.error('Register team error:', error);
        res.status(500).json({ message: 'Ошибка регистрации' });
    }
};

exports.leaveTournament = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.userId;
        const tournamentId = req.params.id;

        const tournament = await Tournament.findByPk(tournamentId);
        if (!tournament) return res.status(404).json({ message: 'Турнир не найден' });

        if (tournament.status !== 'upcoming' && tournament.status !== 'registration' && tournament.status !== 'registration_closed') {
            return res.status(400).json({ message: 'Нельзя покинуть турнир на этой стадии' });
        }

        const participant = await TournamentTeam.findOne({
            where: { tournament_id: tournamentId },
            include: [{
                model: Team,
                as: 'team',
                where: { captain_id: userId }
            }]
        });

        if (!participant) {
            return res.status(404).json({ message: 'Вы не зарегистрированы в этом турнире как капитан' });
        }

        await participant.destroy();

        if (tournament.status === 'registration_closed') {
            tournament.status = 'upcoming';
            await tournament.save();
        }

        res.json({ message: 'Вы покинули турнир' });
    } catch (error) {
        console.error('Leave tournament error:', error);
        res.status(500).json({ message: 'Ошибка при выходе из турнира' });
    }
};

exports.startTournament = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const tournamentId = req.params.id;
        const userId = req.user.userId;

        const tournament = await Tournament.findByPk(tournamentId);
        if (!tournament) return res.status(404).json({ message: 'Турнир не найден' });
        if (tournament.creator_id !== userId && req.user.role !== 2) return res.status(403).json({ message: 'Нет прав' });

        const teams = await TournamentTeam.findAll({
            where: { tournament_id: tournamentId },
            include: [{ model: Team, as: 'team' }]
        });

        if (teams.length < 2) return res.status(400).json({ message: 'Недостаточно команд' });

        const shuffled = teams.sort(() => 0.5 - Math.random());

        let bracketSize = 2;
        while (bracketSize < tournament.max_teams) bracketSize *= 2;

        const slots = new Array(bracketSize).fill(null);
        for (let i = 0; i < shuffled.length; i++) {
            slots[i] = shuffled[i].team_id;
        }

        const createdMatches = [];
        let roundConfig = tournament.round_config || {};
        if (typeof roundConfig === 'string') {
            try {
                roundConfig = JSON.parse(roundConfig);
            } catch (e) {
                console.error('Error parsing round_config:', e);
                roundConfig = {};
            }
        }
        console.log('[TOURNAMENT START] Round Config:', JSON.stringify(roundConfig, null, 2));

        const getMatchType = (round, group) => {
            let key = `${group}_${round}`;
            if (group === 'final') key = 'final';

            let type = roundConfig[key] || roundConfig[round];
            console.log(`[TOURNAMENT START] getMatchType round=${round} group=${group} key=${key} type=${type}`);

            if (type && ['bo1', 'bo3', 'bo5'].includes(type.toLowerCase())) {
                return type.toLowerCase();
            }

            return 'bo1';
        };

        let round = 1;
        let currentRoundMatches = bracketSize / 2;
        const upperRounds = Math.log2(bracketSize);

        while (currentRoundMatches >= 1) {
            for (let i = 0; i < currentRoundMatches; i++) {
                const match = await TournamentBracket.create({
                    tournament_id: tournamentId,
                    round: round,
                    match_number: i + 1,
                    team1_id: null,
                    team2_id: null,
                    status: 'scheduled',
                    group: 'upper',
                    match_type: getMatchType(round, 'upper')
                });
                createdMatches.push(match);
            }
            currentRoundMatches /= 2;
            round++;
        }

        if (tournament.format === 'double_elimination') {
            const totalLowerRounds = (upperRounds - 1) * 2;
            let lowerMatchesCount = bracketSize / 4;

            for (let r = 1; r <= totalLowerRounds; r++) {
                if (r > 1 && r % 2 !== 0) {
                    lowerMatchesCount /= 2;
                }

                for (let i = 0; i < lowerMatchesCount; i++) {
                    const match = await TournamentBracket.create({
                        tournament_id: tournamentId,
                        round: r,
                        match_number: i + 1,
                        team1_id: null,
                        team2_id: null,
                        status: 'scheduled',
                        group: 'lower',
                        match_type: getMatchType(r, 'lower')
                    });
                    createdMatches.push(match);
                }
            }

            const finalMatch = await TournamentBracket.create({
                tournament_id: tournamentId,
                round: upperRounds + 1,
                match_number: 1,
                team1_id: null,
                team2_id: null,
                status: 'scheduled',
                group: 'final',
                match_type: getMatchType(upperRounds + 1, 'final')
            });
            createdMatches.push(finalMatch);
        }

        const round1Matches = createdMatches.filter(m => m.round === 1 && m.group === 'upper');

        for (let i = 0; i < round1Matches.length; i++) {
            const match = round1Matches[i];
            const team1Id = slots[i * 2];
            const team2Id = slots[i * 2 + 1];

            match.team1_id = team1Id;
            match.team2_id = team2Id;

            if (team1Id && team2Id) {
                match.status = 'scheduled';
            } else if (team1Id && !team2Id) {
                match.winner_id = team1Id;
                match.status = 'completed';
            } else if (!team1Id && team2Id) {
                match.winner_id = team2Id;
                match.status = 'completed';
            } else {
                match.status = 'completed';
                match.winner_id = null;
            }

            await match.save();

            if (match.status === 'completed') {
                await propagateWinner(match, createdMatches, tournament.format);
            }
        }

        tournament.status = 'ongoing';
        await tournament.save();

        res.json({ message: 'Турнир начат, сетка сгенерирована' });
    } catch (error) {
        console.error('Start tournament error:', error);
        res.status(500).json({ message: 'Ошибка старта турнира' });
    }
};

exports.updateMatchResult = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await t.rollback();
            return res.status(400).json({ errors: errors.array() });
        }

        const { winner_id, map_results } = req.body;
        const { id, matchId } = req.params;
        const userId = req.user.userId;

        const tournament = await Tournament.findByPk(id);
        if (!tournament) {
            await t.rollback();
            return res.status(404).json({ message: 'Турнир не найден' });
        }

        if (tournament.creator_id !== userId && req.user.role !== 2) {
            await t.rollback();
            return res.status(403).json({ message: 'Нет прав' });
        }

        const match = await TournamentBracket.findByPk(matchId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!match) {
            await t.rollback();
            return res.status(404).json({ message: 'Матч не найден' });
        }

        if (map_results) {
            const state = match.map_state || {};
            if (!state.picked) state.picked = [];

            const { map_index, score1, score2, map_winner_id } = map_results;

            if (state.picked[map_index]) {
                state.picked[map_index].score1 = score1;
                state.picked[map_index].score2 = score2;
                state.picked[map_index].winner_id = map_winner_id;
                state.picked[map_index].status = 'completed';
            }

            match.map_state = state;
            match.changed('map_state', true);

            let wins1 = 0;
            let wins2 = 0;
            state.picked.forEach(map => {
                if (map.winner_id === match.team1_id) wins1++;
                if (map.winner_id === match.team2_id) wins2++;
            });

            const matchType = match.match_type || 'bo1';
            let requiredWins = 1;
            if (matchType === 'bo3') requiredWins = 2;
            if (matchType === 'bo5') requiredWins = 3;

            if (wins1 >= requiredWins) {
                match.winner_id = match.team1_id;
                match.status = 'completed';
            } else if (wins2 >= requiredWins) {
                match.winner_id = match.team2_id;
                match.status = 'completed';
            } else {
                match.status = 'live';
            }

            await match.save({ transaction: t });
        }
        else if (winner_id) {
            match.winner_id = winner_id;
            match.status = 'completed';
            await match.save({ transaction: t });
        }

        await t.commit();

        if (match.status === 'completed' && match.winner_id) {
            const allMatches = await TournamentBracket.findAll({ where: { tournament_id: id } });
            await propagateWinner(match, allMatches, tournament.format);

            if (match.group === 'final') {
                tournament.status = 'completed';
                await tournament.save();
            }
            else if (tournament.format !== 'double_elimination') {
                const totalRounds = Math.max(...allMatches.map(m => m.round));
                if (match.round === totalRounds) {
                    tournament.status = 'completed';
                    await tournament.save();
                }
            }
        }

        res.json({ message: 'Результат обновлен', match });
    } catch (error) {
        await t.rollback();
        console.error('Update match error:', error);
        res.status(500).json({ message: 'Ошибка при обновлении матча' });
    }
};

exports.performMapVeto = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await t.rollback();
            return res.status(400).json({ errors: errors.array() });
        }

        const { id, matchId } = req.params;
        const { map_name, action } = req.body;
        const userId = req.user.userId;

        console.log(`[VETO START] Request from User ${userId} for Match ${matchId}. Map: ${map_name}, Action: ${action}`);

        const match = await TournamentBracket.findByPk(matchId, {
            include: [
                { model: Team, as: 'team1' },
                { model: Team, as: 'team2' }
            ],
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!match) {
            console.log('[VETO ERROR] Match not found');
            await t.rollback();
            return res.status(404).json({ message: 'Матч не найден' });
        }

        if (match.map_state && typeof match.map_state === 'string') {
            try {
                match.map_state = JSON.parse(match.map_state);
                if (typeof match.map_state === 'string') {
                    match.map_state = JSON.parse(match.map_state);
                }
            } catch (e) {
                console.error('[VETO ERROR] Failed to parse map_state:', e);
                match.map_state = null;
            }
        }

        console.log(`[VETO DEBUG] Match found. Type: ${match.match_type}. State exists: ${!!match.map_state}`);

        if (!match.map_state || action === 'start') {
            console.log('[VETO DEBUG] Initializing map_state...');
            if (match.map_state && action === 'start') {
                console.log('[VETO INFO] Already started');
                await t.rollback();
                return res.json({ message: 'Вето уже началось', map_state: match.map_state });
            }

            const matchType = (match.match_type || 'bo1').toString().toLowerCase().trim();
            let sequence = [];

            if (matchType === 'bo1') sequence = ['ban', 'ban', 'ban', 'ban', 'ban', 'ban'];
            else if (matchType === 'bo3') sequence = ['ban', 'ban', 'pick', 'pick', 'ban', 'ban'];
            else if (matchType === 'bo5') sequence = ['ban', 'ban', 'pick', 'pick', 'pick', 'pick'];
            else sequence = ['ban', 'ban', 'pick', 'pick', 'ban', 'ban'];

            const team1Id = match.team1 ? match.team1.captain_id : null;
            const team2Id = match.team2 ? match.team2.captain_id : null;

            if (!team1Id || !team2Id) {
                console.log('[VETO ERROR] Missing captains');
                await t.rollback();
                return res.status(400).json({ message: 'Не у всех команд есть капитаны' });
            }

            const initialState = {
                stage: 'veto',
                pool: ["Ancient", "Dust II", "Inferno", "Mirage", "Nuke", "Train", "Overpass"],
                banned: [],
                picked: [],
                sequence: sequence,
                current_step: 0,
                turn: team1Id,
                captains: { 1: team1Id, 2: team2Id }
            };

            match.map_state = initialState;
            match.changed('map_state', true);
            await match.save({ transaction: t });
            await t.commit();
            console.log('[VETO SUCCESS] Initialization complete');
            return res.json({ message: 'Вето началось', map_state: initialState });
        }

        let state = JSON.parse(JSON.stringify(match.map_state));

        if (state.turn === undefined) {
            console.log('[VETO WARNING] Old map_state detected (missing turn). Re-initializing...');
            match.map_state = null;

            const matchType = (match.match_type || 'bo1').toString().toLowerCase().trim();
            let sequence = [];

            if (matchType === 'bo1') sequence = ['ban', 'ban', 'ban', 'ban', 'ban', 'ban'];
            else if (matchType === 'bo3') sequence = ['ban', 'ban', 'pick', 'pick', 'ban', 'ban'];
            else if (matchType === 'bo5') sequence = ['ban', 'ban', 'pick', 'pick', 'pick', 'pick'];
            else sequence = ['ban', 'ban', 'pick', 'pick', 'ban', 'ban'];

            const team1Id = match.team1 ? match.team1.captain_id : null;
            const team2Id = match.team2 ? match.team2.captain_id : null;

            if (!team1Id || !team2Id) {
                await t.rollback();
                return res.status(400).json({ message: 'Не у всех команд есть капитаны' });
            }

            const initialState = {
                stage: 'veto',
                pool: ["Ancient", "Dust II", "Inferno", "Mirage", "Nuke", "Train", "Overpass"],
                banned: [],
                picked: [],
                sequence: sequence,
                current_step: 0,
                turn: team1Id,
                captains: { 1: team1Id, 2: team2Id }
            };

            match.map_state = initialState;
            match.changed('map_state', true);
            await match.save({ transaction: t });
            await t.commit();
            return res.json({ message: 'Состояние обновлено (migration). Повторите действие.', map_state: initialState });
        }

        if (String(state.turn) !== String(userId)) {
            await t.rollback();
            console.log(`[VETO ERROR] Turn mismatch. Expected: ${state.turn} (type: ${typeof state.turn}), Got: ${userId} (type: ${typeof userId})`);
            return res.status(403).json({
                message: 'Сейчас не ваш ход',
                debug: {
                    expected_turn: state.turn,
                    your_id: userId,
                    captains: state.captains
                }
            });
        }

        if (!state.pool.includes(map_name)) {
            console.log(`[VETO ERROR] Invalid map: ${map_name}`);
            await t.rollback();
            return res.status(400).json({ message: 'Карта не в пуле' });
        }
        if (state.banned.includes(map_name) || state.picked.some(p => p.map === map_name)) {
            console.log(`[VETO ERROR] Map already used: ${map_name}`);
            await t.rollback();
            return res.status(400).json({ message: 'Карта уже использована' });
        }

        const currentAction = state.sequence[state.current_step];
        const teamNum = (String(state.captains[1]) === String(userId)) ? 1 : 2;

        console.log(`[VETO ACTION] Step: ${state.current_step}, Action: ${currentAction}, Team: ${teamNum}, Map: ${map_name}`);

        if (currentAction === 'ban') {
            state.banned.push(map_name);
        } else {
            state.picked.push({ map: map_name, picked_by: teamNum });
        }

        state.current_step++;

        const otherCaptain = (String(state.captains[1]) === String(userId)) ? state.captains[2] : state.captains[1];
        state.turn = otherCaptain;
        console.log(`[VETO DEBUG] New turn: ${state.turn}`);

        if (state.current_step >= state.sequence.length) {
            state.stage = 'completed';
            state.turn = null;

            const usedMaps = [...state.banned, ...state.picked.map(p => p.map)];
            const remaining = state.pool.filter(m => !usedMaps.includes(m));

            if (remaining.length === 1) {
                state.picked.push({ map: remaining[0], picked_by: 'decider' });
                console.log(`[VETO INFO] Decider added: ${remaining[0]}`);
            }
        }

        match.map_state = state;
        match.changed('map_state', true);
        await match.save({ transaction: t });

        await t.commit();
        console.log('[VETO SUCCESS] State saved');
        res.json({ message: 'Действие выполнено', map_state: state });

    } catch (error) {
        await t.rollback();
        console.error('Veto error:', error);
        res.status(500).json({ message: 'Ошибка при выполнении вето: ' + error.message });
    }
};
