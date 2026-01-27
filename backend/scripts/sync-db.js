const { sequelize } = require('../config/database');
require('../models'); // Load models

const syncDatabase = async () => {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        console.log('Syncing database (alter: true)...');
        // alter: true checks what is the current state of the table in the database
        // (which columns it has, what are their data types, etc), and then performs the
        // necessary changes in the table to make it match the model.
        await sequelize.sync({ alter: true });

        console.log('Database synchronized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

syncDatabase();
