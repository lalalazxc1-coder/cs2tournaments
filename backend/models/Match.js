const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Match = sequelize.define('Match', {
    match_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    demo_filename: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    map_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    team_a_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    team_b_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    winning_team_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    total_rounds: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    game_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    lobby_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tournament_bracket_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'matches',
    timestamps: false
});

module.exports = Match;
