'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // 1. Drop old triggers
            await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS before_player_summary_insert`, { transaction });
            await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS before_player_summary_update`, { transaction });

            // 2. Create new INSERT trigger with INDIVIDUAL SKILL focused formula
            // Formula: WinRate * 10 + K/D * 900 + Matches * 2 + 5k * 50 + MVP * 5
            await queryInterface.sequelize.query(`
        CREATE TRIGGER before_player_summary_insert
        BEFORE INSERT ON player_summary
        FOR EACH ROW
        BEGIN
          SET NEW.rating = ROUND(
            COALESCE(NEW.win_rate, 0) * 10 + 
            COALESCE(NEW.k_d_ratio, 0) * 900 + 
            COALESCE(NEW.total_matches, 0) * 2 + 
            COALESCE(NEW.total_5k, 0) * 50 + 
            COALESCE(NEW.total_MVP, 0) * 5
          );
        END
      `, { transaction });

            // 3. Create new UPDATE trigger
            await queryInterface.sequelize.query(`
        CREATE TRIGGER before_player_summary_update
        BEFORE UPDATE ON player_summary
        FOR EACH ROW
        BEGIN
          SET NEW.rating = ROUND(
            COALESCE(NEW.win_rate, 0) * 10 + 
            COALESCE(NEW.k_d_ratio, 0) * 900 + 
            COALESCE(NEW.total_matches, 0) * 2 + 
            COALESCE(NEW.total_5k, 0) * 50 + 
            COALESCE(NEW.total_MVP, 0) * 5
          );
        END
      `, { transaction });

            // 4. Recalculate existing ratings
            await queryInterface.sequelize.query(`
        UPDATE player_summary 
        SET rating = ROUND(
            COALESCE(win_rate, 0) * 10 + 
            COALESCE(k_d_ratio, 0) * 900 + 
            COALESCE(total_matches, 0) * 2 + 
            COALESCE(total_5k, 0) * 50 + 
            COALESCE(total_MVP, 0) * 5
        )
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
            // Revert to previous formula: WinRate * 15 + K/D * 800 + Matches * 2 + 5k * 50 + MVP * 5

            await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS before_player_summary_insert`, { transaction });
            await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS before_player_summary_update`, { transaction });

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

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
