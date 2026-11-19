const db = require("../config/db");

const PAID_STATUSES = ["PAID", "SUCCESS", "LUNAS"];

function buildDateFilter(fromDate, toDate, column = "t.created_at") {
  const conditions = [];
  const params = [];

  if (fromDate) {
    conditions.push(`${column} >= ?`);
    params.push(`${fromDate} 00:00:00`);
  }

  if (toDate) {
    conditions.push(`${column} < DATE_ADD(?, INTERVAL 1 DAY)`);
    params.push(toDate);
  }

  return {
    sql: conditions.length ? `AND ${conditions.join(" AND ")}` : "",
    params,
  };
}

function buildStoreFilter(storeId, column = "t.store_id") {
  if (!storeId) {
    return { sql: "", params: [] };
  }

  return {
    sql: `AND ${column} = ?`,
    params: [storeId],
  };
}

const DashboardModel = {
  // 1. Ringkasan dashboard
  getSummary: async (storeId) => {
    const storeFilter = buildStoreFilter(storeId);

    const [rows] = await db.query(
      `SELECT
         COUNT(*) AS total_transactions,
         COALESCE(SUM(t.total_price + t.tax_total), 0) AS total_revenue,
         COALESCE((
           SELECT SUM(td.quantity)
           FROM tt_transaction_detail td
           JOIN tt_transaction tx ON tx.id = td.transaction_id
           WHERE tx.status IN (?, ?, ?)
           ${storeId ? "AND tx.store_id = ?" : ""}
         ), 0) AS total_items_sold,
         COALESCE(SUM(t.discount_total), 0) AS total_discount
       FROM tt_transaction t
       WHERE t.status IN (?, ?, ?)
       ${storeFilter.sql}`,
      [
        ...PAID_STATUSES,
        ...(storeId ? [storeId] : []),
        ...PAID_STATUSES,
        ...storeFilter.params,
      ],
    );

    const [todayRows] = await db.query(
      `SELECT
         COUNT(*) AS today_transactions,
         COALESCE(SUM(t.total_price + t.tax_total), 0) AS today_revenue
       FROM tt_transaction t
       WHERE t.status IN (?, ?, ?)
         AND DATE(t.created_at) = CURDATE()
       ${storeFilter.sql}`,
      [...PAID_STATUSES, ...storeFilter.params],
    );

    return {
      ...rows[0],
      ...todayRows[0],
    };
  },

  // 2. Tren penjualan harian
  getSalesTrend: async (storeId, fromDate, toDate) => {
    const storeFilter = buildStoreFilter(storeId);
    const dateFilter = buildDateFilter(fromDate, toDate);

    const [rows] = await db.query(
      `SELECT
         DATE(t.created_at) AS sales_date,
         COUNT(*) AS total_transactions,
         COALESCE(SUM(t.total_price + t.tax_total), 0) AS total_revenue
       FROM tt_transaction t
       WHERE t.status IN (?, ?, ?)
       ${storeFilter.sql}
       ${dateFilter.sql}
       GROUP BY DATE(t.created_at)
       ORDER BY sales_date ASC`,
      [...PAID_STATUSES, ...storeFilter.params, ...dateFilter.params],
    );

    return rows;
  },

  // 3. Produk terlaris
  getTopProducts: async (storeId, limit = 10) => {
    const storeFilter = buildStoreFilter(storeId);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));

    const [rows] = await db.query(
      `SELECT
         v.id AS variant_id,
         p.id AS product_id,
         p.product_name,
         v.variant_name,
         v.sku,
         SUM(td.quantity) AS total_quantity_sold,
         COUNT(DISTINCT t.id) AS total_transactions,
         SUM(td.subtotal) AS gross_item_sales
       FROM tt_transaction_detail td
       JOIN tt_transaction t ON t.id = td.transaction_id
       JOIN ms_product_variant v ON v.id = td.variant_id
       JOIN tm_product p ON p.id = v.product_id
       WHERE t.status IN (?, ?, ?)
       ${storeFilter.sql}
       GROUP BY
         v.id, p.id, p.product_name, v.variant_name, v.sku
       ORDER BY total_quantity_sold DESC
       LIMIT ?`,
      [...PAID_STATUSES, ...storeFilter.params, safeLimit],
    );

    return rows;
  },

  // 4. Peringatan stok minimum
  getLowStock: async (storeId) => {
    const conditions = ["ps.stock <= ps.min_stock"];
    const params = [];

    if (storeId) {
      conditions.push("ps.store_id = ?");
      params.push(storeId);
    }

    const [rows] = await db.query(
      `SELECT
         ps.store_id,
         s.store_name,
         v.id AS variant_id,
         v.sku,
         v.variant_name,
         p.product_name,
         ps.stock,
         ps.min_stock,
         (ps.min_stock - ps.stock) AS shortage
       FROM tr_product_stock ps
       JOIN ms_product_variant v ON v.id = ps.variant_id
       JOIN tm_product p ON p.id = v.product_id
       JOIN tm_store s ON s.id = ps.store_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY shortage DESC, p.product_name ASC`,
      params,
    );

    return rows;
  },

  // 5. Transaksi terbaru
  getRecentTransactions: async (storeId, limit = 10) => {
    const storeFilter = buildStoreFilter(storeId);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));

    const [rows] = await db.query(
      `SELECT
         t.id,
         t.invoice_no,
         t.customer_id,
         customer.name AS customer_name,
         t.cashier_id,
         cashier.name AS cashier_name,
         t.store_id,
         s.store_name,
         t.sale_type,
         t.total_price,
         t.discount_total,
         t.tax_total,
         t.status,
         t.created_at,
         COALESCE(detail.total_items, 0) AS total_items
       FROM tt_transaction t
       LEFT JOIN tm_users customer ON customer.id = t.customer_id
       LEFT JOIN tm_users cashier ON cashier.id = t.cashier_id
       LEFT JOIN tm_store s ON s.id = t.store_id
       LEFT JOIN (
         SELECT
           transaction_id,
           SUM(quantity) AS total_items
         FROM tt_transaction_detail
         GROUP BY transaction_id
       ) detail ON detail.transaction_id = t.id
       WHERE 1 = 1
       ${storeFilter.sql}
       ORDER BY t.created_at DESC
       LIMIT ?`,
      [...storeFilter.params, safeLimit],
    );

    return rows;
  },

  // 6. Laporan keuntungan
  getProfitReport: async (storeId, fromDate, toDate) => {
    const storeFilter = buildStoreFilter(storeId);
    const dateFilter = buildDateFilter(fromDate, toDate);

    const [rows] = await db.query(
      `SELECT
         COUNT(*) AS total_transactions,
         COALESCE(SUM(report.net_revenue), 0) AS total_revenue,
         COALESCE(SUM(report.total_cost), 0) AS total_cost,
         COALESCE(SUM(report.net_revenue - report.total_cost), 0) AS estimated_profit
       FROM (
         SELECT
           t.id,
           (t.total_price + t.tax_total) AS net_revenue,
           COALESCE(SUM(v.cost_price * td.quantity), 0) AS total_cost
         FROM tt_transaction t
         JOIN tt_transaction_detail td ON td.transaction_id = t.id
         JOIN ms_product_variant v ON v.id = td.variant_id
         WHERE t.status IN (?, ?, ?)
         ${storeFilter.sql}
         ${dateFilter.sql}
         GROUP BY t.id, t.total_price, t.tax_total
       ) report`,
      [...PAID_STATUSES, ...storeFilter.params, ...dateFilter.params],
    );

    return rows[0];
  },
};

module.exports = DashboardModel;
