const { sequelize } = require('./config/database');

async function updateSchema() {
    try {
        console.log('Checking database schema...');

        const queryInterface = sequelize.getQueryInterface();

        // 1. Update player_stats table
        const statsTable = 'player_stats';
        const statsColumns = {
            'kd': 'FLOAT DEFAULT 0',
            'kpr': 'FLOAT DEFAULT 0',
            'hs': 'INTEGER DEFAULT 0',
            '5k': 'INTEGER DEFAULT 0',
            '4k': 'INTEGER DEFAULT 0',
            '3k': 'INTEGER DEFAULT 0',
            '2k': 'INTEGER DEFAULT 0',
            'MVP': 'INTEGER DEFAULT 0'
        };

        for (const [col, type] of Object.entries(statsColumns)) {
            try {
                // Try to describe the table to see if column exists, or just try to add it
                // Simplest way in raw SQL for MySQL is often just trying to add and catching error, 
                // or using describeTable
                const tableInfo = await queryInterface.describeTable(statsTable);
                if (!tableInfo[col]) {
                    console.log(`Adding column ${col} to ${statsTable}...`);
                    await sequelize.query(`ALTER TABLE ${statsTable} ADD COLUMN \`${col}\` ${type};`);
                } else {
                    console.log(`Column ${col} already exists in ${statsTable}.`);
                }
            } catch (err) {
                console.error(`Error checking/adding column ${col} to ${statsTable}:`, err.message);
            }
        }

        // 2. Update player_summary table
        const summaryTable = 'player_summary';
        const summaryColumns = {
            'total_hs': 'INTEGER DEFAULT 0',
            'avg_kpr': 'FLOAT DEFAULT 0',
            'total_5k': 'INTEGER DEFAULT 0',
            'total_4k': 'INTEGER DEFAULT 0',
            'total_3k': 'INTEGER DEFAULT 0',
            'total_2k': 'INTEGER DEFAULT 0',
            'total_MVP': 'INTEGER DEFAULT 0',
            'total_assists': 'INTEGER DEFAULT 0'
        };

        for (const [col, type] of Object.entries(summaryColumns)) {
            try {
                const tableInfo = await queryInterface.describeTable(summaryTable);
                if (!tableInfo[col]) {
                    console.log(`Adding column ${col} to ${summaryTable}...`);
                    await sequelize.query(`ALTER TABLE ${summaryTable} ADD COLUMN \`${col}\` ${type};`);
                } else {
                    console.log(`Column ${col} already exists in ${summaryTable}.`);
                }
            } catch (err) {
                console.error(`Error checking/adding column ${col} to ${summaryTable}:`, err.message);
            }
        }

        // 3. Update users table
        const usersTable = 'users';
        const usersColumns = {
            'rules_accepted_at': 'DATETIME NULL'
        };

        for (const [col, type] of Object.entries(usersColumns)) {
            try {
                const tableInfo = await queryInterface.describeTable(usersTable);
                if (!tableInfo[col]) {
                    console.log(`Adding column ${col} to ${usersTable}...`);
                    await sequelize.query(`ALTER TABLE ${usersTable} ADD COLUMN \`${col}\` ${type};`);
                } else {
                    console.log(`Column ${col} already exists in ${usersTable}.`);
                }
            } catch (err) {
                console.error(`Error checking/adding column ${col} to ${usersTable}:`, err.message);
            }
        }



        console.log('Schema update completed.');
        process.exit(0);
    } catch (error) {
        console.error('Schema update failed:', error);
        process.exit(1);
    }
}

updateSchema();
