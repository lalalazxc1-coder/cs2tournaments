const express = require('express');
const { body, query, param } = require('express-validator');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Import Controllers
const adminUserController = require('../controllers/admin/adminUserController');
const adminSystemController = require('../controllers/admin/adminSystemController');
const adminTeamController = require('../controllers/admin/adminTeamController');
const adminTournamentController = require('../controllers/admin/adminTournamentController');
const adminLobbyController = require('../controllers/admin/adminLobbyController');
const adminMatchController = require('../controllers/admin/adminMatchController');

const router = express.Router();

// Apply admin check to all routes
router.use(authenticateToken, isAdmin);

// --- User Management ---

// Get all users
router.get('/users', [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('search').optional().trim().escape()
], adminUserController.getUsers);

// Get user stats
router.get('/users/:id/stats', [
    param('id').isInt().toInt()
], adminUserController.getUserStats);

// Update user profile (Admin)
router.put('/users/:id/profile', [
    param('id').isInt().toInt(),
    body('nickname').optional().trim().escape(),
    body('real_name').optional().trim().escape(),
    body('email').optional().isEmail().normalizeEmail(),
    body('custom_url').optional().trim().escape(),
    body('player_label').optional().trim().escape()
], adminUserController.updateUserProfile);

// Impersonate user (Admin)
router.post('/users/:id/impersonate', [
    param('id').isInt().toInt()
], adminUserController.impersonateUser);

// Update user role (Admin)
router.put('/users/:id/role', [
    param('id').isInt().toInt(),
    body('role').isInt().isIn([0, 1, 2])
], adminUserController.updateUserRole);

// Ban/Unban user (Admin)
router.put('/users/:id/ban', [
    param('id').isInt().toInt(),
    body('is_blocked').isBoolean(),
    body('blocked_until').optional({ nullable: true }).isISO8601()
], adminUserController.banUser);

// Get user lobbies
router.get('/users/:id/lobbies', adminUserController.getUserLobbies);

// Get user tournaments
router.get('/users/:id/tournaments', adminUserController.getUserTournaments);


// --- Settings Management ---

// Get settings
router.get('/settings', adminSystemController.getSettings);

// Update settings
router.put('/settings', adminSystemController.updateSettings);


// --- Team Management (Admin) ---

// Get all teams
router.get('/teams', [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('search').optional().trim().escape()
], adminTeamController.getTeams);

// Update team
router.put('/teams/:id', [
    param('id').isInt().toInt(),
    body('name').optional().trim().escape(),
    body('description').optional().trim().escape(),
    body('captain_id').optional().isInt().toInt()
], adminTeamController.updateTeam);

// Delete team
router.delete('/teams/:id', [
    param('id').isInt().toInt()
], adminTeamController.deleteTeam);


// --- Tournament Management (Admin) ---

// Get all tournaments (Admin)
router.get('/tournaments', [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('search').optional().trim().escape()
], adminTournamentController.getTournaments);

// Update tournament
router.put('/tournaments/:id', [
    param('id').isInt().toInt(),
    body('name').optional().trim().notEmpty().escape(),
    body('description').optional().trim().escape(),
    body('prize_pool').optional().trim().escape(),
    body('format').optional().isIn(['single_elimination', 'double_elimination', 'round_robin']),
    body('start_date').optional().isISO8601()
], adminTournamentController.updateTournament);

// Delete tournament
router.delete('/tournaments/:id', adminTournamentController.deleteTournament);

// Kick team from tournament
router.post('/tournaments/:id/kick-team', [
    param('id').isInt().toInt(),
    body('team_id').isInt().toInt()
], adminTournamentController.kickTeamFromTournament);

// Add team to tournament
router.post('/tournaments/:id/add-team', [
    param('id').isInt().toInt(),
    body('team_id').isInt().toInt()
], adminTournamentController.addTeamToTournament);


// --- Lobby Management (Regular 5v5 Matches) ---

// Get all lobbies (Admin)
router.get('/lobbies', adminLobbyController.getLobbies);

// Get lobby participants (Admin)
router.get('/lobbies/:id/participants', adminLobbyController.getLobbyParticipants);

// Update lobby
router.put('/lobbies/:id', adminLobbyController.updateLobby);

// Delete lobby
router.delete('/lobbies/:id', adminLobbyController.deleteLobby);

// Kick user from lobby
router.post('/lobbies/:id/kick', [
    param('id').isInt().toInt(),
    body('user_id').isInt().toInt()
], adminLobbyController.kickUserFromLobby);

// Add user to lobby
router.post('/lobbies/:id/add', [
    param('id').isInt().toInt(),
    body('user_id').isInt().toInt()
], adminLobbyController.addUserToLobby);

// Get unlinked matches (suggested for lobby)
router.get('/lobbies/:lobbyId/unlinked-matches', adminLobbyController.getUnlinkedMatches);

// Link match to lobby
router.post('/lobbies/:lobbyId/link-match', adminLobbyController.linkMatchToLobby);

// Unlink match from lobby
router.delete('/lobbies/:lobbyId/matches/:matchId', adminLobbyController.unlinkMatchFromLobby);

// Get linked matches for lobby
router.get('/lobbies/:lobbyId/matches', adminLobbyController.getLobbyMatches);


// --- Match Management (Admin) ---

// Get all matches (Admin view)
router.get('/matches', [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt()
], adminMatchController.getMatches);

// Delete match and rollback stats
router.delete('/matches/:id', [
    param('id').isInt().toInt()
], adminMatchController.deleteMatch);

// Get detailed match statistics
router.get('/matches/:matchId/stats', adminMatchController.getMatchStats);


module.exports = router;
