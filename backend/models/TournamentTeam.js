const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TournamentTeam = sequelize.define('TournamentTeam', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tournament_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    seed: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'registered' // 'registered', 'confirmed', 'disqualified'
    }
}, {
    tableName: 'tournament_teams',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TournamentTeam;
