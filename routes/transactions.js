// routes/transactions.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * 1. POST /api/transactions/checkout
 * Alur Pembeli / Kasir: Buat order baru (Status awal: UNPAID, stok belum terpotong)
 * Body: { customer_id, store_id, sale_type: 'RETAIL'|'WHOLESALE', items: [{ variant_id, quantity, price_per_unit }] }
 */
router.post('/checkout', async (req, res) => {
  const { customer_id, store_id, sale_type = 'RETAIL', items } = req.body;

  if (!store_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Data store_id dan items wajib diisi.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Hitung total harga dari items
    let totalPrice = 0;
    items.forEach(item => {
      totalPrice += parseFloat(item.quantity) * parseFloat(item.price_per_unit);
    });

    // 1. Insert ke header transaksi (tt_transaction)
    const [txResult] = await connection.query(
      `INSERT INTO tt_transaction (customer_id, store_id, total_price, sale_type, status) 
       VALUES (?, ?, ?, ?, 'UNPAID')`,
      [customer_id || null, store_id, totalPrice, sale_type]
    );

    const transactionId = txResult.insertId;

    // 2. Insert ke detail transaksi (tt_transaction_detail)
    for (const item of items) {
      const subtotal = parseFloat(item.quantity) * parseFloat(item.price_per_unit);
      await connection.query(
        `INSERT INTO tt_transaction_detail (transaction_id, variant_id, quantity, price_per_unit, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [transactionId, item.variant_id, item.quantity, item.price_per_unit, subtotal]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Checkout berhasil. Silakan lakukan pelunasan di kasir.',
      transaction_id: transactionId,
      total_price: totalPrice,
      status: 'UNPAID'
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * 2. GET /api/transactions/pending
 * Alur Kasir: Ambil antrean transaksi berstatus UNPAID per toko
 */
router.get('/pending', async (req, res) => {
  const { store_id } = req.query;

  if (!store_id) {
    return res.status(400).json({ error: 'Parameter store_id wajib diisi.' });
  }

  try {
    const queryText = `
      SELECT 
        t.id AS transaction_id,
        t.customer_id,
        t.total_price,
        t.sale_type,
        t.status,
        t.created_at
      FROM tt_transaction t
      WHERE t.store_id = ? AND t.status = 'UNPAID'
      ORDER BY t.created_at DESC;
    `;

    const [rows] = await pool.query(queryText, [store_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. POST /api/transactions/fulfill
 * Alur Kasir: Pelunasan transaksi (Wajib panggil Stored Procedure sp_process_payment)
 * Procedure ini otomatis memvalidasi stok, mengubah status ke LUNAS, dan memotong stok via trigger
 * Body: { transaction_id, cashier_id }
 */
router.post('/fulfill', async (req, res) => {
  const { transaction_id, cashier_id } = req.body;

  if (!transaction_id || !cashier_id) {
    return res.status(400).json({ error: 'transaction_id dan cashier_id wajib diisi.' });
  }

  try {
    // Panggil Stored Procedure sp_process_payment(transaction_id, cashier_id)
    const [spResult] = await pool.query(
      'CALL sp_process_payment(?, ?)',
      [transaction_id, cashier_id]
    );

    // Hasil SELECT dari stored procedure mengembalikan array pesan
    const responseMessage = spResult[0]?.[0]?.message || 'Proses transaksi selesai.';

    if (responseMessage.startsWith('SUKSES')) {
      return res.json({
        success: true,
        message: responseMessage
      });
    } else {
      return res.status(400).json({
        success: false,
        message: responseMessage
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. GET /api/transactions/:id
 * Ambil detail lengkap transaksi (Header + Detail Item)
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [txRows] = await pool.query('SELECT * FROM tt_transaction WHERE id = ?', [id]);

    if (txRows.length === 0) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });
    }

    const [detailRows] = await pool.query(
      `SELECT 
        td.id AS detail_id,
        td.variant_id,
        v.variant_name,
        v.sku,
        td.quantity,
        td.price_per_unit,
        td.subtotal
       FROM tt_transaction_detail td
       JOIN ms_product_variant v ON td.variant_id = v.id
       WHERE td.transaction_id = ?`,
      [id]
    );

    res.json({
      transaction: txRows[0],
      items: detailRows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;