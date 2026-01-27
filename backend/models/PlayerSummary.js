const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlayerSummary = sequelize.define('PlayerSummary', {
  player_steamid: {
    type: DataTypes.STRING(255),
    allowNull: false,
    primaryKey: true
  },
  player_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  total_matches: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  wins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  losses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  win_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  total_kills: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_deaths: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_assists: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_hs: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  k_d_ratio: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  avg_kpr: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  avg_adr: {
    type: DataTypes.DECIMAL(6, 2),
    defaultValue: 0.00
  },
  avg_hs_percent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  total_5k: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_4k: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_3k: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_2k: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_MVP: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_MVP'
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_updated: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'player_summary',
  timestamps: false
});

// Instance methods
PlayerSummary.prototype.getWinRate = function () {
  if (this.total_matches === 0) return 0;
  return Math.round((this.wins / this.total_matches) * 100);
};

PlayerSummary.prototype.getKDRatio = function () {
  if (this.total_deaths === 0) return this.total_kills;
  return Math.round((this.total_kills / this.total_deaths) * 100) / 100;
};

PlayerSummary.prototype.isProPlayer = function () {
  return this.total_matches >= 50 && this.k_d_ratio >= 1.2;
};

module.exports = PlayerSummary;
