const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  product_id: { type: DataTypes.INTEGER, primaryKey: true },
  product_name: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  category_id: { type: DataTypes.INTEGER },
  brand_id: { type: DataTypes.INTEGER },
  unit_id: { type: DataTypes.INTEGER },
  is_active: { type: DataTypes.BOOLEAN }
}, {
  tableName: 'tm_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Product;
