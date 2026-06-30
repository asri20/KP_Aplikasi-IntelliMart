// models/index.js
const sequelize = require('../config/database');
const DataTypes = require('sequelize').DataTypes;

// ── Load semua model ─────────────────────────────────────────────────────────
const Supplier          = require('./supplier')(sequelize, DataTypes);
const PurchaseOrder     = require('./purchaseOrder')(sequelize, DataTypes);
const PurchaseOrderItem = require('./purchaseOrderItem')(sequelize, DataTypes);
const GoodsReceipt      = require('./goodsReceipt')(sequelize, DataTypes);
const GoodsReceiptItem  = require('./goodsReceiptItem')(sequelize, DataTypes);

// ── Model User & Multi-Toko (Tambahan Baru) ─────────────────────────────────
const User       = require('./user')(sequelize, DataTypes);
const Store      = require('./toko')(sequelize, DataTypes);
const Role       = require('./role')(sequelize, DataTypes);
const StoreUser  = require('./storeUser')(sequelize, DataTypes);

// ── Relasi Purchase Order ────────────────────────────────────────────────────
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
Supplier.hasMany(PurchaseOrder,   { foreignKey: 'supplier_id', as: 'purchaseOrders' });

PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'po_id', as: 'items' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'po_id' });

// ── Relasi Goods Receipt ─────────────────────────────────────────────────────
GoodsReceipt.belongsTo(Supplier,      { foreignKey: 'supplier_id', as: 'supplier' });
GoodsReceipt.belongsTo(PurchaseOrder, { foreignKey: 'po_id', as: 'purchaseOrder' });

GoodsReceipt.hasMany(GoodsReceiptItem, { foreignKey: 'receipt_id', as: 'items' });
GoodsReceiptItem.belongsTo(GoodsReceipt, { foreignKey: 'receipt_id' });

// Link receipt item → PO item (opsional)
GoodsReceiptItem.belongsTo(PurchaseOrderItem, { foreignKey: 'po_item_id', as: 'poItem' });

// ── Relasi User & Multi-Toko ─────────────────────────────────────────────────
User.hasMany(StoreUser, { foreignKey: 'user_id', as: 'storeUsers' });
Store.hasMany(StoreUser, { foreignKey: 'store_id', as: 'storeUsers' });
Role.hasMany(StoreUser, { foreignKey: 'role_id', as: 'storeUsers' });

StoreUser.belongsTo(User, { foreignKey: 'user_id' });
StoreUser.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });   // ← Alias 'store'
StoreUser.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });     // ← Alias 'role'

module.exports = {
  sequelize,
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  GoodsReceipt,
  GoodsReceiptItem,
  User,        // ← Tambahan
  Store,       // ← Tambahan
  Role,        // ← Tambahan
  StoreUser    // ← Tambahan
};