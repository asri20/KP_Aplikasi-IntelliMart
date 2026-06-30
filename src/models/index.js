const Sales = require('./Sales');
const SaleItems = require('./SaleItems');
const ProductVariant = require('./ProductVariant');
const Product = require('./Product');

// --- Relasi Tabel (Asosiasi) ---

// 1 Penjualan (Sale) punya Banyak Item (SaleItems)
Sales.hasMany(SaleItems, { foreignKey: 'sale_id', as: 'items' });
SaleItems.belongsTo(Sales, { foreignKey: 'sale_id', as: 'sale' });

// 1 SaleItem merujuk ke 1 ProductVariant
SaleItems.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
ProductVariant.hasMany(SaleItems, { foreignKey: 'variant_id', as: 'sale_items' });

// 1 ProductVariant merujuk ke 1 Product utama
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });

module.exports = {
  Sales,
  SaleItems,
  ProductVariant,
  Product
};
