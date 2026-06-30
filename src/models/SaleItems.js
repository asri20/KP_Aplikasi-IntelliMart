const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SaleItems = sequelize.define('SaleItems', {
  sale_item_id: { type: DataTypes.INTEGER, primaryKey: true },
  sale_id: { type: DataTypes.INTEGER },
  variant_id: { type: DataTypes.INTEGER },
  quantity: { type: DataTypes.INTEGER },
  unit_price: { type: DataTypes.DECIMAL },
  discount: { type: DataTypes.DECIMAL },
  subtotal: { type: DataTypes.DECIMAL } // Akan digunakan untuk menghitung total penjualan real produk
}, {
  tableName: 'tt_sale_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SaleItems;
