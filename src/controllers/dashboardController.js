const { Transaction, TransactionDetail, ProductVariant, Product, Store } = require('../models');
const { Sequelize } = require('sequelize');

// GET /api/dashboard/summary?store_id=X
// Menampilkan ringkasan: total revenue, total transaksi LUNAS, total produk terjual
exports.getSummary = async (req, res) => {
  try {
    const { store_id } = req.query;
    if (!store_id) {
      return res.status(400).json({ success: false, message: "Parameter store_id diperlukan." });
    }

    // Filter hanya transaksi LUNAS
    const whereClause = { store_id, status: 'LUNAS' };

    // 1. Total Pendapatan
    const totalRevenue = await Transaction.sum('total_amount', { where: whereClause }) || 0;

    // 2. Total Transaksi LUNAS
    const totalTransactions = await Transaction.count({ where: whereClause });

    // 3. Total Produk Terjual (dari detail transaksi yang LUNAS)
    const itemsResult = await TransactionDetail.findAll({
      include: [{
        model: Transaction,
        as: 'transaction',
        where: whereClause,
        attributes: []
      }],
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('qty')), 'total_sold']
      ],
      raw: true
    });
    const totalProductsSold = parseInt(itemsResult[0]?.total_sold) || 0;

    // 4. Total Transaksi UNPAID (menunggu kasir)
    const totalUnpaid = await Transaction.count({ where: { store_id, status: 'UNPAID' } });

    res.json({
      success: true,
      data: {
        total_revenue: parseFloat(totalRevenue),
        total_transactions_lunas: totalTransactions,
        total_transactions_unpaid: totalUnpaid,
        total_products_sold: totalProductsSold
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
