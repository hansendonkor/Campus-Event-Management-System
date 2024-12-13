const { Sequelize, DataTypes } = require('sequelize');

// Assuming `sequelize` is exported from your './config/database' file
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  title: {
    type: DataTypes.STRING,
    allowNull: false // Ensures this field is not empty
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING // Path to the image file
  },
  }, {
    timestamps: true, // This needs to be true if you want Sequelize to automatically manage createdAt and updatedAt

});


module.exports = Event;
  
