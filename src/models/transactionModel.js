const db = require("../config/db");

async function attachItems(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const txIds = rows.map((r) => r.id).filter(Boolean);
  if (!txIds.length) return rows;

  const [details] = await db.query(
    `SELECT
       td.transaction_id,
       td.variant_id,
       td.quantity,
       td.price_per_unit,
       td.subtotal,
       v.variant_name,
       v.sku,
       p.product_name
     FROM tt_transaction_detail td
     LEFT JOIN ms_product_variant v ON v.id = td.variant_id
     LEFT JOIN tm_product p ON p.id = v.product_id
     WHERE td.transaction_id IN (?)
     ORDER BY td.id ASC`,
    [txIds]
  );

  const byTx = new Map();
  for (const d of details) {
    const list = byTx.get(d.transaction_id) || [];
    list.push({
      variant_id: d.variant_id,
      name: d.product_name
        ? d.variant_name && d.variant_name !== d.product_name
          ? `${d.product_name} (${d.variant_name})`
          : d.product_name
        : d.variant_name || `Varian #${d.variant_id}`,
      sku: d.sku || "-",
      qty: Number(d.quantity || 0),
      price: Number(d.price_per_unit || 0),
      subtotal: Number(d.subtotal || Number(d.quantity || 0) * Number(d.price_per_unit || 0)),
    });
    byTx.set(d.transaction_id, list);
  }

  return rows.map((r) => ({
    ...r,
    items: byTx.get(r.id) || [],
  }));
}

const TransactionModel = {
  // Ambil semua transaksi
  getAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM tt_transaction ORDER BY created_at DESC"
    );
    return attachItems(rows);
  },

  // Ambil transaksi berdasarkan daftar store_id (untuk Owner / Manager)
  getByStoreIds: async (storeIds = []) => {
    if (!storeIds.length) return [];
    const [rows] = await db.query(
      `SELECT
         t.*,
         s.store_name,
         u.name AS cashier_name,
         c.name AS customer_name,
         (SELECT COUNT(*) FROM tt_transaction_detail td WHERE td.transaction_id = t.id) AS total_items
       FROM tt_transaction t
       LEFT JOIN tm_store s ON s.id = t.store_id
       LEFT JOIN tm_users u ON u.id = t.cashier_id
       LEFT JOIN tm_users c ON c.id = t.customer_id
       WHERE t.store_id IN (?)
       ORDER BY t.created_at DESC`,
      [storeIds]
    );
    return attachItems(rows);
  },

  // Ambil transaksi yang dilayani kasir tertentu
  getByCashierId: async (cashierId) => {
    const [rows] = await db.query(
      `SELECT
         t.*,
         s.store_name,
         c.name AS customer_name,
         (SELECT COUNT(*) FROM tt_transaction_detail td WHERE td.transaction_id = t.id) AS total_items
       FROM tt_transaction t
       LEFT JOIN tm_store s ON s.id = t.store_id
       LEFT JOIN tm_users c ON c.id = t.customer_id
       WHERE t.cashier_id = ?
       ORDER BY t.created_at DESC`,
      [cashierId]
    );
    return attachItems(rows);
  },

  // Ambil transaksi milik customer tertentu
  getByCustomerId: async (customerId) => {
    const [rows] = await db.query(
      `SELECT
         t.*,
         s.store_name,
         u.name AS cashier_name,
         (SELECT COUNT(*) FROM tt_transaction_detail td WHERE td.transaction_id = t.id) AS total_items
       FROM tt_transaction t
       LEFT JOIN tm_store s ON s.id = t.store_id
       LEFT JOIN tm_users u ON u.id = t.cashier_id
       WHERE t.customer_id = ?
       ORDER BY t.created_at DESC`,
      [customerId]
    );
    return attachItems(rows);
  },

  // Simpan header transaksi baru
  create: async (transactionData) => {
    const {
      customer_id,
      cashier_id,
      store_id,
      sale_type,
      total_price,
      status,
    } = transactionData;
    const [result] = await db.query(
      `INSERT INTO tt_transaction 
        (customer_id, cashier_id, store_id, sale_type, total_price, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        customer_id || null,
        cashier_id || null,
        store_id || null,
        sale_type || "RETAIL",
        total_price,
        status || "PAID",
      ]
    );
    return result.insertId;
  },

  // Simpan detail item transaksi
  createDetail: async (detailData) => {
    const { transaction_id, variant_id, quantity, price_per_unit, subtotal } =
      detailData;
    const [result] = await db.query(
      `INSERT INTO tt_transaction_detail 
        (transaction_id, variant_id, quantity, price_per_unit, subtotal) 
       VALUES (?, ?, ?, ?, ?)`,
      [transaction_id, variant_id, quantity, price_per_unit, subtotal]
    );
    return result;
  },

  // Log pergerakan stok keluar
  createStockMovement: async (movementData) => {
    const { store_id, variant_id, qty, reference_id, created_by } =
      movementData;
    const [result] = await db.query(
      `INSERT INTO tt_stock_movement 
        (store_id, variant_id, movement_type, qty, reference_type, reference_id, created_by, created_at) 
       VALUES (?, ?, 'OUT', ?, 'SALE', ?, ?, NOW())`,
      [store_id || 1, variant_id, qty, reference_id, created_by || 1]
    );
    return result;
  },
};

module.exports = TransactionModel;
