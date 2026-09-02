const db = require("../config/db");

const TransactionModel = {
  // 1. Ambil detail transaksi lengkap berdasarkan ID (untuk Cetak Struk/Invoice)
  getById: async (transactionId) => {
    try {
      // Ambil Header Transaksi langsung dari tt_transaction
      const [headerRows] = await db.query(
        `SELECT * FROM tt_transaction WHERE id = ?`,
        [transactionId],
      );

      if (headerRows.length === 0) return null;

      // Ambil Detail Item Transaksi dari tt_transaction_detail
      const [detailRows] = await db.query(
        `SELECT * FROM tt_transaction_detail WHERE transaction_id = ?`,
        [transactionId],
      );

      return {
        header: headerRows[0],
        items: detailRows,
      };
    } catch (err) {
      console.error("Error fetching transaction by ID:", err.message);
      throw err;
    }
  },

  // 2. Ambil harga bertingkat (bulk pricing) dari tabel tr_tier_price
  getTierPrice: async (priceCodeId, qty) => {
    try {
      const [rows] = await db.query(
        `SELECT unit_price 
         FROM tr_tier_price 
         WHERE price_code_id = ? 
           AND min_qty <= ? 
           AND (max_qty >= ? OR max_qty IS NULL)
         ORDER BY min_qty DESC 
         LIMIT 1`,
        [priceCodeId, qty, qty],
      );
      return rows.length > 0 ? rows[0].unit_price : null;
    } catch (err) {
      console.error("Error fetching tier price:", err.message);
      return null;
    }
  },

  // 3. Ambil semua data transaksi
  getAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM tt_transaction ORDER BY created_at DESC",
    );
    return rows;
  },

  // 4. Simpan header transaksi baru ke tt_transaction
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

  // 5. Simpan detail item transaksi ke tt_transaction_detail
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

  // 6. Log pergerakan stok keluar ke tt_stock_movement
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
