const express = require('express');
const { User, PlayerSummary } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();
const { query, param, validationResult } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Players
 *   description: Статистика игроков
 */

/**
 * @swagger
 * /players:
 *   get:
 *     summary: Получить список игроков
 *     tags: [Players]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Лимит записей
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск игрока
 *     responses:
 *       200:
 *         description: Список игроков
 */
router.get('/', [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('search').optional().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                { player_name: { [Op.like]: `%${search}%` } },
                { player_steamid: { [Op.like]: `%${search}%` } },
                { '$user.nickname$': { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await PlayerSummary.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'user',
                required: true, // Only show players who are registered users
                attributes: ['nickname', 'id', 'player_label', 'custom_url', 'avatar_medium', 'profile_bg']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                [require('../config/database').sequelize.literal('CASE WHEN PlayerSummary.total_matches >= 10 THEN 1 ELSE 0 END'), 'DESC'],
                ['rating', 'DESC'],
                ['total_matches', 'DESC'],
                ['player_name', 'ASC']
            ],
            subQuery: false
        });

        res.json({
            players: rows,
            total: count,
            pages: Math.ceil(count / limit),
            current_page: parseInt(page)
        });

    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ message: 'Ошибка при получении списка игроков' });
    }
});

module.exports = router;

/**
 * @swagger
 * /players/{steamId}/matches:
 *   get:
 *     summary: Получить историю матчей игрока
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: steamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Steam ID игрока
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Лимит записей
 *     responses:
 *       200:
 *         description: История матчей
 */
router.get('/:steamId/matches', [
    param('steamId').matches(/^7656119\d{10}$/).withMessage('Invalid Steam ID'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { steamId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Fetch matches for this player
        const [matches] = await require('../config/database').sequelize.query(`
            SELECT 
                m.match_id,
                m.map_name,
                m.team_a_score,
                m.team_b_score,
                m.winning_team_name,
                m.game_date,
                ps.team_name,
                ps.is_winner,
                ps.kills,
                ps.deaths,
                ps.assists,
                ps.adr,
                ps.hs_percent
            FROM player_stats ps
            JOIN matches m ON ps.match_id = m.match_id
            WHERE ps.player_steamid = :steamId
            ORDER BY m.match_id DESC
            LIMIT :limit OFFSET :offset
        `, {
            replacements: {
                steamId,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

        // Get total count
        const [countResult] = await require('../config/database').sequelize.query(`
            SELECT COUNT(*) as total 
            FROM player_stats 
            WHERE player_steamid = ?
        `, {
            replacements: [steamId]
        });

        res.json({
            matches,
            total: countResult[0].total,
            pages: Math.ceil(countResult[0].total / limit),
            current_page: parseInt(page)
        });

    } catch (error) {
        console.error('Error fetching player matches:', error);
        res.status(500).json({ message: 'Ошибка при получении истории матчей игрока' });
    }
});
