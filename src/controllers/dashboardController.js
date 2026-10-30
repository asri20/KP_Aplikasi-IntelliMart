const { pool } = require('../config/database');

/**
 * GET /api/dashboard/stores
 * Mengambil daftar toko aktif dari tm_store
 */
exports.getStores = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, store_name, location, phone, is_active, created_at 
       FROM tm_store 
       WHERE is_active = 1 
       ORDER BY id ASC`
    );

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('[dashboard/stores]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/dashboard/summary?store_id=X
 *
 * Menggunakan VIEW vw_sales_report_daily + tt_transaction + tt_transaction_detail
 * Sesuai skema database resmi intellimart:
 * - tt_transaction: total_price, status IN ('LUNAS', 'PAID', 'SUCCESS')
 * - tt_transaction_detail: quantity
 * - vw_sales_report_daily: sales_date (BUKAN sale_date)
 * - vw_low_stock_alert: store_name (BUKAN store_id)
 */
exports.getSummary = async (req, res) => {
  try {
    const { store_id } = req.query;
    if (!store_id) {
      return res.status(400).json({ success: false, message: 'Parameter store_id diperlukan.' });
    }

    // 1. Total revenue & transaksi LUNAS/PAID/SUCCESS dari tt_transaction
    const [revenueRows] = await pool.query(
      `SELECT
         COUNT(*)                       AS total_transactions_lunas,
         COALESCE(SUM(total_price), 0)  AS total_revenue
       FROM tt_transaction
       WHERE store_id = ? AND status IN ('LUNAS', 'PAID', 'SUCCESS')`,
      [store_id]
    );

    // 2. Total transaksi UNPAID / PENDING (antrian kasir)
    const [unpaidRows] = await pool.query(
      `SELECT COUNT(*) AS total_unpaid
       FROM tt_transaction
       WHERE store_id = ? AND status IN ('UNPAID', 'PENDING')`,
      [store_id]
    );

    // 3. Total item terjual dari transaksi yang sudah settled
    const [soldRows] = await pool.query(
      `SELECT COALESCE(SUM(td.quantity), 0) AS total_products_sold
       FROM tt_transaction_detail td
       JOIN tt_transaction t ON t.id = td.transaction_id
       WHERE t.store_id = ? AND t.status IN ('LUNAS', 'PAID', 'SUCCESS')`,
      [store_id]
    );

    // 4. Tren hari ini dari vw_sales_report_daily (kolom resmi: sales_date)
    const [todayRows] = await pool.query(
      `SELECT
         COALESCE(total_transactions, 0) AS today_transactions,
         COALESCE(total_revenue, 0)      AS today_revenue
       FROM vw_sales_report_daily
       WHERE store_id = ? AND sales_date = CURDATE()`,
      [store_id]
    );

    // 5. Jumlah varian stok rendah dari vw_low_stock_alert (filter via store_name subquery)
    const [lowStockRows] = await pool.query(
      `SELECT COUNT(*) AS low_stock_count
       FROM vw_low_stock_alert
       WHERE store_name = (SELECT store_name FROM tm_store WHERE id = ?)`,
      [store_id]
    );

    res.json({
      success: true,
      data: {
        total_revenue:              parseFloat(revenueRows[0].total_revenue),
        total_transactions_lunas:   parseInt(revenueRows[0].total_transactions_lunas),
        total_transactions_unpaid:  parseInt(unpaidRows[0].total_unpaid),
        total_products_sold:        parseInt(soldRows[0].total_products_sold),
        today_revenue:              parseFloat(todayRows[0]?.today_revenue || 0),
        today_transactions:         parseInt(todayRows[0]?.today_transactions || 0),
        low_stock_count:            parseInt(lowStockRows[0]?.low_stock_count || 0)
      }
    });
  } catch (error) {
    console.error('[dashboard/summary]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/dashboard/low-stock?store_id=X&store_name=Y
 * Daftar varian stok di bawah min_stock — langsung dari vw_low_stock_alert
 */
exports.getLowStock = async (req, res) => {
  try {
    const { store_id, store_name } = req.query;

    let query = `SELECT * FROM vw_low_stock_alert`;
    const params = [];

    if (store_name) {
      query += ` WHERE store_name = ?`;
      params.push(store_name);
    } else if (store_id) {
      query += ` WHERE store_name = (SELECT store_name FROM tm_store WHERE id = ?)`;
      params.push(store_id);
    }

    query += ` ORDER BY stock ASC`;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('[dashboard/low-stock]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/dashboard/recent-transactions?store_id=X[&limit=5]
 * Daftar transaksi terbaru untuk widget tabel dashboard
 */
exports.getRecentTransactions = async (req, res) => {
  try {
    const { store_id, limit = 5 } = req.query;
    if (!store_id) {
      return res.status(400).json({ success: false, message: 'Parameter store_id diperlukan.' });
    }

    const [rows] = await pool.query(
      `SELECT
         t.id,
         t.invoice_no,
         t.sale_type,
         t.total_price,
         t.status,
         t.created_at,
         u.name AS cashier_name,
         c.name AS customer_name,
         (SELECT COUNT(*) FROM tt_transaction_detail WHERE transaction_id = t.id) AS total_items
       FROM tt_transaction t
       LEFT JOIN tm_users u ON u.id = t.cashier_id
       LEFT JOIN tm_users c ON c.id = t.customer_id
       WHERE t.store_id = ?
       ORDER BY t.created_at DESC
       LIMIT ?`,
      [store_id, parseInt(limit)]
    );

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('[dashboard/recent-transactions]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
