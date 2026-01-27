const { Team, User, TeamMember, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

exports.getTeams = async (req, res) => {
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

        const { count, rows } = await Team.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: User,
                    as: 'captain',
                    attributes: ['id', 'nickname', 'steam_id']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            teams: rows,
            total: count,
            pages: Math.ceil(count / limit),
            current_page: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ message: 'Ошибка при получении команд: ' + error.message });
    }
};

exports.updateTeam = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name, description, is_active, logo_url, captain_id } = req.body;
        const team = await Team.findByPk(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Команда не найдена' });
        }

        if (name && name !== team.name) {
            const existing = await Team.findOne({ where: { name } });
            if (existing) {
                return res.status(400).json({ message: 'Команда с таким названием уже существует' });
            }
        }

        if (captain_id && captain_id !== team.captain_id) {
            const captain = await User.findByPk(captain_id);
            if (!captain) {
                return res.status(400).json({ message: 'Пользователь с таким ID не найден' });
            }

            const oldCaptainId = team.captain_id;

            await TeamMember.update(
                { role: 'member' },
                { where: { team_id: team.id, user_id: oldCaptainId } }
            );

            const [member, created] = await TeamMember.findOrCreate({
                where: { team_id: team.id, user_id: captain_id },
                defaults: { role: 'captain', status: 'member' }
            });

            if (!created) {
                await member.update({ role: 'captain', status: 'member' });
            }
        }

        await team.update({
            name: name || team.name,
            description: description !== undefined ? description : team.description,
            is_active: is_active !== undefined ? is_active : team.is_active,
            logo_url: logo_url !== undefined ? logo_url : team.logo_url,
            captain_id: captain_id || team.captain_id
        });

        res.json({ message: 'Команда обновлена', team });
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ message: 'Ошибка при обновлении команды' });
    }
};

exports.deleteTeam = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const t = await sequelize.transaction();
    try {
        const teamId = req.params.id;
        const team = await Team.findByPk(teamId);

        if (!team) {
            await t.rollback();
            return res.status(404).json({ message: 'Команда не найдена' });
        }

        await TeamMember.destroy({
            where: { team_id: teamId },
            transaction: t
        });

        await team.destroy({ transaction: t });

        await t.commit();
        res.json({ message: 'Команда удалена' });
    } catch (error) {
        await t.rollback();
        console.error('Error deleting team:', error);
        res.status(500).json({ message: 'Ошибка при удалении команды' });
    }
};
