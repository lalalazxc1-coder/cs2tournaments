'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('lobbies', 'image_url', {
            type: Sequelize.STRING(255),
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('lobbies', 'image_url');
    }
};
