const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Sequelize untuk tabel `ms_products`
 * Menyimpan data produk induk.
 */
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'ms_products',
  timestamps: false
});

module.exports = Product;
