// models/index.js
const sequelize = require('../config/database');
const DataTypes = require('sequelize').DataTypes;

// ── Load semua model ─────────────────────────────────────────────────────────
const Supplier          = require('./supplier')(sequelize, DataTypes);
const PurchaseOrder     = require('./purchaseOrder')(sequelize, DataTypes);
const PurchaseOrderItem = require('./purchaseOrderItem')(sequelize, DataTypes);

// ── Model Core (User, Toko, Role) ───────────────────────────────────────────
const User  = require('./user')(sequelize, DataTypes);
const Store = require('./toko')(sequelize, DataTypes);
const Role  = require('./role')(sequelize, DataTypes);

// ── Relasi Purchase Order & Supplier ─────────────────────────────────────────
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
Supplier.hasMany(PurchaseOrder,   { foreignKey: 'supplier_id', as: 'purchaseOrders' });

// ── Relasi Purchase Order & Detail Items ─────────────────────────────────────
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'po_id', as: 'items' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'po_id', as: 'purchaseOrder' });

// ── Relasi Purchase Order ke Toko & User (Pembuat PO) ───────────────────────
PurchaseOrder.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
Store.hasMany(PurchaseOrder,   { foreignKey: 'store_id', as: 'purchaseOrders' });

PurchaseOrder.belongsTo(User,  { foreignKey: 'created_by', as: 'creator' });

// ── Relasi Toko, Owner, & Manager (Modul 0 Core) ─────────────────────────────
Store.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
Store.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });
User.hasMany(Store,   { foreignKey: 'owner_id', as: 'ownedStores' });

module.exports = {
  sequelize,
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  User,
  Store,
  Role
};