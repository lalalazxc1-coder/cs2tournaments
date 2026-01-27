'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Users table
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            telegram_id: {
                type: Sequelize.BIGINT,
                unique: true,
                allowNull: false
            },
            username: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            nickname: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            steam_id: {
                type: Sequelize.BIGINT,
                allowNull: true
            },
            player_label: {
                type: Sequelize.STRING(30),
                allowNull: true
            },
            role: {
                type: Sequelize.TINYINT,
                defaultValue: 0,
                comment: '0=player, 1=organizer, 2=admin'
            },
            is_blocked: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            blocked_until: {
                type: Sequelize.DATE,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Tournaments table
        await queryInterface.createTable('tournaments', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            date_time: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            format: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'BO3'
            },
            max_participants: {
                type: Sequelize.INTEGER,
                defaultValue: 10
            },
            creator_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            status: {
                type: Sequelize.STRING(50),
                defaultValue: 'registering'
            },
            map_pool: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            captain1_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            captain2_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            first_draft_captain_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            first_captain_via_dice: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            dice_results: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            draft_state: {
                type: Sequelize.JSON,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Participants table
        await queryInterface.createTable('participants', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            tournament_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'tournaments',
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
            team_number: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'Номер команды (1 или 2)'
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Matches table
        await queryInterface.createTable('matches', {
            match_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            demo_filename: {
                type: Sequelize.STRING(255),
                unique: true
            },
            map_name: {
                type: Sequelize.STRING(100)
            },
            team_a_score: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            team_b_score: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            winning_team_name: {
                type: Sequelize.STRING(255)
            },
            total_rounds: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            game_date: {
                type: Sequelize.DATE
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Player Stats table
        await queryInterface.createTable('player_stats', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            match_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'matches',
                    key: 'match_id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            player_name: {
                type: Sequelize.STRING(255)
            },
            player_steamid: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            team_name: {
                type: Sequelize.STRING(255)
            },
            is_winner: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            kills: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            deaths: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            assists: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            adr: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0
            },
            hs_percent: {
                type: Sequelize.DECIMAL(5, 2),
                defaultValue: 0
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Player Summary table
        await queryInterface.createTable('player_summary', {
            player_steamid: {
                type: Sequelize.STRING(255),
                primaryKey: true,
                allowNull: false
            },
            player_name: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            total_matches: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            wins: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            losses: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            win_rate: {
                type: Sequelize.DECIMAL(5, 2),
                defaultValue: 0.00
            },
            total_kills: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            total_deaths: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            total_assists: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            k_d_ratio: {
                type: Sequelize.DECIMAL(5, 2),
                defaultValue: 0.00
            },
            avg_adr: {
                type: Sequelize.DECIMAL(6, 2),
                defaultValue: 0.00
            },
            avg_hs_percent: {
                type: Sequelize.DECIMAL(5, 2),
                defaultValue: 0.00
            },
            last_updated: {
                type: Sequelize.STRING(255),
                allowNull: true
            }
        });

        // Notifications table
        await queryInterface.createTable('notifications', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            type: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            related_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            is_read: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // System Settings table
        await queryInterface.createTable('system_settings', {
            key: {
                type: Sequelize.STRING(255),
                primaryKey: true,
                allowNull: false
            },
            value: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            description: {
                type: Sequelize.STRING(255),
                allowNull: true
            }
        });

        // Add indexes
        await queryInterface.addIndex('participants', ['tournament_id', 'user_id'], {
            unique: true,
            name: 'participants_tournament_user_unique'
        });
        await queryInterface.addIndex('notifications', ['user_id', 'is_read']);
        await queryInterface.addIndex('tournaments', ['status']);
        await queryInterface.addIndex('player_stats', ['match_id']);
        await queryInterface.addIndex('player_stats', ['player_steamid']);
        await queryInterface.addIndex('matches', ['demo_filename']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('system_settings');
        await queryInterface.dropTable('notifications');
        await queryInterface.dropTable('player_stats');
        await queryInterface.dropTable('matches');
        await queryInterface.dropTable('player_summary');
        await queryInterface.dropTable('participants');
        await queryInterface.dropTable('tournaments');
        await queryInterface.dropTable('users');
    }
};
