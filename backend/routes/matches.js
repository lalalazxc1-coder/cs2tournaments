const express = require('express');
const router = express.Router();
const { query, param, validationResult } = require('express-validator');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Управление матчами
 */

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Получить список матчей
 *     tags: [Matches]
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
 *     responses:
 *       200:
 *         description: Список матчей
 */
const matchService = require('../services/matchService');

// ... (Swagger docs)

router.get('/', [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await matchService.getMatches(page, limit);
        res.json(result);
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ message: 'Ошибка при получении списка матчей', error: error.message });
    }
});

// ... (Swagger docs for /:id)

router.get('/:id', [
    param('id').isInt().toInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const matchId = req.params.id;
        const result = await matchService.getMatchDetails(matchId);

        if (!result) {
            return res.status(404).json({ message: 'Матч не найден' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error fetching match details:', error);
        res.status(500).json({ message: 'Ошибка при получении деталей матча', error: error.message });
    }
});

// ... (Swagger docs for /upload-match-stats)

router.post('/upload-match-stats', async (req, res) => {
    try {
        // 1. Check API Key
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== process.env.API_KEY) {
            return res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
        }

        const { match, players } = req.body;

        if (!match || !players) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        const matchId = await matchService.processMatchStats(match, players);

        res.status(201).json({ message: 'Match stats uploaded successfully', match_id: matchId });

    } catch (error) {
        console.error('Error uploading match stats:', error);
        if (error.message === 'Match already exists') {
            return res.status(409).json({ message: 'Match already exists' });
        }
        res.status(500).json({ message: 'Error uploading stats', error: error.message });
    }
});

module.exports = router;
