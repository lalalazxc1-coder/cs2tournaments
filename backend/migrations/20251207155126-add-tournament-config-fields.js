'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add round_config to tournaments table
    await queryInterface.addColumn('tournaments', 'round_config', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Configuration for rounds (e.g. BO1, BO3)'
    });

    // Add match_type to tournament_brackets table
    await queryInterface.addColumn('tournament_brackets', 'match_type', {
      type: Sequelize.STRING(10),
      defaultValue: 'bo1',
      allowNull: false
    });

    // Add map_state to tournament_brackets table
    await queryInterface.addColumn('tournament_brackets', 'map_state', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'State of maps (veto, picks, results)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tournaments', 'round_config');
    await queryInterface.removeColumn('tournament_brackets', 'match_type');
    await queryInterface.removeColumn('tournament_brackets', 'map_state');
  }
};
