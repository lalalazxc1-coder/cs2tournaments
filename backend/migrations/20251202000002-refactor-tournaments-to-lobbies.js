'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Rename existing 'tournaments' table to 'lobbies'
        // Check if lobbies table already exists to avoid error if sync ran
        const tableExists = await queryInterface.tableExists('lobbies');
        if (!tableExists) {
            // If tournaments exists, rename it. If not, create lobbies.
            const tournamentsExists = await queryInterface.tableExists('tournaments');
            if (tournamentsExists) {
                await queryInterface.renameTable('tournaments', 'lobbies');
            } else {
                // Create lobbies table if neither exists (fallback)
                await queryInterface.createTable('lobbies', {
                    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
                    name: { type: Sequelize.STRING(255), allowNull: false },
                    date_time: { type: Sequelize.STRING(255), allowNull: false },
                    format: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'BO3' },
                    max_participants: { type: Sequelize.INTEGER, defaultValue: 10 },
                    creator_id: { type: Sequelize.INTEGER, allowNull: false },
                    status: { type: Sequelize.STRING(50), defaultValue: 'registering' },
                    map_pool: { type: Sequelize.TEXT, allowNull: true },
                    captain1_id: { type: Sequelize.INTEGER, allowNull: true },
                    captain2_id: { type: Sequelize.INTEGER, allowNull: true },
                    first_draft_captain_id: { type: Sequelize.INTEGER, allowNull: true },
                    first_captain_via_dice: { type: Sequelize.INTEGER, allowNull: true },
                    dice_results: { type: Sequelize.TEXT, allowNull: true },
                    draft_state: { type: Sequelize.JSON, allowNull: true },
                    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
                    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
                });
            }
        }

        // 2. Create Teams table
        await queryInterface.createTable('teams', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true
            },
            logo_url: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            captain_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
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

        // 3. Create Team Members table
        await queryInterface.createTable('team_members', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            team_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'teams', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            role: {
                type: Sequelize.STRING(50),
                defaultValue: 'member' // captain, member, standin
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

        // 4. Create NEW Tournaments table (Bracket based)
        // Note: If we renamed the old 'tournaments' to 'lobbies', we can now create a new 'tournaments' table.
        // If 'tournaments' still exists (e.g. sync recreated it), we might need to check.
        const tournamentsExists = await queryInterface.tableExists('tournaments');
        if (!tournamentsExists) {
            await queryInterface.createTable('tournaments', {
                id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
                name: { type: Sequelize.STRING(255), allowNull: false },
                description: { type: Sequelize.TEXT, allowNull: true },
                format: { type: Sequelize.STRING(50), defaultValue: 'Single Elimination' },
                type: { type: Sequelize.STRING(50), defaultValue: '5v5' },
                max_teams: { type: Sequelize.INTEGER, defaultValue: 8 },
                start_date: { type: Sequelize.DATE, allowNull: false },
                end_date: { type: Sequelize.DATE, allowNull: true },
                prize_pool: { type: Sequelize.STRING(255), allowNull: true },
                rules: { type: Sequelize.TEXT, allowNull: true },
                status: { type: Sequelize.STRING(50), defaultValue: 'registration' },
                creator_id: { type: Sequelize.INTEGER, allowNull: false },
                created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
                updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
            });
        }

        // 5. Create Tournament Teams (Participants)
        await queryInterface.createTable('tournament_teams', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            tournament_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'tournaments', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            team_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'teams', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            seed: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            status: {
                type: Sequelize.STRING(50),
                defaultValue: 'pending' // pending, approved, rejected
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

        // 6. Create Tournament Brackets
        await queryInterface.createTable('tournament_brackets', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            tournament_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'tournaments', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            round: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            match_number: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            team1_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'teams', key: 'id' }
            },
            team2_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'teams', key: 'id' }
            },
            winner_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'teams', key: 'id' }
            },
            status: {
                type: Sequelize.STRING(50),
                defaultValue: 'scheduled'
            },
            scheduled_time: {
                type: Sequelize.DATE,
                allowNull: true
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

        // 7. Update Matches table to link to Lobbies or Tournament Brackets
        await queryInterface.addColumn('matches', 'lobby_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'lobbies', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addColumn('matches', 'tournament_bracket_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'tournament_brackets', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('matches', 'tournament_bracket_id');
        await queryInterface.removeColumn('matches', 'lobby_id');
        await queryInterface.dropTable('tournament_brackets');
        await queryInterface.dropTable('tournament_teams');
        await queryInterface.dropTable('tournaments'); // Drops the NEW tournaments table
        await queryInterface.dropTable('team_members');
        await queryInterface.dropTable('teams');

        // Rename lobbies back to tournaments (if we want to fully revert)
        const lobbiesExists = await queryInterface.tableExists('lobbies');
        if (lobbiesExists) {
            await queryInterface.renameTable('lobbies', 'tournaments');
        }
    }
};
