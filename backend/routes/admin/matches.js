const express = require('express');
const { authenticateToken } = require('../../middleware/authMiddleware');
const matchService = require('../../services/matchService');

const router = express.Router();
const { body, param, validationResult } = require('express-validator');

// @route   GET /api/admin/matches/unlinked
// @desc    Get unlinked matches (placeholder)
// @access  Private (Admin)
router.get('/unlinked', authenticateToken, async (req, res) => {
    try {
        const matches = await matchService.getUnlinkedMatches();
        res.json({ matches });
    } catch (error) {
        console.error('Error fetching unlinked matches:', error);
        res.status(500).json({ message: 'Error fetching unlinked matches' });
    }
});

// @route   POST /api/admin/matches/:id/link
// @desc    Link match to lobby or tournament bracket
// @access  Private (Admin)
router.post('/:id/link', [
    authenticateToken,
    param('id').isInt().toInt(),
    body('lobby_id').optional().isInt().toInt(),
    body('bracket_id').optional().isInt().toInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { lobby_id, bracket_id } = req.body;
    const matchId = req.params.id;

    try {
        await matchService.linkMatch(matchId, { lobbyId: lobby_id, bracketId: bracket_id });
        res.json({ message: 'Match linked successfully' });
    } catch (error) {
        console.error('Error linking match:', error);
        res.status(500).json({ message: 'Error linking match', error: error.message, stack: error.stack });
    }
});

module.exports = router;
