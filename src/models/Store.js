const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Sequelize untuk tabel `tm_stores`
 * Menyimpan data toko/cabang.
 */
const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING
  },
  owner_id: {
    type: DataTypes.INTEGER
  },
  manager_id: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'tm_stores',
  timestamps: false
});

module.exports = Store;
