const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define('Store', {

  store_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  store_name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  address: {
    type: DataTypes.TEXT
  }

}, {
  tableName: 'stores'
});

module.exports = Store;