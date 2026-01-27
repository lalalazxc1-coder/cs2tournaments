'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('tournaments', 'registration_start_date', {
            type: Sequelize.DATE,
            allowNull: true
        });
        await queryInterface.addColumn('tournaments', 'registration_end_date', {
            type: Sequelize.DATE,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('tournaments', 'registration_start_date');
        await queryInterface.removeColumn('tournaments', 'registration_end_date');
    }
};
