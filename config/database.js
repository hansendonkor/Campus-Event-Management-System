const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('Event_System', 'event', 'event123', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;