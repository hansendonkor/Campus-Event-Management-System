const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgresql_campus_event_management_system', 'postgresql_campus_event_management_system_user', 'XoEZ1oIKPDSyQphBIuazbWr33nB3BE6H', {
  host: 'dpg-cte5t0ogph6c739fkfu0-a',
  dialect: 'postgres',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
