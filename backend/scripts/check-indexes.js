const { sequelize } = require('../config/database');

async function checkIndexes() {
    try {
        console.log('🔍 Checking existing indexes...\n');

        // Check player_summary indexes
        const [playerSummaryIndexes] = await sequelize.query(`
      SHOW INDEX FROM player_summary
    `);

        console.log('📊 player_summary indexes:');
        playerSummaryIndexes.forEach(idx => {
            console.log(`  - ${idx.Key_name} on column ${idx.Column_name}`);
        });

        // Check participants indexes
        const [participantsIndexes] = await sequelize.query(`
      SHOW INDEX FROM participants
    `);

        console.log('\n📊 participants indexes:');
        participantsIndexes.forEach(idx => {
            console.log(`  - ${idx.Key_name} on column ${idx.Column_name}`);
        });

        // Check migration status
        const [migrations] = await sequelize.query(`
      SELECT * FROM SequelizeMeta ORDER BY name
    `);

        console.log('\n✅ Applied migrations:');
        migrations.forEach(m => {
            console.log(`  - ${m.name}`);
        });

        await sequelize.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkIndexes();
