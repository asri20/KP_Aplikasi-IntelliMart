const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Sequelize untuk tabel `tr_store_pricing`
 * Menyimpan data penetapan harga varian produk di toko.
 */
const StorePricing = sequelize.define('StorePricing', {
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
  base_price: {
    type: DataTypes.DECIMAL(15, 2)
  },
  discount_percent: {
    type: DataTypes.DECIMAL(5, 2)
  },
  price_code_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'tr_store_pricing',
  timestamps: false
});

module.exports = StorePricing;
