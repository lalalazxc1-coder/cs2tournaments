const { sequelize } = require('../config/database');

// Import models
const User = require('./User');
const Lobby = require('./Lobby');
const Tournament = require('./Tournament');
const Team = require('./Team');
const TeamMember = require('./TeamMember');
const TournamentBracket = require('./TournamentBracket');
const TournamentTeam = require('./TournamentTeam');
const Participant = require('./Participant');
const PlayerSummary = require('./PlayerSummary');
const SystemSetting = require('./SystemSetting');
const Notification = require('./Notification');

const Friend = require('./Friend');
const WallPost = require('./WallPost');
const ProfileComment = require('./ProfileComment');
const UserSession = require('./UserSession');

// --- LOBBY ASSOCIATIONS (Formerly Tournament) ---
User.hasMany(Lobby, {
  foreignKey: 'creator_id',
  as: 'createdLobbies'
});

Lobby.belongsTo(User, {
  foreignKey: 'creator_id',
  as: 'creator'
});

Lobby.hasMany(Participant, {
  foreignKey: 'tournament_id', // Keeping DB column name as is for now to avoid migration issues if not requested
  as: 'participants'
});

Participant.belongsTo(Lobby, {
  foreignKey: 'tournament_id',
  as: 'lobby'
});

// --- TEAM ASSOCIATIONS ---
User.hasMany(Team, {
  foreignKey: 'captain_id',
  as: 'captainedTeams'
});

Team.belongsTo(User, {
  foreignKey: 'captain_id',
  as: 'captain'
});

Team.hasMany(TeamMember, {
  foreignKey: 'team_id',
  as: 'members'
});

TeamMember.belongsTo(Team, {
  foreignKey: 'team_id',
  as: 'team'
});

User.hasMany(TeamMember, {
  foreignKey: 'user_id',
  as: 'teamMemberships'
});

TeamMember.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// --- TOURNAMENT ASSOCIATIONS (New) ---
User.hasMany(Tournament, {
  foreignKey: 'creator_id',
  as: 'createdTournaments'
});

Tournament.belongsTo(User, {
  foreignKey: 'creator_id',
  as: 'creator'
});

Tournament.hasMany(TournamentTeam, {
  foreignKey: 'tournament_id',
  as: 'teams'
});

TournamentTeam.belongsTo(Tournament, {
  foreignKey: 'tournament_id',
  as: 'tournament'
});

TournamentTeam.belongsTo(Team, {
  foreignKey: 'team_id',
  as: 'team'
});

Team.hasMany(TournamentTeam, {
  foreignKey: 'team_id',
  as: 'tournamentEntries'
});

Tournament.hasMany(TournamentBracket, {
  foreignKey: 'tournament_id',
  as: 'brackets'
});

TournamentBracket.belongsTo(Tournament, {
  foreignKey: 'tournament_id',
  as: 'tournament'
});

TournamentBracket.belongsTo(Team, {
  foreignKey: 'team1_id',
  as: 'team1'
});

TournamentBracket.belongsTo(Team, {
  foreignKey: 'team2_id',
  as: 'team2'
});

TournamentBracket.belongsTo(Team, {
  foreignKey: 'winner_id',
  as: 'winner'
});

// --- EXISTING ASSOCIATIONS ---

Participant.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasMany(Participant, {
  foreignKey: 'user_id',
  as: 'participations'
});

// User and PlayerSummary association
User.hasOne(PlayerSummary, {
  foreignKey: 'player_steamid',
  sourceKey: 'steam_id',
  as: 'stats'
});

PlayerSummary.belongsTo(User, {
  foreignKey: 'player_steamid',
  targetKey: 'steam_id',
  as: 'user'
});

// Notification associations
User.hasMany(Notification, {
  foreignKey: 'user_id',
  as: 'notifications'
});

Notification.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// --- SOCIAL ASSOCIATIONS ---
// Friends
User.hasMany(Friend, { foreignKey: 'user_id', as: 'friends' });
User.hasMany(Friend, { foreignKey: 'friend_id', as: 'friendOf' });
Friend.belongsTo(User, { foreignKey: 'user_id', as: 'userProfile' });
Friend.belongsTo(User, { foreignKey: 'friend_id', as: 'friendProfile' });

const WallPostLike = require('./WallPostLike');
const WallPostComment = require('./WallPostComment');

// ... existing code ...

// Wall Posts
User.hasMany(WallPost, { foreignKey: 'user_id', as: 'wallPosts' }); // Posts on this user's wall
User.hasMany(WallPost, { foreignKey: 'author_id', as: 'authoredPosts' }); // Posts written by this user
WallPost.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });
WallPost.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// Wall Post Likes
User.hasMany(WallPostLike, { foreignKey: 'user_id', as: 'wallPostLikes' });
WallPostLike.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
WallPost.hasMany(WallPostLike, { foreignKey: 'wall_post_id', as: 'likes' });
WallPostLike.belongsTo(WallPost, { foreignKey: 'wall_post_id', as: 'wallPost' });

// Wall Post Comments
User.hasMany(WallPostComment, { foreignKey: 'author_id', as: 'wallPostComments' });
WallPostComment.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
WallPost.hasMany(WallPostComment, { foreignKey: 'wall_post_id', as: 'comments' });
WallPostComment.belongsTo(WallPost, { foreignKey: 'wall_post_id', as: 'wallPost' });

// Profile Comments
User.hasMany(ProfileComment, { foreignKey: 'user_id', as: 'profileComments' });
User.hasMany(ProfileComment, { foreignKey: 'author_id', as: 'authoredComments' });
ProfileComment.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });
ProfileComment.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

const NicknameHistory = require('./NicknameHistory');

// User Sessions
User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });
UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Nickname History
User.hasMany(NicknameHistory, { foreignKey: 'user_id', as: 'nicknameHistory' });
NicknameHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

const Match = require('./Match');

// ... existing associations ...

// --- MATCH ASSOCIATIONS (Parser) ---
TournamentBracket.hasMany(Match, {
  foreignKey: 'tournament_bracket_id',
  as: 'parserMatches'
});

Match.belongsTo(TournamentBracket, {
  foreignKey: 'tournament_bracket_id',
  as: 'bracket'
});

Lobby.hasMany(Match, {
  foreignKey: 'lobby_id',
  as: 'matches'
});

Match.belongsTo(Lobby, {
  foreignKey: 'lobby_id',
  as: 'lobby'
});

const PlayerMatchStats = require('./PlayerMatchStats');

Match.hasMany(PlayerMatchStats, {
  foreignKey: 'match_id',
  as: 'playerStats'
});

PlayerMatchStats.belongsTo(Match, {
  foreignKey: 'match_id',
  as: 'match'
});

module.exports = {
  sequelize,
  User,
  Lobby,
  Tournament,
  Team,
  TeamMember,
  TournamentBracket,
  TournamentTeam,
  Participant,
  PlayerSummary,
  SystemSetting,
  Notification,
  Friend,
  WallPost,
  WallPostLike,
  WallPostComment,
  ProfileComment,
  UserSession,
  NicknameHistory,
  Match,
  PlayerMatchStats
};
