const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlayerMatchStats = sequelize.define('PlayerMatchStats', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    match_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    player_steamid: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    player_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    team_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    is_winner: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    kills: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    deaths: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    assists: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    kd: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    kpr: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    hs: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    hs_percent: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    adr: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    mvp: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'MVP'
    },
    '5k': {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    '4k': {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    '3k': {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    '2k': {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'player_stats',
    timestamps: false
});

module.exports = PlayerMatchStats;
