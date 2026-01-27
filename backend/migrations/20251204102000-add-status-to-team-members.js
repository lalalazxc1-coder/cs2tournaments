'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('team_members', 'status', {
            type: Sequelize.STRING(20),
            defaultValue: 'member',
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('team_members', 'status');
    }
};
