const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Sequelize untuk tabel `tt_customer_segments`
 * Menyimpan segmentasi pelanggan.
 */
const CustomerSegment = sequelize.define('CustomerSegment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customer_id: {
    type: DataTypes.INTEGER
  },
  segment_name: {
    type: DataTypes.STRING
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tt_customer_segments',
  timestamps: false
});

module.exports = CustomerSegment;
