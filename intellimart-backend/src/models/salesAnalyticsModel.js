const db = require("../config/db");

// Mendukung hasil query mysql2/promise.
const getRows = async (sql, params = []) => {
  const result = await db.query(sql, params);
  return Array.isArray(result[0]) ? result[0] : result;
};

const SalesAnalyticsModel = {
  // Analitik pelanggan: hanya akun Customer aktif dengan profil valid.
  getCustomerAnalytics: async () => {
    const sql = `
      SELECT
        u.id AS customer_id,
        u.name AS customer_name,
        cp.customer_type,
        COUNT(DISTINCT t.id) AS total_transactions,
        COALESCE(SUM(td.subtotal), 0) AS total_spending,
        COALESCE(SUM(td.quantity), 0) AS total_items,
        MAX(t.created_at) AS last_purchase
      FROM tm_users u
      JOIN tm_roles r
        ON r.id = u.role_id
      JOIN tm_customer_profile cp
        ON cp.user_id = u.id
      LEFT JOIN tt_transaction t
        ON t.customer_id = u.id
       AND (
  (cp.customer_type = 'RETAIL' AND t.sale_type = 'RETAIL')
  OR
  (cp.customer_type = 'RESELLER' AND t.sale_type = 'WHOLESALE')
)
       AND t.status IN ('PAID', 'SUCCESS')
      LEFT JOIN tt_transaction_detail td
        ON td.transaction_id = t.id
      WHERE LOWER(r.role_name) = 'customer'
  AND u.is_active = 1
  AND cp.customer_type IN ('RETAIL', 'RESELLER')
      GROUP BY
        u.id,
        u.name,
        cp.customer_type
      ORDER BY total_spending DESC, total_transactions DESC
    `;

    return getRows(sql);
  },

  // Produk terlaris dari transaksi yang berhasil.
  getBestSellingProducts: async () => {
    const sql = `
      SELECT
        v.id AS variant_id,
        p.product_name,
        v.variant_name,
        v.sku,
        SUM(td.quantity) AS total_quantity_sold,
        COUNT(DISTINCT t.id) AS total_transactions,
        SUM(td.subtotal) AS total_revenue
      FROM tt_transaction_detail td
      JOIN tt_transaction t
        ON t.id = td.transaction_id
      JOIN ms_product_variant v
        ON v.id = td.variant_id
      JOIN tm_product p
        ON p.id = v.product_id
      WHERE t.status IN ('PAID', 'SUCCESS')
      GROUP BY
        v.id,
        p.product_name,
        v.variant_name,
        v.sku
      ORDER BY total_quantity_sold DESC
    `;

    return getRows(sql);
  },
};

module.exports = SalesAnalyticsModel;
