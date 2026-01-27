const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const NicknameHistory = sequelize.define('NicknameHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Assuming table name is 'users'
            key: 'id'
        }
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    changed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'nickname_history',
    timestamps: false
});

module.exports = NicknameHistory;
