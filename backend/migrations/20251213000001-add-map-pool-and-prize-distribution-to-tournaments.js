'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('tournaments', 'map_pool', {
            type: Sequelize.JSON,
            allowNull: true
        });
        await queryInterface.addColumn('tournaments', 'prize_distribution', {
            type: Sequelize.JSON,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('tournaments', 'map_pool');
        await queryInterface.removeColumn('tournaments', 'prize_distribution');
    }
};
