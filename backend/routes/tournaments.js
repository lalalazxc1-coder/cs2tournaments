const express = require('express');
const { body, query, param } = require('express-validator');
const { authenticateToken } = require('../middleware/authMiddleware');
const tournamentController = require('../controllers/tournamentController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tournaments
 *   description: Управление турнирами
 */

/**
 * @swagger
 * /tournaments:
 *   get:
 *     summary: Получить список турниров
 *     tags: [Tournaments]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Лимит записей
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Смещение
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, registration, registration_closed, ongoing, completed, cancelled, active]
 *         description: Статус турнира
 *     responses:
 *       200:
 *         description: Список турниров
 */
router.get('/', [
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('status').optional().isIn(['upcoming', 'registration', 'registration_closed', 'ongoing', 'completed', 'cancelled', 'active'])
], tournamentController.getTournaments);

/**
 * @swagger
 * /tournaments/{id}/teams:
 *   get:
 *     summary: Получить список команд турнира
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID турнира
 *     responses:
 *       200:
 *         description: Список команд
 */
router.get('/:id/teams', [
    param('id').isInt().toInt()
], tournamentController.getTournamentTeams);

/**
 * @swagger
 * /tournaments/{id}/brackets:
 *   get:
 *     summary: Получить сетку турнира
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID турнира
 *     responses:
 *       200:
 *         description: Сетка турнира
 */
router.get('/:id/brackets', [
    param('id').isInt().toInt()
], tournamentController.getTournamentBrackets);

/**
 * @swagger
 * /tournaments/{id}:
 *   get:
 *     summary: Получить детали турнира
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID турнира
 *     responses:
 *       200:
 *         description: Детали турнира
 */
router.get('/:id', [
    param('id').isInt().toInt()
], tournamentController.getTournamentDetails);

/**
 * @swagger
 * /tournaments/{id}:
 *   put:
 *     summary: Обновить турнир
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Турнир обновлен
 */
router.put('/:id', [
    authenticateToken,
    param('id').isInt().toInt(),
    body('name').optional().trim().notEmpty().isLength({ max: 100 }).escape(),
    body('description').optional().trim().escape(),
    body('format').optional().isIn(['single_elimination', 'double_elimination']),
    body('max_teams').optional().isInt({ min: 2 }),
    body('start_date').optional().isISO8601(),
    body('prize_pool').optional().trim().escape(),
    body('rules').optional().trim().escape()
], tournamentController.updateTournament);

/**
 * @swagger
 * /tournaments:
 *   post:
 *     summary: Создать турнир
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - format
 *               - max_teams
 *               - start_date
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               format:
 *                 type: string
 *                 enum: [single_elimination, double_elimination]
 *               max_teams:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               prize_pool:
 *                 type: string
 *               rules:
 *                 type: string
 *     responses:
 *       201:
 *         description: Турнир создан
 */
router.post('/', [
    authenticateToken,
    body('name').trim().notEmpty().withMessage('Название обязательно').isLength({ max: 100 }).escape(),
    body('description').optional().trim().escape(),
    body('format').isIn(['single_elimination', 'double_elimination']).withMessage('Неверный формат'),
    body('max_teams').isInt({ min: 2 }).withMessage('Минимум 2 команды'),
    body('start_date').isISO8601().withMessage('Некорректная дата'),
    body('prize_pool').optional().trim().escape(),
    body('rules').optional().trim().escape()
], tournamentController.createTournament);

/**
 * @swagger
 * /tournaments/{id}/register:
 *   post:
 *     summary: Регистрация команды на турнир
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID турнира
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - team_id
 *             properties:
 *               team_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Команда зарегистрирована
 */
router.post('/:id/register', [
    authenticateToken,
    param('id').isInt().toInt(),
    body('team_id').isInt().toInt()
], tournamentController.registerTeam);

/**
 * @swagger
 * /tournaments/{id}/leave:
 *   post:
 *     summary: Покинуть турнир
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID турнира
 *     responses:
 *       200:
 *         description: Команда покинула турнир
 */
router.post('/:id/leave', [
    authenticateToken,
    param('id').isInt().toInt()
], tournamentController.leaveTournament);

/**
 * @swagger
 * /tournaments/{id}/start:
 *   post:
 *     summary: Запустить турнир
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID турнира
 *     responses:
 *       200:
 *         description: Турнир запущен
 */
router.post('/:id/start', [
    authenticateToken,
    param('id').isInt().toInt()
], tournamentController.startTournament);

/**
 * @swagger
 * /tournaments/{id}/matches/{matchId}:
 *   put:
 *     summary: Обновить результат матча
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID турнира
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID матча
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               winner_id:
 *                 type: integer
 *               map_results:
 *                 type: object
 *     responses:
 *       200:
 *         description: Результат обновлен
 */
router.put('/:id/matches/:matchId', [
    authenticateToken,
    param('id').isInt().toInt(),
    param('matchId').isInt().toInt(),
    body('winner_id').optional().isInt().toInt(),
    body('map_results').optional().isObject()
], tournamentController.updateMatchResult);

/**
 * @swagger
 * /tournaments/{id}/matches/{matchId}/veto:
 *   post:
 *     summary: Выполнить действие вето (бан/пик)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID турнира
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID матча
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [ban, pick, start]
 *               map_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Действие выполнено
 */
router.post('/:id/matches/:matchId/veto', [
    authenticateToken,
    param('id').isInt().toInt(),
    param('matchId').isInt().toInt(),
    body('map_name').optional().trim().escape(),
    body('action').isIn(['ban', 'pick', 'start'])
], tournamentController.performMapVeto);

module.exports = router;
