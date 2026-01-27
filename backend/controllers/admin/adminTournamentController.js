const { Tournament, TournamentTeam, Participant, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

exports.getTournaments = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }

        const { count, rows } = await Tournament.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM tournament_teams AS tt
                            WHERE tt.tournament_id = Tournament.id
                        )`),
                        'current_participants'
                    ]
                ]
            }
        });

        res.json({
            tournaments: rows,
            total: count,
            pages: Math.ceil(count / limit),
            current_page: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        res.status(500).json({ message: 'Ошибка при получении турниров' });
    }
};

exports.updateTournament = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name, description, format, max_teams, start_date, prize_pool, status } = req.body;
        const tournament = await Tournament.findByPk(req.params.id);

        if (!tournament) {
            return res.status(404).json({ message: 'Турнир не найден' });
        }

        await tournament.update({
            name: name || tournament.name,
            description: description !== undefined ? description : tournament.description,
            format: format || tournament.format,
            max_teams: max_teams || tournament.max_teams,
            start_date: start_date || tournament.start_date,
            prize_pool: prize_pool !== undefined ? prize_pool : tournament.prize_pool,
            status: status || tournament.status
        });

        res.json({ message: 'Турнир обновлен', tournament });
    } catch (error) {
        console.error('Error updating tournament:', error);
        res.status(500).json({ message: 'Ошибка при обновлении турнира' });
    }
};

exports.deleteTournament = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const tournamentId = req.params.id;
        const tournament = await Tournament.findByPk(tournamentId);

        if (!tournament) {
            await t.rollback();
            return res.status(404).json({ message: 'Турнир не найден' });
        }

        await Participant.destroy({
            where: { tournament_id: tournamentId },
            transaction: t
        });

        await tournament.destroy({ transaction: t });

        await t.commit();
        res.json({ message: 'Турнир удален' });
    } catch (error) {
        await t.rollback();
        console.error('Error deleting tournament:', error);
        res.status(500).json({ message: 'Ошибка при удалении турнира' });
    }
};

exports.kickTeamFromTournament = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { team_id } = req.body;
        const tournamentId = req.params.id;

        const tournamentTeam = await TournamentTeam.findOne({
            where: {
                tournament_id: tournamentId,
                team_id: team_id
            }
        });

        if (!tournamentTeam) {
            return res.status(404).json({ message: 'Команда не найдена в этом турнире' });
        }

        await tournamentTeam.destroy();

        const count = await TournamentTeam.count({ where: { tournament_id: tournamentId } });
        await Tournament.update(
            { current_participants: count },
            { where: { id: tournamentId } }
        );

        res.json({ message: 'Команда исключена из турнира' });
    } catch (error) {
        console.error('Error kicking team:', error);
        res.status(500).json({ message: 'Ошибка при исключении команды' });
    }
};

exports.addTeamToTournament = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { team_id } = req.body;
        const tournamentId = req.params.id;

        if (!team_id || isNaN(parseInt(team_id))) {
            return res.status(400).json({ message: 'Некорректный ID команды' });
        }

        const tournament = await Tournament.findByPk(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: 'Турнир не найден' });
        }

        if (tournament.current_participants >= tournament.max_teams) {
            return res.status(400).json({ message: 'Турнир заполнен' });
        }

        const existing = await TournamentTeam.findOne({
            where: {
                tournament_id: tournamentId,
                team_id: team_id
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'Команда уже участвует' });
        }

        await TournamentTeam.create({
            tournament_id: tournamentId,
            team_id: team_id,
            status: 'pending'
        });

        const count = await TournamentTeam.count({ where: { tournament_id: tournamentId } });
        await tournament.update({ current_participants: count });

        res.json({ message: 'Команда добавлена в турнир' });
    } catch (error) {
        console.error('Error adding team to tournament:', error);
        res.status(500).json({ message: 'Ошибка при добавлении команды' });
    }
};
