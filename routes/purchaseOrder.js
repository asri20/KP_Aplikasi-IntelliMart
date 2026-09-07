// routes/purchaseOrder.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * 1. POST /api/po
 * Buat Purchase Order (PO) baru beserta detail barang yang dipesan
 * Body: { po_number, store_id, supplier_id, created_by, expected_date, items: [{ variant_id, qty_ordered, unit_price }] }
 */
router.post('/', async (req, res) => {
  const {
    po_number,
    store_id,
    supplier_id,
    created_by,
    expected_date,
    items
  } = req.body;

  if (!po_number || !store_id || !supplier_id || !created_by || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Data po_number, store_id, supplier_id, created_by, dan items wajib diisi.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Hitung total amount seluruh item PO (menerima unit_price atau unit_cost)
    let totalAmount = 0;
    items.forEach(item => {
      const price = parseFloat(item.unit_price ?? item.unit_cost ?? 0);
      totalAmount += parseFloat(item.qty_ordered) * price;
    });

    // 1. Insert header PO (tt_purchase_order)
    const [poResult] = await connection.query(
      `INSERT INTO tt_purchase_order 
        (po_number, store_id, supplier_id, created_by, expected_date, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, 'DRAFT')`,
      [po_number, store_id, supplier_id, created_by, expected_date || null, totalAmount]
    );

    const poId = poResult.insertId;

    // 2. Insert item detail PO (tt_purchase_order_detail) -> Gunakan kolom resmi unit_price
    for (const item of items) {
      const price = parseFloat(item.unit_price ?? item.unit_cost ?? 0);
      const subtotal = parseFloat(item.qty_ordered) * price;

      await connection.query(
        `INSERT INTO tt_purchase_order_detail 
          (po_id, variant_id, qty_ordered, qty_received, unit_price, subtotal)
         VALUES (?, ?, ?, 0, ?, ?)`,
        [poId, item.variant_id, item.qty_ordered, price, subtotal]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Purchase Order berhasil dibuat.',
      po_id: poId,
      po_number,
      status: 'DRAFT'
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * 2. GET /api/po
 * Ambil daftar Purchase Order berdasarkan toko (store_id)
 */
router.get('/', async (req, res) => {
  const { store_id } = req.query;

  if (!store_id) {
    return res.status(400).json({ error: 'Parameter store_id wajib diisi.' });
  }

  try {
    const queryText = `
      SELECT 
        po.id AS po_id,
        po.po_number,
        po.store_id,
        s.supplier_name,
        po.status,
        po.total_amount,
        po.order_date,
        po.expected_date
      FROM tt_purchase_order po
      JOIN tm_supplier s ON po.supplier_id = s.id
      WHERE po.store_id = ?
      ORDER BY po.order_date DESC;
    `;

    const [rows] = await pool.query(queryText, [store_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. GET /api/po/:id
 * Ambil detail lengkap PO beserta daftar item barang
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [poRows] = await pool.query(
      `SELECT po.*, s.supplier_name 
       FROM tt_purchase_order po
       JOIN tm_supplier s ON po.supplier_id = s.id
       WHERE po.id = ?`,
      [id]
    );

    if (poRows.length === 0) {
      return res.status(404).json({ error: 'Purchase Order tidak ditemukan.' });
    }

    const [itemRows] = await pool.query(
      `SELECT 
        pod.id AS po_detail_id,
        pod.variant_id,
        v.variant_name,
        v.sku,
        pod.qty_ordered,
        pod.qty_received,
        pod.unit_price,
        pod.subtotal
       FROM tt_purchase_order_detail pod
       JOIN ms_product_variant v ON pod.variant_id = v.id
       WHERE pod.po_id = ?`,
      [id]
    );

    res.json({
      purchase_order: poRows[0],
      items: itemRows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. POST /api/po/receive
 * Penerimaan barang dari supplier
 */
router.post('/receive', async (req, res) => {
  const { po_detail_id, qty_received, user_id } = req.body;

  if (!po_detail_id || !qty_received || !user_id) {
    return res.status(400).json({ error: 'po_detail_id, qty_received, dan user_id wajib diisi.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query('SET @current_user_id = ?', [user_id]);

    await connection.query(
      `UPDATE tt_purchase_order_detail 
       SET qty_received = qty_received + ? 
       WHERE id = ?`,
      [qty_received, po_detail_id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Penerimaan barang berhasil diproses! Stok otomatis bertambah via trigger database.'
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;