const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

const userController = require('../controllers/userController');
const steamController = require('../controllers/steamController');
const socialController = require('../controllers/socialController');

// --- Profile Routes ---

// @route   GET /api/user/profile
// @desc    Get user profile with stats
// @access  Private
router.get('/profile', authenticateToken, userController.getProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile settings
// @access  Private
router.put('/profile', [
  authenticateToken,
  body('nickname').optional().trim().isLength({ min: 2, max: 30 }).escape(),
  body('real_name').optional().trim().isLength({ max: 50 }).escape(),
  body('custom_url')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Короткая ссылка может содержать только латинские буквы, цифры, дефис и нижнее подчеркивание')
    .escape(),
  body('player_label').optional({ checkFalsy: true }).trim().isLength({ max: 30 }).escape(),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail()
], userController.updateProfile);

// @route   POST /api/user/label
// @desc    Update player label
// @access  Private
router.post('/label', [
  authenticateToken,
  body('label')
    .trim()
    .isLength({ max: 30 }).withMessage('Метка не может быть длиннее 30 символов')
    .escape() // Sanitize HTML characters
], userController.updateLabel);

// @route   GET /api/user/public/:identifier
// @desc    Get public user profile by ID or Custom URL
// @access  Public
router.get('/public/:identifier', optionalAuth, userController.getPublicProfile);

// --- Steam Routes ---

// @route   POST /api/user/set_steam_id
// @desc    Set Steam ID for user
// @access  Private
router.post('/set_steam_id', [
  authenticateToken,
  body('steam_id').matches(/^7656119\d{10}$/).withMessage('Invalid Steam ID format')
], steamController.setSteamId);

// @route   POST /api/user/remove_steam_id
// @desc    Remove Steam ID from user
// @access  Private
router.post('/remove_steam_id', authenticateToken, steamController.removeSteamId);

// @route   POST /api/user/sync-steam
// @desc    Sync profile with Steam
// @access  Private
router.post('/sync-steam', authenticateToken, steamController.syncSteam);

// --- Session Routes ---

// @route   GET /api/user/sessions
// @desc    Get active user sessions
// @access  Private
router.get('/sessions', authenticateToken, userController.getSessions);

// @route   DELETE /api/user/sessions/:id
// @desc    Revoke a session
// @access  Private
router.delete('/sessions/:id', [
  authenticateToken,
  param('id').isUUID().withMessage('Invalid Session ID')
], userController.revokeSession);

// --- User Stats Routes ---

// @route   GET /api/user/tournaments
// @desc    Get user's tournaments
// @access  Private
router.get('/tournaments', authenticateToken, userController.getUserTournaments);

// @route   GET /api/user/matches
// @desc    Get user's matches (from tournaments)
// @access  Private
router.get('/matches', authenticateToken, userController.getUserMatches);

// --- Social Routes (Wall) ---

// @route   POST /api/user/wall
// @desc    Create a wall post
// @access  Private
router.post('/wall', [
  authenticateToken,
  body('content').trim().notEmpty().withMessage('Content is required').escape(),
  body('target_user_id').isInt().withMessage('Target user ID is required')
], socialController.createWallPost);

// @route   DELETE /api/user/wall/:id
// @desc    Delete a wall post
// @access  Private
router.delete('/wall/:id', authenticateToken, socialController.deleteWallPost);

// @route   POST /api/user/wall/:id/like
// @desc    Like/Unlike a wall post
// @access  Private
router.post('/wall/:id/like', authenticateToken, socialController.likeWallPost);

// @route   POST /api/user/wall/:id/comment
// @desc    Comment on a wall post
// @access  Private
router.post('/wall/:id/comment', [
  authenticateToken,
  body('content').trim().notEmpty().withMessage('Content is required').escape()
], socialController.commentWallPost);

// @route   DELETE /api/user/wall/comment/:id
// @desc    Delete a comment
// @access  Private
router.delete('/wall/comment/:id', authenticateToken, socialController.deleteComment);

// @route   POST /api/user/friends/:id
// @desc    Add friend / Accept request
// @access  Private
router.post('/friends/:id', authenticateToken, socialController.addFriend);

// @route   DELETE /api/user/friends/:id
// @desc    Remove friend / Cancel request
// @access  Private
router.delete('/friends/:id', authenticateToken, socialController.removeFriend);

// @route   GET /api/user/:identifier/matches
// @desc    Get user matches
// @access  Public
router.get('/:identifier/matches', [
  optionalAuth,
  param('identifier').trim().escape(),
  query('limit').optional().isInt({ min: 1 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt()
], userController.getUserMatches);

// @route   GET /api/user/:identifier/wall
// @desc    Get user wall posts
// @access  Public
router.get('/:identifier/wall', [
  optionalAuth,
  param('identifier').trim().escape(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
], socialController.getWallPosts);

module.exports = router;
