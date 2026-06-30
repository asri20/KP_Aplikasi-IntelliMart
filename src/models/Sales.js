const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sales = sequelize.define('Sales', {
  sale_id: { type: DataTypes.INTEGER, primaryKey: true },
  invoice_number: { type: DataTypes.STRING },
  store_id: { type: DataTypes.INTEGER }, // Penting untuk filter Multi-Toko
  user_id: { type: DataTypes.INTEGER },
  customer_id: { type: DataTypes.INTEGER },
  sale_date: { type: DataTypes.DATE },
  total_amount: { type: DataTypes.DECIMAL },
  discount_amount: { type: DataTypes.DECIMAL },
  tax_amount: { type: DataTypes.DECIMAL },
  final_amount: { type: DataTypes.DECIMAL },
  payment_status: { type: DataTypes.STRING }
}, {
  tableName: 'tt_sales',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Sales;
