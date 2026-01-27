const jwt = require('jsonwebtoken');
const { User, UserSession } = require('../models');
const jwtConfig = require('../config/jwt');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Требуется токен доступа' });
    }

    try {
        const decoded = jwt.verify(token, jwtConfig.secret);
        req.user = { ...decoded, userId: decoded.id || decoded.userId };

        // Check if session is valid
        if (decoded.session_id) {
            const session = await UserSession.findOne({
                where: { session_id: decoded.session_id, user_id: req.user.userId }
            });

            if (!session || !session.is_active) {
                return res.status(401).json({ message: 'Сессия истекла или была завершена' });
            }
        }

        // Fetch user to check blocked status
        const user = await User.findByPk(req.user.userId);

        if (!user) {
            return res.status(401).json({ message: 'Пользователь не найден' });
        }

        // Attach user details to req.user
        req.user.nickname = user.nickname;
        req.user.custom_url = user.custom_url;
        req.user.avatar_medium = user.avatar_medium;
        req.user.id = user.id;

        // Check blocked status
        if (user.is_blocked) {
            const now = new Date();
            if (!user.blocked_until || new Date(user.blocked_until) > now) {
                return res.status(403).json({
                    message: 'Ваш аккаунт заблокирован',
                    code: 'USER_BLOCKED',
                    blocked_until: user.blocked_until
                });
            } else {
                // Ban expired, auto-unban
                await user.update({ is_blocked: false, blocked_until: null });
            }
        }

        // Update User last_seen
        await user.update({ last_seen: new Date() }).catch(err => console.error('Error updating last_seen:', err));

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Неверный токен' });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.userId);
        if (!user || user.role !== 2) {
            return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
        }
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ message: 'Ошибка сервера при проверке прав' });
    }
};

const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.replace('Bearer ', '');

    if (token) {
        try {
            const decoded = jwt.verify(token, jwtConfig.secret);
            req.user = { ...decoded, userId: decoded.id || decoded.userId };

            // Fetch user to check blocked status even for optional auth
            const user = await User.findByPk(req.user.userId);
            if (user && user.is_blocked) {
                const now = new Date();
                if (!user.blocked_until || new Date(user.blocked_until) > now) {
                    // If blocked, treat as guest (remove req.user) or block?
                    // User said "no actions". If it's optional auth, usually it means "read as guest".
                    // But if they are logged in and blocked, maybe we should force them to see the block?
                    // For now, let's just invalidate the auth part so they act as guest, 
                    // OR if we want to be strict, we return 403.
                    // Given "no actions at all", 403 is safer if they are trying to use the token.
                    return res.status(403).json({
                        message: 'Ваш аккаунт заблокирован',
                        code: 'USER_BLOCKED',
                        blocked_until: user.blocked_until
                    });
                }
            }

            if (user) {
                await user.update({ last_seen: new Date() }).catch(err => console.error('Error updating last_seen:', err));
            }
        } catch (error) {
            // Invalid token, but we don't block, just treat as guest
        }
    }
    next();
};

module.exports = { authenticateToken, isAdmin, optionalAuth };
