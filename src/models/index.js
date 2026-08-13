const Role = require('./Role');
const User = require('./User');
const Store = require('./Store');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const StoreInventory = require('./StoreInventory');
const StorePricing = require('./StorePricing');
const PriceTier = require('./PriceTier');
const Transaction = require('./Transaction');
const TransactionDetail = require('./TransactionDetail');
const CustomerSegment = require('./CustomerSegment');

// Relasi / Asosiasi antar Model

// Role & User
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// Store & User (Owner & Manager)
Store.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
Store.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });

// Product & ProductVariant
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Store, ProductVariant & StoreInventory
Store.hasMany(StoreInventory, { foreignKey: 'store_id', as: 'inventory' });
ProductVariant.hasMany(StoreInventory, { foreignKey: 'variant_id', as: 'inventory' });
StoreInventory.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
StoreInventory.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// Store, ProductVariant & StorePricing
Store.hasMany(StorePricing, { foreignKey: 'store_id', as: 'pricing' });
ProductVariant.hasMany(StorePricing, { foreignKey: 'variant_id', as: 'pricing' });
StorePricing.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
StorePricing.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// Transaction & TransactionDetail
Transaction.hasMany(TransactionDetail, { foreignKey: 'tx_id', as: 'details' });
TransactionDetail.belongsTo(Transaction, { foreignKey: 'tx_id', as: 'transaction' });

// Transaction, Store & User (Customer & Cashier)
Transaction.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
Transaction.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Transaction.belongsTo(User, { foreignKey: 'cashier_id', as: 'cashier' });

// TransactionDetail & ProductVariant
TransactionDetail.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

module.exports = {
  Role,
  User,
  Store,
  Product,
  ProductVariant,
  StoreInventory,
  StorePricing,
  PriceTier,
  Transaction,
  TransactionDetail,
  CustomerSegment
};
