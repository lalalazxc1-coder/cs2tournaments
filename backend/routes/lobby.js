const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');
const lobbyController = require('../controllers/lobbyController');

/**
 * @swagger
 * tags:
 *   name: Lobbies
 *   description: Управление лобби
 */

/**
 * @swagger
 * /lobbies:
 *   post:
 *     summary: Создать новое лобби
 *     tags: [Lobbies]
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
 *               - date_time
 *               - format
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               password:
 *                 type: string
 *               date_time:
 *                 type: string
 *                 format: date-time
 *               format:
 *                 type: string
 *                 enum: [BO1, BO3, BO5]
 *     responses:
 *       201:
 *         description: Лобби создано
 */
router.post('/', [
    authenticateToken,
    body('name').trim().notEmpty().withMessage('Название обязательно').isLength({ max: 100 }).escape(),
    body('description').optional().trim().escape(),
    body('password').optional().trim(),
    body('date_time').isISO8601().withMessage('Некорректная дата').custom(value => {
        if (new Date(value) < new Date()) throw new Error('Дата не может быть в прошлом');
        return true;
    }),
    body('format').isIn(['BO1', 'BO3', 'BO5']).withMessage('Неверный формат (BO1, BO3, BO5)')
], lobbyController.createLobby);

/**
 * @swagger
 * /lobbies:
 *   get:
 *     summary: Получить список лобби
 *     tags: [Lobbies]
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
 *           enum: [registering, drafting, in_progress, finished, cancelled]
 *         description: Статус лобби
 *     responses:
 *       200:
 *         description: Список лобби
 */
router.get('/', [
    optionalAuth,
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('status').optional().isIn(['registering', 'drafting', 'in_progress', 'finished', 'cancelled'])
], lobbyController.getLobbies);

/**
 * @swagger
 * /lobbies/{id}:
 *   get:
 *     summary: Получить детали лобби
 *     tags: [Lobbies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     responses:
 *       200:
 *         description: Детали лобби
 */
router.get('/:id', [
    param('id').isInt().toInt()
], lobbyController.getLobbyDetails);

/**
 * @swagger
 * /lobbies/{id}:
 *   put:
 *     summary: Обновить лобби
 *     tags: [Lobbies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               date_time:
 *                 type: string
 *                 format: date-time
 *               map_pool:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Лобби обновлено
 */
router.put('/:id', [
    authenticateToken,
    param('id').isInt().toInt(),
    body('name').optional().trim().notEmpty().isLength({ max: 100 }).escape(),
    body('description').optional().trim().escape(),
    body('date_time').optional().isISO8601(),
    body('map_pool').optional().isArray()
], lobbyController.updateLobby);

/**
 * @swagger
 * /lobbies/{id}/join:
 *   post:
 *     summary: Присоединиться к лобби
 *     tags: [Lobbies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешное присоединение
 */
router.post('/:id/join', [
    authenticateToken,
    param('id').isInt().toInt(),
    body('password').optional().trim()
], lobbyController.joinLobby);

/**
 * @swagger
 * /lobbies/{id}/leave:
 *   post:
 *     summary: Покинуть лобби
 *     tags: [Lobbies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     responses:
 *       200:
 *         description: Успешный выход
 */
router.post('/:id/leave', [
    authenticateToken,
    param('id').isInt().toInt()
], lobbyController.leaveLobby);

/**
 * @swagger
 * /lobbies/{id}/participants:
 *   get:
 *     summary: Получить участников лобби
 *     tags: [Lobbies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     responses:
 *       200:
 *         description: Список участников
 */
router.get('/:id/participants', [
    authenticateToken,
    param('id').isInt().toInt()
], lobbyController.getParticipants);

/**
 * @swagger
 * /lobbies/{id}/kick:
 *   post:
 *     summary: Исключить участника
 *     tags: [Lobbies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Участник исключен
 */
router.post('/:id/kick', [
    authenticateToken,
    param('id').isInt().toInt(),
    body('user_id').isInt().toInt()
], lobbyController.kickParticipant);

/**
 * @swagger
 * /lobbies/{id}/reset:
 *   post:
 *     summary: Сбросить лобби
 *     tags: [Lobbies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     responses:
 *       200:
 *         description: Лобби сброшено
 */
