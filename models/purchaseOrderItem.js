// models/purchaseOrderItem.js
module.exports = (sequelize, DataTypes) => {
  const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
    id: { // Diubah dari po_item_id ke id sesuai standar PK database Intellimart
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
    qty_ordered: { // Diubah dari quantity ke qty_ordered agar berpasangan dengan qty_received
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    qty_received: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00
    },
    unit_cost: { // Diubah dari unit_price ke unit_cost (modal harga beli dari supplier)
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2) // Menggunakan presisi standar DECIMAL(12,2)
    }
  }, {
    tableName: 'tt_purchase_order_detail', // Nama tabel fisik resmi di database MySQL Intellimart
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      // Hitung subtotal otomatis sebelum create/update
      beforeCreate(item) {
        item.subtotal = parseFloat(item.qty_ordered || 0) * parseFloat(item.unit_cost || 0);
      },
      beforeUpdate(item) {
        if (item.changed('qty_ordered') || item.changed('unit_cost')) {
          item.subtotal = parseFloat(item.qty_ordered || 0) * parseFloat(item.unit_cost || 0);
        }
      }
    }
  });

  return PurchaseOrderItem;
};