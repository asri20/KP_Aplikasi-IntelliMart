const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Sequelize untuk tabel `tr_store_inventory`
 * Menyimpan data inventaris dan stok barang di toko.
 */
const StoreInventory = sequelize.define('StoreInventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  store_id: {
    type: DataTypes.INTEGER
  },
  variant_id: {
    type: DataTypes.INTEGER
  },
  stock_qty: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'tr_store_inventory',
  timestamps: false
});

module.exports = StoreInventory;
