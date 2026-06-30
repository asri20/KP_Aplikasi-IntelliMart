const { Sales, SaleItems } = require('../models');

exports.getSummary = async (req, res) => {
  try {
    const { store_id } = req.query;
    // Wajib filter berdasarkan Multi-Tenant (Toko)
    if (!store_id) {
      return res.status(400).json({ success: false, message: "Parameter store_id diperlukan untuk memfilter laporan." });
    }

    // 1. Total Pendapatan dari tabel Sales
    const totalSales = await Sales.sum('final_amount', { where: { store_id } });

    // 2. Total Transaksi
    const totalTransactions = await Sales.count({ where: { store_id } });

    // 3. Total Produk Terjual (Menjumlahkan 'quantity' dari tt_sale_items)
    const saleItems = await SaleItems.findAll({
      include: [{
        model: Sales,
        as: 'sale',
        where: { store_id },
        attributes: []
      }],
      attributes: [
        [Sales.sequelize.fn('SUM', Sales.sequelize.col('quantity')), 'total_sold']
      ],
      raw: true
    });
    const totalProductsSold = saleItems[0].total_sold || 0;

    res.json({
      success: true,
      data: {
        total_revenue: totalSales || 0,
        total_transactions: totalTransactions,
        total_products_sold: parseInt(totalProductsSold)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
