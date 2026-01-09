const { sequelize, testConnection } = require('../config/db');
const Lead = require('./Lead');
const Event = require('./Event');

// Define Associations
Lead.hasMany(Event, { foreignKey: 'leadId', as: 'events' });
Event.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });

const syncDatabase = async () => {
    try {
        // Only attempt sync if we have a connection (check implicitly via authenticate or just try sync)
        // We used a lenient testConnection in db.js, here we try to sync.
        // alter: true updates tables if they change
        await sequelize.sync({ alter: true });
        console.log('Database & Tables synced successfully.');
    } catch (error) {
        console.warn('Skipping Database Sync (likely no DB connection configured yet):', error.message);
    }
};

module.exports = {
    sequelize,
    testConnection,
    syncDatabase,
    Lead,
    Event
};
