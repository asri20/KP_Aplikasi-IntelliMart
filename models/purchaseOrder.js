// models/purchaseOrder.js
module.exports = (sequelize, DataTypes) => {
  const PurchaseOrder = sequelize.define('PurchaseOrder', {
    po_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    po_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
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
    order_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expected_delivery_date: DataTypes.DATEONLY,
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'approved', 'received', 'cancelled'),
      defaultValue: 'draft'
    },
    notes: DataTypes.TEXT
  }, {
    // FIX: tanpa tableName → "Tt_purchase_orderss" (dobel s karena plural)
    tableName: 'tt_purchase_orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return PurchaseOrder;
};
