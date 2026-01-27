'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('tournaments', 'banner_url', {
            type: Sequelize.STRING(255),
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('tournaments', 'banner_url');
    }
};
