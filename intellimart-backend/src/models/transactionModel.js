const db = require("../config/db");

const TransactionModel = {
  // Ambil data transaksi
  getAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM tt_transaction ORDER BY created_at DESC",
    );
    return rows;
  },

  // Simpan transaksi baru
  create: async (transactionData) => {
    const { customer_id, total_amount, payment_id } = transactionData;
    const [result] = await db.query(
      "INSERT INTO tt_transaction (customer_id, total_amount, payment_id, created_at) VALUES (?, ?, ?, NOW())",
      [customer_id || null, total_amount, payment_id],
    );
    return result.insertId;
  },

  // Simpan detail item transaksi
  createDetail: async (detailData) => {
    const { transaction_id, product_id, qty, price, subtotal } = detailData;
    const [result] = await db.query(
      "INSERT INTO tt_transaction_detail (transaction_id, product_id, qty, price, subtotal) VALUES (?, ?, ?, ?, ?)",
      [transaction_id, product_id, qty, price, subtotal],
    );
    return result;
  },
};

module.exports = TransactionModel;
