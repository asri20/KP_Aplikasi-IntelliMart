// models/goodsReceiptItem.js
module.exports = (sequelize, DataTypes) => {
  const GoodsReceiptItem = sequelize.define('GoodsReceiptItem', {
    receipt_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    receipt_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Link ke item PO (opsional — null jika direct receive)
    po_item_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    variant_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    qty_received: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unit_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    condition: {
      type: DataTypes.ENUM('good', 'damaged', 'returned'),
      defaultValue: 'good'
    }
  }, {
    tableName: 'tt_goods_receipt_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return GoodsReceiptItem;
};
