const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lobby = sequelize.define('Lobby', {
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
    image_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    date_time: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    format: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'BO3'
    },
    max_participants: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'registering'
    },
    map_pool: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    captain1_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    captain2_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    first_draft_captain_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    first_captain_via_dice: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    dice_results: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    draft_state: {
        type: DataTypes.JSON,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'lobbies',
    timestamps: false
});

// Instance methods
Lobby.prototype.getCurrentParticipants = async function () {
    const [results] = await sequelize.query(
        'SELECT COUNT(*) as count FROM participants WHERE tournament_id = ?',
        { replacements: [this.id] }
    );
    return parseInt(results[0].count) || 0;
};

Lobby.prototype.isRegistrationOpen = function () {
    return this.status === 'registering';
};

module.exports = Lobby;
