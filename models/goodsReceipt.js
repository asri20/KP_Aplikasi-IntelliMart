// models/goodsReceipt.js
module.exports = (sequelize, DataTypes) => {
  const GoodsReceipt = sequelize.define('GoodsReceipt', {
    receipt_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    receipt_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    // Boleh null → bisa terima barang tanpa PO (direct receive)
    po_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receipt_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending'
    },
    notes: DataTypes.TEXT
  }, {
    tableName: 'tt_goods_receipts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return GoodsReceipt;
};
