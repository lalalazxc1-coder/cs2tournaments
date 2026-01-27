'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // 1. Add rating column
            await queryInterface.addColumn('player_summary', 'rating', {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            }, { transaction });

            // 2. Backfill data
            await queryInterface.sequelize.query(`
        UPDATE player_summary 
        SET rating = ROUND(
            COALESCE(win_rate, 0) * 15 + 
            COALESCE(k_d_ratio, 0) * 800 + 
            COALESCE(total_matches, 0) * 2 + 
            COALESCE(total_5k, 0) * 50 + 
            COALESCE(total_MVP, 0) * 5
        )
      `, { transaction });

            // 3. Create Triggers
            // Drop existing if any (safety check)
            await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS before_player_summary_insert`, { transaction });
            await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS before_player_summary_update`, { transaction });

            // Create INSERT trigger
            await queryInterface.sequelize.query(`
        CREATE TRIGGER before_player_summary_insert
        BEFORE INSERT ON player_summary
        FOR EACH ROW
        BEGIN
          SET NEW.rating = ROUND(
            COALESCE(NEW.win_rate, 0) * 15 + 
            COALESCE(NEW.k_d_ratio, 0) * 800 + 
            COALESCE(NEW.total_matches, 0) * 2 + 
            COALESCE(NEW.total_5k, 0) * 50 + 
            COALESCE(NEW.total_MVP, 0) * 5
          );
        END
      `, { transaction });

            // Create UPDATE trigger
            await queryInterface.sequelize.query(`
        CREATE TRIGGER before_player_summary_update
        BEFORE UPDATE ON player_summary
        FOR EACH ROW
        BEGIN
          SET NEW.rating = ROUND(
            COALESCE(NEW.win_rate, 0) * 15 + 
            COALESCE(NEW.k_d_ratio, 0) * 800 + 
            COALESCE(NEW.total_matches, 0) * 2 + 
            COALESCE(NEW.total_5k, 0) * 50 + 
            COALESCE(NEW.total_MVP, 0) * 5
          );
        END
      `, { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Drop triggers
            await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS before_player_summary_insert`, { transaction });
            await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS before_player_summary_update`, { transaction });

            // Remove column
            await queryInterface.removeColumn('player_summary', 'rating', { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
