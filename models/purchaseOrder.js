// models/purchaseOrder.js
module.exports = (sequelize, DataTypes) => {
  const PurchaseOrder = sequelize.define('PurchaseOrder', {
    id: { // Diubah dari po_id ke id sesuai standar PK database Intellimart
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
    created_by: { // Diubah dari user_id ke created_by (digunakan sebagai fallback log user di Modul 5)
      type: DataTypes.INTEGER,
      allowNull: false
    },
    order_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expected_delivery_date: DataTypes.DATEONLY,
    total_amount: {
      type: DataTypes.DECIMAL(12, 2), // Menggunakan presisi standar nilai uang DECIMAL(12,2)
      defaultValue: 0.00
    },
    status: {
      // Disesuaikan dengan status resmi alur bisnis Modul 5 (DRAFT, PARTIALLY_RECEIVED, RECEIVED, dll.)
      type: DataTypes.ENUM('DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'),
      defaultValue: 'DRAFT'
    },
    notes: DataTypes.TEXT
  }, {
    tableName: 'tt_purchase_order', // Diubah ke bentuk tunggal 'tt_purchase_order'
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return PurchaseOrder;
};