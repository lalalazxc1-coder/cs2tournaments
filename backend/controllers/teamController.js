const { Team, TeamMember, User, Tournament, TournamentTeam, sequelize } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

exports.getTeams = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { search, captain_id, member_id, limit = 20, offset = 0 } = req.query;

        const where = {};
        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }
        if (captain_id) {
            where.captain_id = captain_id;
        }
        if (member_id) {
            where[Op.and] = sequelize.literal(`EXISTS (SELECT 1 FROM team_members WHERE team_members.team_id = Team.id AND team_members.user_id = ${member_id})`);
        }

        const teams = await Team.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM tournament_teams AS tt
                            WHERE
                                tt.team_id = Team.id
                        )`),
                        'tournaments_count'
                    ]
                ]
            },
            include: [
                { model: User, as: 'captain', attributes: ['id', 'nickname'] },
                { model: TeamMember, as: 'members' }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            teams: teams.rows,
            total: teams.count,
            page: Math.floor(offset / limit) + 1
        });
    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({ message: 'Ошибка при получении команд' });
    }
};

exports.getTeamDetails = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const team = await Team.findByPk(req.params.id, {
            include: [
                { model: User, as: 'captain', attributes: ['id', 'nickname', 'custom_url'] },
                {
                    model: TeamMember,
                    as: 'members',
                    include: [{ model: User, as: 'user', attributes: ['id', 'nickname', 'steam_id', 'custom_url'] }]
                },
                {
                    model: TournamentTeam,
                    as: 'tournamentEntries',
                    include: [{ model: Tournament, as: 'tournament', attributes: ['id', 'name', 'status', 'start_date'] }]
                }
            ]
        });

        if (!team) {
            return res.status(404).json({ message: 'Команда не найдена' });
        }

        res.json(team);
    } catch (error) {
        console.error('Get team details error:', error);
        res.status(500).json({ message: 'Ошибка при получении информации о команде' });
    }
};

exports.createTeam = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description, logo_url } = req.body;
        const userId = req.user.userId;

        const existingTeam = await Team.findOne({ where: { name } });
        if (existingTeam) {
            return res.status(400).json({ message: 'Команда с таким названием уже существует' });
        }

        const team = await Team.create({
            name,
            description,
            logo_url,
            captain_id: userId
        });

        await TeamMember.create({
            team_id: team.id,
            user_id: userId,
            role: 'captain',
            status: 'member' // Captain is automatically a member
        });

        res.status(201).json(team);
    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({ message: 'Ошибка при создании команды' });
    }
};

exports.updateTeam = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const teamId = req.params.id;
        const userId = req.user.userId;
        const { name, description, logo_url } = req.body;

        const team = await Team.findByPk(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Команда не найдена' });
        }

        if (team.captain_id !== userId) {
            return res.status(403).json({ message: 'Только капитан может редактировать команду' });
        }

        if (name && name !== team.name) {
            const existingTeam = await Team.findOne({ where: { name } });
            if (existingTeam) {
                return res.status(400).json({ message: 'Команда с таким названием уже существует' });
            }
        }

        team.name = name || team.name;
        team.description = description || team.description;
        team.logo_url = logo_url || team.logo_url;

        await team.save();

        res.json(team);
    } catch (error) {
        console.error('Update team error:', error);
        res.status(500).json({ message: 'Ошибка при обновлении команды' });
    }
};

exports.deleteTeam = async (req, res) => {
    try {
        const teamId = req.params.id;
        const userId = req.user.userId;

        const team = await Team.findByPk(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Команда не найдена' });
        }

        if (team.captain_id !== userId) {
            return res.status(403).json({ message: 'Только капитан может удалить команду' });
        }

        await team.destroy();

        res.json({ message: 'Команда удалена' });
    } catch (error) {
        console.error('Delete team error:', error);
        res.status(500).json({ message: 'Ошибка при удалении команды' });
    }
};

exports.addMember = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const teamId = req.params.id;
        const { user_id } = req.body;
        const captainId = req.user.userId;

        const team = await Team.findByPk(teamId);
        if (!team) return res.status(404).json({ message: 'Команда не найдена' });

        if (team.captain_id !== captainId) {
            return res.status(403).json({ message: 'Только капитан может приглашать участников' });
        }

        const existingMember = await TeamMember.findOne({ where: { team_id: teamId, user_id } });
        if (existingMember) {
            return res.status(400).json({ message: 'Пользователь уже в команде или приглашен' });
        }

        const memberCount = await TeamMember.count({ where: { team_id: teamId, status: 'member' } });
        if (memberCount >= 7) { // 5 main + 2 subs
            return res.status(400).json({ message: 'В команде уже максимальное количество участников' });
        }

        await TeamMember.create({
            team_id: teamId,
            user_id,
            role: 'player',
            status: 'invited'
        });

        // Here you would typically send a notification to the user
        // await Notification.create(...)

        res.json({ message: 'Приглашение отправлено' });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ message: 'Ошибка при приглашении участника' });
    }
};

exports.joinTeam = async (req, res) => {
    try {
        const teamId = req.params.id;
        const userId = req.user.userId;

        const team = await Team.findByPk(teamId);
        if (!team) return res.status(404).json({ message: 'Команда не найдена' });

        const existingMember = await TeamMember.findOne({ where: { team_id: teamId, user_id: userId } });
        if (existingMember) {
            if (existingMember.status === 'invited') {
                existingMember.status = 'member';
                await existingMember.save();
                return res.json({ message: 'Вы присоединились к команде' });
            }
            return res.status(400).json({ message: 'Вы уже в команде или отправили заявку' });
        }

        await TeamMember.create({
            team_id: teamId,
            user_id: userId,
            role: 'player',
            status: 'pending'
        });

        res.json({ message: 'Заявка на вступление отправлена' });
    } catch (error) {
        console.error('Join team error:', error);
        res.status(500).json({ message: 'Ошибка при вступлении в команду' });
    }
};

exports.acceptMember = async (req, res) => {
    try {
        const teamId = req.params.id;
        const memberId = req.params.userId; // ID of the user to accept
        const captainId = req.user.userId;

        const team = await Team.findByPk(teamId);
        if (!team) return res.status(404).json({ message: 'Команда не найдена' });

        if (team.captain_id !== captainId) {
            return res.status(403).json({ message: 'Только капитан может принимать заявки' });
        }

        const member = await TeamMember.findOne({ where: { team_id: teamId, user_id: memberId } });
        if (!member) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }

        if (member.status !== 'pending') {
            return res.status(400).json({ message: 'Заявка не в статусе ожидания' });
        }

        member.status = 'member';
        await member.save();

        res.json({ message: 'Участник принят в команду' });
    } catch (error) {
        console.error('Accept member error:', error);
        res.status(500).json({ message: 'Ошибка при принятии участника' });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const teamId = req.params.id;
        const memberId = req.params.userId; // User ID to remove
        const requesterId = req.user.userId;

        const team = await Team.findByPk(teamId);
        if (!team) return res.status(404).json({ message: 'Команда не найдена' });

        // Allow captain to remove anyone, or user to remove themselves (leave)
        if (team.captain_id !== requesterId && parseInt(memberId) !== requesterId) {
            return res.status(403).json({ message: 'Нет прав' });
        }

        if (parseInt(memberId) === team.captain_id && team.captain_id === requesterId) {
            // Captain leaving logic - either transfer captaincy or delete team (simplified here: prevent leaving if only one)
            const memberCount = await TeamMember.count({ where: { team_id: teamId, status: 'member' } });
            if (memberCount > 1) {
                return res.status(400).json({ message: 'Капитан не может покинуть команду, пока в ней есть другие участники. Передайте права капитана или удалите команду.' });
            }
        }

        const member = await TeamMember.findOne({ where: { team_id: teamId, user_id: memberId } });
        if (!member) {
            return res.status(404).json({ message: 'Участник не найден' });
        }

        await member.destroy();

        res.json({ message: 'Участник удален из команды' });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ message: 'Ошибка при удалении участника' });
    }
};
