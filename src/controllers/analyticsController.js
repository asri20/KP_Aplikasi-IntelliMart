const { Transaction, TransactionDetail, ProductVariant, Product, StorePricing } = require('../models');
const { Sequelize } = require('sequelize');

// GET /api/analytics/top-products?store_id=X
// Produk terlaris berdasarkan total qty terjual (hanya transaksi LUNAS)
exports.getTopProducts = async (req, res) => {
  try {
    const { store_id } = req.query;
    if (!store_id) return res.status(400).json({ success: false, message: "store_id diperlukan" });

    const topProducts = await TransactionDetail.findAll({
      include: [
        {
          model: Transaction,
          as: 'transaction',
          where: { store_id, status: 'LUNAS' },
          attributes: []
        },
        {
          model: ProductVariant,
          as: 'variant',
          attributes: ['variant_name'],
          include: [{
            model: Product,
            as: 'product',
            attributes: ['name']
          }]
        }
      ],
      attributes: [
        [Sequelize.col('TransactionDetail.variant_id'), 'variant_id'],
        [Sequelize.fn('SUM', Sequelize.col('qty')), 'total_qty_sold'],
        [Sequelize.fn('SUM', Sequelize.col('subtotal')), 'total_revenue']
      ],
      group: ['TransactionDetail.variant_id', 'variant.id', 'variant->product.id'],
      order: [[Sequelize.fn('SUM', Sequelize.col('qty')), 'DESC']],
      limit: 10,
    });

    res.json({ success: true, data: topProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/analytics/profit?store_id=X
// Keuntungan = total applied_price*qty - total base_price*qty
exports.getProfitReport = async (req, res) => {
  try {
    const { store_id } = req.query;
    if (!store_id) return res.status(400).json({ success: false, message: "store_id diperlukan" });

    // Ambil semua detail transaksi LUNAS di toko ini
    const details = await TransactionDetail.findAll({
      include: [
        { model: Transaction, as: 'transaction', where: { store_id, status: 'LUNAS' }, attributes: ['store_id'] },
        { model: ProductVariant, as: 'variant', attributes: ['id'] }
      ]
    });

    // Ambil base_price dari tr_store_pricing untuk toko ini
    const pricingList = await StorePricing.findAll({ where: { store_id }, raw: true });
    const pricingMap = {};
    pricingList.forEach(p => { pricingMap[p.variant_id] = parseFloat(p.base_price); });

    let totalRevenue = 0;
    let totalCost = 0;

    details.forEach(item => {
      const revenue = parseFloat(item.subtotal || 0);
      const basePricePerUnit = pricingMap[item.variant_id] || 0;
      const cost = basePricePerUnit * item.qty;
      totalRevenue += revenue;
      totalCost += cost;
    });

    const totalProfit = totalRevenue - totalCost;

    res.json({
      success: true,
      data: {
        total_revenue: totalRevenue,
        total_cost: totalCost,
        total_profit: totalProfit,
        profit_margin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) + '%' : '0%'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/analytics/sales-trend?store_id=X
// Tren penjualan harian (hanya LUNAS)
exports.getSalesTrend = async (req, res) => {
  try {
    const { store_id } = req.query;
    if (!store_id) return res.status(400).json({ success: false, message: "store_id diperlukan" });

    const trend = await Transaction.findAll({
      where: { store_id, status: 'LUNAS' },
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('tx_date')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_transactions'],
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'total_revenue']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('tx_date'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('tx_date')), 'ASC']],
      raw: true
    });

    res.json({ success: true, data: trend });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
