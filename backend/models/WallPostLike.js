const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WallPostLike = sequelize.define('WallPostLike', {
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
    wall_post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'wall_posts',
            key: 'id'
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'wall_post_likes',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'wall_post_id']
        }
    ]
});

module.exports = WallPostLike;