router.post('/:id/reset', [
    authenticateToken,
    param('id').isInt().toInt()
], lobbyController.resetLobby);

/**
 * @swagger
 * /lobbies/{id}/cancel:
 *   post:
 *     summary: Отменить лобби
 *     tags: [Lobbies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     responses:
 *       200:
 *         description: Лобби отменено
 */
router.post('/:id/cancel', [
    authenticateToken,
    param('id').isInt().toInt()
], lobbyController.cancelLobby);

/**
 * @swagger
 * /lobbies/{id}/start_auto:
 *   post:
 *     summary: Запустить авто-баланс
 *     tags: [Lobbies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     responses:
 *       200:
 *         description: Авто-баланс запущен
 */
router.post('/:id/start_auto', [
    authenticateToken,
    param('id').isInt().toInt()
], lobbyController.startAuto);

/**
 * @swagger
 * /lobbies/{id}/start_draft:
 *   post:
 *     summary: Запустить режим драфта
 *     tags: [Lobbies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     responses:
 *       200:
 *         description: Драфт запущен
 */
router.post('/:id/start_draft', [
    authenticateToken,
    param('id').isInt().toInt()
], lobbyController.startDraft);

/**
 * @swagger
 * /lobbies/{id}/set_captains:
 *   post:
 *     summary: Назначить капитанов
 *     tags: [Lobbies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - captain1_id
 *               - captain2_id
 *             properties:
 *               captain1_id:
 *                 type: integer
 *               captain2_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Капитаны назначены
 */
router.post('/:id/set_captains', [
    authenticateToken,
    param('id').isInt().toInt(),
    body('captain1_id').isInt().toInt(),
    body('captain2_id').isInt().toInt()
], lobbyController.setCaptains);

/**
 * @swagger
 * /lobbies/{id}/set_team_names:
 *   post:
 *     summary: Установить названия команд
 *     tags: [Lobbies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Название команды обновлено
 */
router.post('/:id/set_team_names', [
    authenticateToken,
    param('id').isInt().toInt(),
    body('name').trim().notEmpty().escape()
], lobbyController.setTeamNames);

/**
 * @swagger
 * /lobbies/{id}/draft_pick:
 *   post:
 *     summary: Выбрать игрока (драфт)
 *     tags: [Lobbies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - picked_user_id
 *             properties:
 *               picked_user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Игрок выбран
 */
router.post('/:id/draft_pick', [
    authenticateToken,
    param('id').isInt().toInt(),
    body('picked_user_id').isInt().toInt()
], lobbyController.draftPick);

/**
 * @swagger
 * /lobbies/{id}/veto_map:
 *   post:
 *     summary: Вето карты
 *     tags: [Lobbies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - map_name
 *             properties:
 *               map_name:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [ban, pick]
 *     responses:
 *       200:
 *         description: Действие вето выполнено
 */
router.post('/:id/veto_map', [
    authenticateToken,
    param('id').isInt().toInt(),
    body('map_name').trim().notEmpty().escape(),
    body('action').optional().isIn(['ban', 'pick'])
], lobbyController.vetoMap);

/**
 * @swagger
 * /lobbies/{id}/invite:
 *   post:
 *     summary: Пригласить игрока в лобби
 *     tags: [Lobbies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Приглашение отправлено
 */
router.post('/:id/invite', [
    authenticateToken,
    param('id').isInt().toInt(),
    body('user_id').isInt().toInt()
], lobbyController.invite);

/**
 * @swagger
 * /lobbies/{id}/matches:
 *   get:
 *     summary: Получить матчи лобби
 *     tags: [Lobbies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лобби
 *     responses:
 *       200:
 *         description: Список матчей лобби
 */
router.get('/:id/matches', [
    param('id').isInt().toInt()
], lobbyController.getLobbyMatches);

/**
 * @swagger
 * /lobbies/matches/{id}/stats:
 *   get:
 *     summary: Получить статистику матча лобби
 *     tags: [Lobbies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID матча
 *     responses:
 *       200:
 *         description: Статистика матча
 */
router.get('/matches/:id/stats', [
    param('id').isInt().toInt()
], lobbyController.getMatchStats);

module.exports = router;
