const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await dashboardService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// @route   GET /api/dashboard/tournaments/active
// @desc    Get active lobbies
// @access  Public
router.get('/tournaments/active', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 10);
    const tournaments = await dashboardService.getActiveTournaments(limit);
    res.json({ tournaments });
  } catch (error) {
    console.error('Active lobbies error:', error);
    res.status(500).json({ message: 'Error fetching active lobbies', error: error.message });
  }
});

// @route   GET /api/dashboard/players/top
// @desc    Get top players
// @access  Public
router.get('/players/top', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 3, 5);
    const players = await dashboardService.getTopPlayers(limit);
    res.json({ players });
  } catch (error) {
    console.error('Top players error:', error);
    res.status(500).json({ message: 'Error fetching top players', error: error.message });
  }
});

module.exports = router;
