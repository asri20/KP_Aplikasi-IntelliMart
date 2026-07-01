const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserStore = sequelize.define('UserStore', {

  user_store_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  role: {
    type: DataTypes.ENUM(
      'owner',
      'manager',
      'cashier'
    ),
    allowNull: false
  }

}, {
  tableName: 'user_stores'
});

module.exports = UserStore;