const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Sequelize untuk tabel `tt_transaction_details`
 * Menyimpan rincian item transaksi penjualan.
 */
const TransactionDetail = sequelize.define('TransactionDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tx_id: {
    type: DataTypes.INTEGER
  },
  variant_id: {
    type: DataTypes.INTEGER
  },
  qty: {
    type: DataTypes.INTEGER
  },
  applied_price: {
    type: DataTypes.DECIMAL(15, 2)
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2)
  }
}, {
  tableName: 'tt_transaction_details',
  timestamps: false
});

module.exports = TransactionDetail;
