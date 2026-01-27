const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Friend = sequelize.define('Friend', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    friend_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted'),
        defaultValue: 'pending'
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'friends',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'friend_id']
        }
    ]
});

module.exports = Friend;
