const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeamMember = sequelize.define('TeamMember', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING(20),
        defaultValue: 'member' // 'captain', 'member', 'standin'
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'member' // 'member', 'pending' (request), 'invited' (invite)
    }
}, {
    tableName: 'team_members',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TeamMember;
