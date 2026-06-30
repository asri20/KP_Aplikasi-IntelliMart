const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductVariant = sequelize.define('ProductVariant', {
  variant_id: { type: DataTypes.INTEGER, primaryKey: true },
  product_id: { type: DataTypes.INTEGER },
  sku: { type: DataTypes.STRING },
  barcode: { type: DataTypes.STRING },
  variant_name: { type: DataTypes.STRING },
  cost_price: { type: DataTypes.DECIMAL }, // Akan digunakan untuk menghitung KEUNTUNGAN
  selling_price: { type: DataTypes.DECIMAL },
  weight: { type: DataTypes.DECIMAL },
  is_active: { type: DataTypes.BOOLEAN }
}, {
  tableName: 'tm_product_variants',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ProductVariant;
