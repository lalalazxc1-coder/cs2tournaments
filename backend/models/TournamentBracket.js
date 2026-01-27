const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TournamentBracket = sequelize.define('TournamentBracket', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tournament_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    round: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    match_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    team1_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    team2_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    winner_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'scheduled' // 'scheduled', 'live', 'completed'
    },
    scheduled_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    group: {
        type: DataTypes.STRING(10),
        defaultValue: 'upper' // 'upper', 'lower', 'final'
    },
    match_type: {
        type: DataTypes.STRING(10),
        defaultValue: 'bo1'
    },
    map_state: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'tournament_brackets',
    timestamps: false
});

module.exports = TournamentBracket;
