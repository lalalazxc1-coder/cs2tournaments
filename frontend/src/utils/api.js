import axios from 'axios'

// Dashboard API
export const dashboardAPI = {
  getStats: () => axios.get('/api/dashboard/stats'),
  getActiveTournaments: (limit = 5) => axios.get(`/api/dashboard/tournaments/active?limit=${limit}`),
  getTopPlayers: (limit = 3) => axios.get(`/api/dashboard/players/top?limit=${limit}`)
}

// User API
export const userAPI = {
  getProfile: () => axios.get('/api/user/profile'),
  getPublicProfile: (identifier) => axios.get(`/api/user/public/${identifier}`),
  getTournaments: () => axios.get('/api/user/tournaments'),
  setSteamId: (steamId) => axios.post('/api/user/set_steam_id', { steam_id: steamId }),
  syncSteam: () => axios.post('/api/user/sync-steam'),
  removeSteamId: () => axios.post('/api/user/remove_steam_id'),
  updateLabel: (label) => axios.post('/api/user/label', { label }),
  updateProfile: (data) => axios.put('/api/user/profile', data),
  getSessions: () => axios.get('/api/user/sessions'),
  revokeSession: (id) => axios.delete(`/api/user/sessions/${id}`),
  getMatches: () => axios.get('/api/user/matches'),
  getUserMatches: (identifier) => axios.get(`/api/user/${identifier}/matches`),
  getWallPosts: (identifier, page = 1, limit = 5) => axios.get(`/api/user/${identifier}/wall?page=${page}&limit=${limit}`),
  createWallPost: (content, targetUserId) => axios.post('/api/user/wall', { content, target_user_id: targetUserId }),
  deleteWallPost: (id) => axios.delete(`/api/user/wall/${id}`),
  toggleLikeWallPost: (id) => axios.post(`/api/user/wall/${id}/like`),
  addFriend: (id) => axios.post(`/api/user/friends/${id}`),
  removeFriend: (id) => axios.delete(`/api/user/friends/${id}`),
  createWallPostComment: (postId, content) => axios.post(`/api/user/wall/${postId}/comment`, { content }),
  deleteWallPostComment: (commentId) => axios.delete(`/api/user/wall/comment/${commentId}`),
  deleteAllWallPosts: (userId) => axios.delete(`/api/user/${userId}/wall/all`),
  acceptRules: () => axios.post('/api/user/accept-rules')
}

// Players API
export const playersAPI = {
  getPlayers: (params) => axios.get('/api/players', { params }),
  getPlayerMatches: (steamId, params) => axios.get(`/api/players/${steamId}/matches`, { params })
}

// Matches API
export const matchesAPI = {
  getMatches: (params) => axios.get('/api/matches', { params }),
  getMatch: (id) => axios.get(`/api/matches/${id}`)
}

// Lobby API (Formerly Tournament API)
export const lobbyAPI = {
  getLobbies: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return axios.get(`/api/lobbies?${query}`)
  },
  getLobby: (id) => axios.get(`/api/lobbies/${id}`),
  createLobby: (data) => axios.post('/api/lobbies', data),
  getParticipants: (id) => axios.get(`/api/lobbies/${id}/participants`),
  joinLobby: (id, password) => axios.post(`/api/lobbies/${id}/join`, { password }),
  leaveLobby: (id) => axios.post(`/api/lobbies/${id}/leave`),
  kickUser: (id, userId) => axios.post(`/api/lobbies/${id}/kick`, { user_id: userId }),
  cancelLobby: (id) => axios.post(`/api/lobbies/${id}/cancel`),
  resetLobby: (id) => axios.post(`/api/lobbies/${id}/reset`),
  startAuto: (id) => axios.post(`/api/lobbies/${id}/start_auto`),
  startDraft: (id) => axios.post(`/api/lobbies/${id}/start_draft`),
  setCaptains: (id, cap1, cap2) => axios.post(`/api/lobbies/${id}/set_captains`, { captain1_id: cap1, captain2_id: cap2 }),
  draftPick: (id, userId) => axios.post(`/api/lobbies/${id}/draft_pick`, { picked_user_id: userId }),
  vetoMap: (id, map, action) => axios.post(`/api/lobbies/${id}/veto_map`, { map_name: map, action }),
  invite: (id, userId) => axios.post(`/api/lobbies/${id}/invite`, { user_id: userId }),
  setTeamName: (id, name) => axios.post(`/api/lobbies/${id}/set_team_names`, { name }),
  updateLobby: (id, data) => axios.put(`/api/lobbies/${id}`, data)
}

// Team API
export const teamAPI = {
  getTeams: (params) => axios.get('/api/teams', { params }),
  getTeam: (id) => axios.get(`/api/teams/${id}`),
  createTeam: (data) => axios.post('/api/teams', data),
  updateTeam: (id, data) => axios.put(`/api/teams/${id}`, data),
  deleteTeam: (id) => axios.delete(`/api/teams/${id}`),
  addMember: (id, userId) => axios.post(`/api/teams/${id}/members`, { user_id: userId }),
  removeMember: (id, userId) => axios.delete(`/api/teams/${id}/members/${userId}`),
  joinTeam: (id) => axios.post(`/api/teams/${id}/join`),
  acceptMember: (id, userId) => axios.post(`/api/teams/${id}/members/${userId}/accept`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return axios.post('/api/upload', formData);
  }
}

