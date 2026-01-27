const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tournament = sequelize.define('Tournament', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  banner_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  format: {
    type: DataTypes.STRING(50),
    defaultValue: 'single_elimination' // 'single_elimination', 'double_elimination', 'round_robin'
  },
  type: {
    type: DataTypes.STRING(20),
    defaultValue: '5v5'
  },
  max_teams: {
    type: DataTypes.INTEGER,
    defaultValue: 16
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  registration_start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  registration_end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  prize_pool: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  rules: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  round_config: {
    type: DataTypes.JSON,
    allowNull: true
  },
  map_pool: {
    type: DataTypes.JSON,
    allowNull: true
  },
  prize_distribution: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'upcoming' // 'upcoming', 'registration', 'ongoing', 'completed', 'cancelled'
  },
  creator_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'tournaments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Tournament;
