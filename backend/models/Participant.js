const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Participant = sequelize.define('Participant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tournament_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lobbies',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  team_number: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Номер команды (1 или 2)'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'participants',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['tournament_id', 'user_id']
    }
  ]
});

module.exports = Participant;
