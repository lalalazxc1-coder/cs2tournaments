const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WallPostComment = sequelize.define('WallPostComment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    wall_post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'wall_posts',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    author_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'wall_post_comments',
    timestamps: false
});

module.exports = WallPostComment;
