const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Sequelize untuk tabel `ms_price_tiers`
 * Menyimpan data tingkatan harga grosir / berjenjang.
 */
const PriceTier = sequelize.define('PriceTier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  price_code_id: {
    type: DataTypes.INTEGER
  },
  min_qty: {
    type: DataTypes.INTEGER
  },
  max_qty: {
    type: DataTypes.INTEGER
  },
  unit_price: {
    type: DataTypes.DECIMAL(15, 2)
  }
}, {
  tableName: 'ms_price_tiers',
  timestamps: false
});

module.exports = PriceTier;
