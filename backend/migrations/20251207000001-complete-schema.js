'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if tables exist before creating them
        const tables = await queryInterface.showAllTables();

        // ========== TEAMS ==========
        if (!tables.includes('teams')) {
            await queryInterface.createTable('teams', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                name: {
                    type: Sequelize.STRING(255),
                    allowNull: false
                },
                logo_url: {
                    type: Sequelize.STRING(500),
                    allowNull: true
                },
                captain_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                description: {
                    type: Sequelize.TEXT,
                    allowNull: true
                },
                is_active: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: true
                },
                created_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                },
                updated_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                }
            });

            await queryInterface.addIndex('teams', ['captain_id']);
        }

        // ========== TEAM MEMBERS ==========
        if (!tables.includes('team_members')) {
            await queryInterface.createTable('team_members', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                team_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'teams',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                user_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                role: {
                    type: Sequelize.STRING(50),
                    defaultValue: 'member',
                    comment: 'member, captain, etc.'
                },
                status: {
                    type: Sequelize.STRING(50),
                    defaultValue: 'pending',
                    comment: 'pending, member, rejected'
                },
                created_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                },
                updated_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                }
            });

            await queryInterface.addIndex('team_members', ['team_id', 'user_id'], {
                unique: true,
                name: 'team_members_team_user_unique'
            });
        }

        // ========== REAL TOURNAMENTS ==========
        if (!tables.includes('real_tournaments')) {
            await queryInterface.createTable('real_tournaments', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                name: {
                    type: Sequelize.STRING(255),
                    allowNull: false
                },
                description: {
                    type: Sequelize.TEXT,
                    allowNull: true
                },
                format: {
                    type: Sequelize.STRING(50),
                    defaultValue: 'single_elimination',
                    comment: 'single_elimination, double_elimination, round_robin'
                },
                type: {
                    type: Sequelize.STRING(50),
                    defaultValue: 'team',
                    comment: 'team or solo'
                },
                max_teams: {
                    type: Sequelize.INTEGER,
                    defaultValue: 8
                },
                start_date: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                end_date: {
                    type: Sequelize.DATE,
                    allowNull: true
                },
                prize_pool: {
                    type: Sequelize.DECIMAL(12, 2),
                    defaultValue: 0
                },
                rules: {
                    type: Sequelize.TEXT,
                    allowNull: true
                },
                status: {
                    type: Sequelize.STRING(50),
                    defaultValue: 'upcoming',
                    comment: 'upcoming, registration, registration_closed, ongoing, completed'
                },
                creator_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                created_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                },
                updated_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                }
            });

            await queryInterface.addIndex('real_tournaments', ['status']);
            await queryInterface.addIndex('real_tournaments', ['creator_id']);
        }

        // ========== TOURNAMENT TEAMS ==========
        if (!tables.includes('tournament_teams')) {
            await queryInterface.createTable('tournament_teams', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                tournament_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'real_tournaments',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                team_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'teams',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                seed: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    comment: 'Seeding position for bracket generation'
                },
                status: {
                    type: Sequelize.STRING(50),
                    defaultValue: 'registered',
                    comment: 'registered, eliminated, winner'
                },
                created_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                },
                updated_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                }
            });

            await queryInterface.addIndex('tournament_teams', ['tournament_id', 'team_id'], {
                unique: true,
                name: 'tournament_teams_tournament_team_unique'
            });
        }

        // ========== TOURNAMENT BRACKETS ==========
        if (!tables.includes('tournament_brackets')) {
            await queryInterface.createTable('tournament_brackets', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                tournament_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'real_tournaments',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                round: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: 'Round number (1, 2, 3, etc.)'
                },
                match_number: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: 'Match number within the round'
                },
                team1_id: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'teams',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL'
                },
                team2_id: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'teams',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL'
                },
                winner_id: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'teams',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL'
                },
                status: {
                    type: Sequelize.STRING(50),
                    defaultValue: 'scheduled',
                    comment: 'scheduled, in_progress, completed'
                },
                scheduled_time: {
                    type: Sequelize.DATE,
                    allowNull: true
                },
                group: {
                    type: Sequelize.STRING(50),
                    defaultValue: 'upper',
                    comment: 'upper, lower, final (for double elimination)'
                }
            });
        }

        // ========== FRIENDS ==========
        if (!tables.includes('friends')) {
            await queryInterface.createTable('friends', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                user_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                friend_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                status: {
                    type: Sequelize.STRING(50),
                    defaultValue: 'pending',
                    comment: 'pending, accepted, blocked'
                },
                created_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                }
            });

            await queryInterface.addIndex('friends', ['user_id', 'friend_id'], {
                unique: true,
                name: 'friends_user_friend_unique'
            });
        }

        // ========== WALL POSTS ==========
        if (!tables.includes('wall_posts')) {
            await queryInterface.createTable('wall_posts', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                user_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: 'Owner of the wall',
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                author_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: 'Author of the post',
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                content: {
                    type: Sequelize.TEXT,
                    allowNull: false
                },
                created_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                },
                updated_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                }
            });

            await queryInterface.addIndex('wall_posts', ['user_id']);
            await queryInterface.addIndex('wall_posts', ['author_id']);
        }

        // ========== WALL POST LIKES ==========
        if (!tables.includes('wall_post_likes')) {
            await queryInterface.createTable('wall_post_likes', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                wall_post_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'wall_posts',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                user_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                created_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                }
            });

            await queryInterface.addIndex('wall_post_likes', ['wall_post_id', 'user_id'], {
                unique: true,
                name: 'wall_post_likes_post_user_unique'
            });
        }

        // ========== WALL POST COMMENTS ==========
        if (!tables.includes('wall_post_comments')) {
            await queryInterface.createTable('wall_post_comments', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                wall_post_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'wall_posts',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                author_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                content: {
                    type: Sequelize.TEXT,
                    allowNull: false
                },
                created_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                },
                updated_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                }
            });

            await queryInterface.addIndex('wall_post_comments', ['wall_post_id']);
        }

        // ========== PROFILE COMMENTS ==========
        if (!tables.includes('profile_comments')) {
            await queryInterface.createTable('profile_comments', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                user_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                author_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                content: {
                    type: Sequelize.TEXT,
                    allowNull: false
                },
                created_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                }
            });
        }

        // ========== USER SESSIONS ==========
        if (!tables.includes('user_sessions')) {
            await queryInterface.createTable('user_sessions', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                user_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                token: {
                    type: Sequelize.STRING(500),
                    allowNull: false,
                    unique: true
                },
                ip_address: {
                    type: Sequelize.STRING(45),
                    allowNull: true
                },
                user_agent: {
                    type: Sequelize.TEXT,
                    allowNull: true
                },
                last_activity: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                },
                created_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                }
            });

            await queryInterface.addIndex('user_sessions', ['user_id']);
            await queryInterface.addIndex('user_sessions', ['token']);
        }

        // ========== NICKNAME HISTORY ==========
        if (!tables.includes('nickname_history')) {
            await queryInterface.createTable('nickname_history', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                user_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                nickname: {
                    type: Sequelize.STRING(255),
                    allowNull: false
                },
                changed_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                }
            });

            await queryInterface.addIndex('nickname_history', ['user_id']);
        }
    },

    async down(queryInterface, Sequelize) {
        // Drop tables in reverse order
        await queryInterface.dropTable('nickname_history');
        await queryInterface.dropTable('user_sessions');
        await queryInterface.dropTable('profile_comments');
        await queryInterface.dropTable('wall_post_comments');
        await queryInterface.dropTable('wall_post_likes');
        await queryInterface.dropTable('wall_posts');
        await queryInterface.dropTable('friends');
        await queryInterface.dropTable('tournament_brackets');
        await queryInterface.dropTable('tournament_teams');
        await queryInterface.dropTable('real_tournaments');
        await queryInterface.dropTable('team_members');
        await queryInterface.dropTable('teams');
    }
};
