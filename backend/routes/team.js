const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const { authenticateToken } = require('../middleware/authMiddleware');
const teamController = require('../controllers/teamController');

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Управление командами
 */

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Получить список команд
 *     tags: [Teams]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по названию
 *     responses:
 *       200:
 *         description: Список команд
 */
router.get('/', [
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('captain_id').optional().isInt().toInt(),
    query('member_id').optional().isInt().toInt(),
    query('search').optional().trim().escape()
], teamController.getTeams);

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Получить детали команды
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID команды
 *     responses:
 *       200:
 *         description: Детали команды
 */
router.get('/:id', [
    param('id').isInt().toInt()
], teamController.getTeamDetails);

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Создать команду
 *     tags: [Teams]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Команда создана
 */
router.post('/', [
    authenticateToken,
    body('name').trim().notEmpty().withMessage('Название обязательно').isLength({ max: 50 }).escape(),
    body('description').optional().trim().escape(),
    body('logo_url').optional().trim()
], teamController.createTeam);

/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     summary: Обновить команду
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID команды
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
 *               logo_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Команда обновлена
 */
router.put('/:id', [
    authenticateToken,
    param('id').isInt().toInt(),
    body('name').optional().trim().notEmpty().isLength({ max: 50 }).escape(),
    body('description').optional().trim().escape(),
    body('logo_url').optional().trim()
], teamController.updateTeam);

/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Удалить команду
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID команды
 *     responses:
 *       200:
 *         description: Команда удалена
 */
router.delete('/:id', [
    authenticateToken,
    param('id').isInt().toInt()
], teamController.deleteTeam);

/**
 * @swagger
 * /teams/{id}/members:
 *   post:
 *     summary: Пригласить участника
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID команды
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
router.post('/:id/members', [
    authenticateToken,
    param('id').isInt().toInt(),
    body('user_id').isInt().toInt()
], teamController.addMember);

/**
 * @swagger
 * /teams/{id}/join:
 *   post:
 *     summary: Подать заявку на вступление
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID команды
 *     responses:
 *       200:
 *         description: Заявка отправлена
 */
router.post('/:id/join', [
    authenticateToken,
    param('id').isInt().toInt()
], teamController.joinTeam);

/**
 * @swagger
 * /teams/{id}/members/{userId}/accept:
 *   post:
 *     summary: Принять заявку участника
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID команды
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Участник принят
 */
router.post('/:id/members/:userId/accept', [
    authenticateToken,
    param('id').isInt().toInt(),
    param('userId').isInt().toInt()
], teamController.acceptMember);

/**
 * @swagger
 * /teams/{id}/members/{userId}:
 *   delete:
 *     summary: Удалить участника / Покинуть команду
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID команды
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Участник удален
 */
router.delete('/:id/members/:userId', [
    authenticateToken,
    param('id').isInt().toInt(),
    param('userId').isInt().toInt()
], teamController.removeMember);

module.exports = router;
