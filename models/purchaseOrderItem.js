// models/purchaseOrderItem.js
module.exports = (sequelize, DataTypes) => {
  const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
    po_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    po_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    variant_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unit_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      // FIX: subtotal dihitung otomatis lewat hook, bukan manual di controller
    },
    qty_received: {
      type: DataTypes.INTEGER,
      defaultValue: 0  // bertambah saat GoodsReceipt diverifikasi
    }
  }, {
    tableName: 'tt_purchase_order_items',
    timestamps: true,
    // FIX: konsisten pakai snake_case seperti model lain
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      // Hitung subtotal otomatis sebelum create/update
      beforeCreate(item) {
        item.subtotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
      },
      beforeUpdate(item) {
        if (item.changed('quantity') || item.changed('unit_price')) {
          item.subtotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
        }
      }
    }
  });

  return PurchaseOrderItem;
};
