const db = require("../config/db");

const TransactionModel = {
  // Ambil semua transaksi
  getAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM tt_transaction ORDER BY created_at DESC",
    );
    return rows;
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
      ],
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
      [transaction_id, variant_id, quantity, price_per_unit, subtotal],
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
      [store_id || 1, variant_id, qty, reference_id, created_by || 1],
    );
    return result;
  },
};

module.exports = TransactionModel;
