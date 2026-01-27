'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Helper function to check if index exists
    const indexExists = async (tableName, indexName) => {
      const [results] = await queryInterface.sequelize.query(
        `SHOW INDEX FROM ${tableName} WHERE Key_name = '${indexName}'`
      );
      return results.length > 0;
    };

    // 1. Index on player_summary.rating (for Leaderboards)
    if (!(await indexExists('player_summary', 'idx_player_summary_rating'))) {
      await queryInterface.addIndex('player_summary', ['rating'], {
        name: 'idx_player_summary_rating',
        unique: false
      });
      console.log('✅ Created index: idx_player_summary_rating');
    } else {
      console.log('⚠️  Index already exists: idx_player_summary_rating');
    }

    // 2. Index on player_summary.total_matches (for Qualification check)
    if (!(await indexExists('player_summary', 'idx_player_summary_total_matches'))) {
      await queryInterface.addIndex('player_summary', ['total_matches'], {
        name: 'idx_player_summary_total_matches',
        unique: false
      });
      console.log('✅ Created index: idx_player_summary_total_matches');
    } else {
      console.log('⚠️  Index already exists: idx_player_summary_total_matches');
    }

    // 3. Index on participants.user_id (for User History)
    if (!(await indexExists('participants', 'idx_participants_user_id'))) {
      await queryInterface.addIndex('participants', ['user_id'], {
        name: 'idx_participants_user_id',
        unique: false
      });
      console.log('✅ Created index: idx_participants_user_id');
    } else {
      console.log('⚠️  Index already exists: idx_participants_user_id');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Helper function to check if index exists
    const indexExists = async (tableName, indexName) => {
      const [results] = await queryInterface.sequelize.query(
        `SHOW INDEX FROM ${tableName} WHERE Key_name = '${indexName}'`
      );
      return results.length > 0;
    };

    if (await indexExists('player_summary', 'idx_player_summary_rating')) {
      await queryInterface.removeIndex('player_summary', 'idx_player_summary_rating');
    }
    if (await indexExists('player_summary', 'idx_player_summary_total_matches')) {
      await queryInterface.removeIndex('player_summary', 'idx_player_summary_total_matches');
    }
    if (await indexExists('participants', 'idx_participants_user_id')) {
      await queryInterface.removeIndex('participants', 'idx_participants_user_id');
    }
  }
};
