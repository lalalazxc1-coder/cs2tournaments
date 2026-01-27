const express = require('express');
const { Notification } = require('../models');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await Notification.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit: 50
        });
        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Ошибка получения уведомлений' });
    }
});

// @route   POST /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.post('/:id/read', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const notificationId = req.params.id;

        const notification = await Notification.findOne({
            where: { id: notificationId, user_id: userId }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Уведомление не найдено' });
        }

        notification.is_read = true;
        await notification.save();

        res.json({ message: 'Отмечено как прочитанное' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: 'Ошибка обновления' });
    }
});

// @route   POST /api/notifications/read_all
// @desc    Mark all notifications as read
// @access  Private
router.post('/read_all', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        await Notification.update({ is_read: true }, {
            where: { user_id: userId, is_read: false }
        });

        res.json({ message: 'Все уведомления отмечены как прочитанные' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ message: 'Ошибка обновления' });
    }
});

// @route   DELETE /api/notifications/clear_read
// @desc    Delete all read notifications
// @access  Private
router.delete('/clear_read', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const deletedCount = await Notification.destroy({
            where: { user_id: userId, is_read: true }
        });

        res.json({
            message: `Удалено прочитанных уведомлений: ${deletedCount}`,
            deleted: deletedCount
        });
    } catch (error) {
        console.error('Clear read notifications error:', error);
        res.status(500).json({ message: 'Ошибка удаления уведомлений' });
    }
});

module.exports = router;
