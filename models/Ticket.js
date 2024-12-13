const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js'); // Update path accordingly

const Ticket = sequelize.define('Ticket', {
  userid: {
    type: DataTypes.STRING,
    allowNull: false  // Changed from 'require' to 'allowNull', which is the correct Sequelize option
  },
  eventid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eventname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eventdate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  eventtime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ticketprice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  qr: {
    type: DataTypes.STRING,
    allowNull: false
  },
  count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  // Additional model options here
});

module.exports = Ticket;
