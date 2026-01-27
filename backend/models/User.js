const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nickname: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  nickname_changed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  avatar_changed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  steam_id: {
    type: DataTypes.STRING, // SteamID64
    unique: true,
    allowNull: true
  },
  avatar_full: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatar_medium: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profile_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  real_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profile_bg: {
    type: DataTypes.STRING,
    allowNull: true
  },
  custom_url: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  privacy_settings: {
    type: DataTypes.JSON,
    defaultValue: {
      profile_visibility: 'public',
      wall_visibility: 'public',
      friends_visibility: 'public'
    }
  },
  last_seen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  player_label: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  role: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '0=player, 1=organizer, 2=admin'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_blocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  blocked_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rules_accepted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: false
});

// Instance methods
User.prototype.getDisplayName = function () {
  return this.nickname || `User_${this.id}`;
};

User.prototype.isAdmin = function () {
  return this.role === 2;
};

User.prototype.isOrganizer = function () {
  return this.role >= 1;
};

module.exports = User;
