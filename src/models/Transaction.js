const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Sequelize untuk tabel `tt_transactions`
 * Menyimpan data transaksi utama/header penjualan.
 */
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customer_id: {
    type: DataTypes.INTEGER
  },
  store_id: {
    type: DataTypes.INTEGER
  },
  cashier_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2)
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'UNPAID'
  },
  tx_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tt_transactions',
  timestamps: false
});

module.exports = Transaction;
