const { pool } = require('../config/database');

/**
 * GET /api/analytics/top-products?store_id=X[&limit=10]
 * Menggunakan VIEW vw_best_selling_products (Modul 10).
 */
exports.getTopProducts = async (req, res) => {
  try {
    const { store_id, limit = 10 } = req.query;
    if (!store_id) return res.status(400).json({ success: false, message: 'Parameter store_id diperlukan' });

    const [rows] = await pool.query(
      `SELECT *
       FROM vw_best_selling_products
       WHERE store_id = ?
       ORDER BY total_qty_sold DESC
       LIMIT ?`,
      [store_id, parseInt(limit)]
    );

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('[analytics/top-products]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/profit?store_id=X[&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD]
 *
 * Menghitung keuntungan bersih dari transaksi LUNAS/PAID/SUCCESS:
 *   Revenue  = SUM(td.price_per_unit * td.quantity)
 *   Cost     = SUM(ps.base_price * td.quantity)
 *   Profit   = Revenue - Cost
 */
exports.getProfitReport = async (req, res) => {
  try {
    const { store_id, start_date, end_date } = req.query;
    if (!store_id) return res.status(400).json({ success: false, message: 'Parameter store_id diperlukan' });

    // Bangun filter tanggal opsional
    let dateFilter = '';
    const params = [store_id];
    if (start_date) { dateFilter += ' AND DATE(t.created_at) >= ?'; params.push(start_date); }
    if (end_date)   { dateFilter += ' AND DATE(t.created_at) <= ?'; params.push(end_date); }

    // Revenue dari transaksi settled
    const [revenueRows] = await pool.query(
      `SELECT
         COALESCE(SUM(td.price_per_unit * td.quantity), 0) AS total_revenue,
         COALESCE(SUM(td.quantity), 0)                     AS total_qty
       FROM tt_transaction_detail td
       JOIN tt_transaction t ON t.id = td.transaction_id
       WHERE t.store_id = ? AND t.status IN ('LUNAS', 'PAID', 'SUCCESS')${dateFilter}`,
      params
    );

    // Cost dari modal base_price per toko-varian
    const [costRows] = await pool.query(
      `SELECT
         COALESCE(SUM(ps.base_price * td.quantity), 0) AS total_cost
       FROM tt_transaction_detail td
       JOIN tt_transaction t ON t.id = td.transaction_id
       JOIN tr_product_stock ps
         ON ps.store_id = t.store_id AND ps.variant_id = td.variant_id
       WHERE t.store_id = ? AND t.status IN ('LUNAS', 'PAID', 'SUCCESS')${dateFilter}`,
      params
    );

    const totalRevenue = parseFloat(revenueRows[0].total_revenue);
    const totalCost    = parseFloat(costRows[0].total_cost);
    const totalProfit  = totalRevenue - totalCost;

    res.json({
      success: true,
      data: {
        total_revenue:  totalRevenue,
        total_cost:     totalCost,
        total_profit:   totalProfit,
        profit_margin:  totalRevenue > 0
          ? ((totalProfit / totalRevenue) * 100).toFixed(2) + '%'
          : '0%'
      }
    });
  } catch (error) {
    console.error('[analytics/profit]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/sales-trend?store_id=X[&days=30]
 * Tren penjualan harian — menggunakan VIEW vw_sales_report_daily (kolom: sales_date).
 */
exports.getSalesTrend = async (req, res) => {
  try {
    const { store_id, days = 30 } = req.query;
    if (!store_id) return res.status(400).json({ success: false, message: 'Parameter store_id diperlukan' });

    const [rows] = await pool.query(
      `SELECT
         sales_date,
         total_transactions,
         total_revenue
       FROM vw_sales_report_daily
       WHERE store_id = ?
         AND sales_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY sales_date ASC`,
      [store_id, parseInt(days)]
    );

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('[analytics/sales-trend]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/product-catalog?store_id=X[&search=keyword]
 * Katalog produk lengkap dari VIEW vw_product_catalog
 */
exports.getProductCatalog = async (req, res) => {
  try {
    const { store_id, search } = req.query;
    if (!store_id) return res.status(400).json({ success: false, message: 'Parameter store_id diperlukan' });

    let query  = `SELECT * FROM vw_product_catalog WHERE store_id = ?`;
    const params = [store_id];

    if (search) {
      query += ` AND (product_name LIKE ? OR variant_name LIKE ? OR sku LIKE ? OR category_name LIKE ? OR brand_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY product_name ASC`;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('[analytics/product-catalog]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/customer-segments
 * Segmen terbaru customer dari VIEW vw_customer_latest_segment + info user & profil
 */
exports.getCustomerSegments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         s.customer_id,
         s.segment_name,
         s.created_at,
         COALESCE(u.name, 'Customer #' || s.customer_id) AS customer_name,
         u.email,
         u.phone,
         cp.customer_type,
         cp.loyalty_level
       FROM vw_customer_latest_segment s
       LEFT JOIN tm_users u ON u.id = s.customer_id
       LEFT JOIN tm_customer_profile cp ON cp.user_id = s.customer_id
       ORDER BY s.customer_id ASC`
    );

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('[analytics/customer-segments]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