// Tournament API (New Real Tournaments)
export const tournamentAPI = {
  getTournaments: (params) => axios.get('/api/tournaments', { params }),
  getTournament: (id) => axios.get(`/api/tournaments/${id}`),
  getTournamentTeams: (id) => axios.get(`/api/tournaments/${id}/teams`),
  createTournament: (data) => axios.post('/api/tournaments', data),
  registerTeam: (id, teamId) => axios.post(`/api/tournaments/${id}/register`, { team_id: teamId }),
  leaveTournament: (id) => axios.post(`/api/tournaments/${id}/leave`),
  startTournament: (id) => axios.post(`/api/tournaments/${id}/start`),
  getParticipants: (id) => axios.get(`/api/tournaments/${id}/participants`),
  getBrackets: (id) => axios.get(`/api/tournaments/${id}/brackets`),
  updateMatch: (tournamentId, matchId, data) => axios.put(`/api/tournaments/${tournamentId}/matches/${matchId}`, data),
  updateTournament: (id, data) => axios.put(`/api/tournaments/${id}`, data),
  deleteTournament: (id) => axios.delete(`/api/tournaments/${id}`),
  inviteTeam: (id, teamId) => axios.post(`/api/tournaments/${id}/invite`, { team_id: teamId }),
  vetoMap: (tournamentId, matchId, mapName) => axios.post(`/api/tournaments/${tournamentId}/matches/${matchId}/veto`, { map_name: mapName }),
  startVeto: (tournamentId, matchId) => axios.post(`/api/tournaments/${tournamentId}/matches/${matchId}/veto`, { action: 'start' })
}

// Notification API
export const notificationAPI = {
  getNotifications: () => axios.get('/api/notifications'),
  markRead: (id) => axios.post(`/api/notifications/${id}/read`),
  readAll: () => axios.post('/api/notifications/read_all'),
  clearRead: () => axios.delete('/api/notifications/clear_read')
}

// Auth API
export const authAPI = {
  telegramLogin: (data) => axios.post('/api/auth/telegram', data),
  verifyToken: () => axios.post('/api/auth/verify')
}

// Admin API
export const adminAPI = {
  getUsers: (params) => axios.get('/api/admin/users', { params }),
  updateUserRole: (id, role) => axios.put(`/api/admin/users/${id}/role`, { role }),
  banUser: (id, is_blocked, blocked_until) => axios.put(`/api/admin/users/${id}/ban`, { is_blocked, blocked_until }),
  getSettings: () => axios.get('/api/admin/settings'),
  updateSettings: (settings) => axios.put('/api/admin/settings', { settings }),
  kickLobbyUser: (lobbyId, userId) => axios.post(`/api/admin/lobbies/${lobbyId}/kick`, { user_id: userId }),
  addLobbyUser: (lobbyId, userId) => axios.post(`/api/admin/lobbies/${lobbyId}/add`, { user_id: userId }),
  kickTournamentTeam: (tournamentId, teamId) => axios.post(`/api/admin/tournaments/${tournamentId}/kick-team`, { team_id: teamId }),
  addTournamentTeam: (tournamentId, teamId) => axios.post(`/api/admin/tournaments/${tournamentId}/add-team`, { team_id: teamId }),
  getUserStats: (id) => axios.get(`/api/admin/users/${id}/stats`),
  updateUserProfile: (id, data) => axios.put(`/api/admin/users/${id}/profile`, data),
  impersonateUser: (id) => axios.post(`/api/admin/users/${id}/impersonate`),

  // Match Linking
  getUnlinkedMatches: () => axios.get('/api/admin/matches/unlinked'),
  linkMatch: (id, data) => axios.post(`/api/admin/matches/${id}/link`, data),

  // Match Management
  getMatches: (params) => axios.get('/api/admin/matches', { params }),
  deleteMatch: (id) => axios.delete(`/api/admin/matches/${id}`),

  // Team Management
  getTeams: (params) => axios.get('/api/admin/teams', { params }),
  updateTeam: (id, data) => axios.put(`/api/admin/teams/${id}`, data),
  deleteTeam: (id) => axios.delete(`/api/admin/teams/${id}`),

  // Tournament Management (Extended)
  getTournaments: (params) => axios.get('/api/admin/tournaments', { params }),
  updateTournament: (id, data) => axios.put(`/api/admin/tournaments/${id}`, data),
  deleteTournament: (id) => axios.delete(`/api/admin/tournaments/${id}`),

  // Lobby Management (Regular 5v5)
  getLobbies: (params) => axios.get('/api/admin/lobbies', { params }),
  getLobbyParticipants: (id) => axios.get(`/api/admin/lobbies/${id}/participants`),
  deleteLobby: (id) => axios.delete(`/api/admin/lobbies/${id}`),
  updateLobby: (id, data) => axios.put(`/api/admin/lobbies/${id}`, data),

  // User History
  getUserLobbies: (userId) => axios.get(`/api/admin/users/${userId}/lobbies`),
  getUserTournaments: (userId) => axios.get(`/api/admin/users/${userId}/tournaments`)
}

// Error handler
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'Ошибка сервера'
    throw new Error(message)
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('Ошибка сети - проверьте подключение к интернету')
  } else {
    // Something else happened
    throw new Error(error.message || 'Произошла неизвестная ошибка')
  }
}
