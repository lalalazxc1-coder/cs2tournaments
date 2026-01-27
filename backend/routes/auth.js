const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Управление авторизацией
 */

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Проверка JWT токена
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Токен действителен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nickname:
 *                       type: string
 *                     avatar_medium:
 *                       type: string
 *       401:
 *         description: Неверный или отсутствующий токен
 */
// Verify Token
router.post('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, jwtConfig.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Steam Auth Routes
router.get('/steam', passport.authenticate('steam'));

router.get('/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  async function (req, res) {
    // Successful authentication
    const user = req.user;

    // Create User Session
    const crypto = require('crypto');
    const { UserSession } = require('../models');
    const sessionId = crypto.randomUUID();
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Deactivate previous sessions from the same IP and User Agent
    await UserSession.update(
      { is_active: false },
      {
        where: {
          user_id: user.id,
          ip_address: ipAddress,
          user_agent: userAgent,
          is_active: true
        }
      }
    );

    await UserSession.create({
      user_id: user.id,
      session_id: sessionId,
      ip_address: ipAddress,
      user_agent: userAgent,
      last_active: new Date(),
      is_active: true
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, session_id: sessionId },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    // Send HTML to communicate with frontend
    // Sanitize user object to prevent XSS
    const userJson = JSON.stringify(user).replace(/</g, '\\u003c');

    const html = `
      <html>
        <head>
          <title>Steam Auth Success</title>
        </head>
        <body>
          <script>
            const data = {
                type: 'STEAM_LOGIN_SUCCESS',
                token: '${token}',
                user: ${userJson}
            };
            
            if (window.opener) {
                window.opener.postMessage(data, '${process.env.FRONTEND_URL || "http://localhost:3000"}');
                window.close();
            } else {
                // Fallback if not in popup (e.g. direct navigation)
                window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}';
            }
          </script>
        </body>
      </html>
    `;
    res.send(html);
  }
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Выход пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный выход
 */
// Logout Route
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (req.user) {
    // Optional: Mark session as inactive in DB
    try {
      // Assuming we have the session ID in the token or req.user
      // For now, just destroy the express session
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out, please try again' });
    }
    res.clearCookie('connect.sid'); // Default session cookie name
    res.json({ message: 'Logout successful' });
  });
});

module.exports = router;
