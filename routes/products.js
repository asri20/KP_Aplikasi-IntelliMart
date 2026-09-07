// routes/products.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * 1. GET /api/products
 * Ambil daftar produk berdasarkan cabang toko (store_id)
 * Mendukung filteropsional: ?store_id=1&search=indomie&category_id=2
 */
router.get('/', async (req, res) => {
  const { store_id, search, category_id } = req.query;

  if (!store_id) {
    return res.status(400).json({ error: 'Parameter store_id wajib diisi.' });
  }

  try {
    let queryText = `
      SELECT 
        p.id AS product_id,
        p.product_name,
        v.id AS variant_id,
        v.variant_name,
        v.sku,
        ps.store_id,
        ps.stock,
        ps.min_stock,
        ps.base_price,
        ps.price_code_id,
        pc.code AS price_code,
        ps.discount_store
      FROM tr_product_stock ps
      JOIN ms_product_variant v ON ps.variant_id = v.id
      JOIN tm_product p ON v.product_id = p.id
      LEFT JOIN tm_price_code pc ON ps.price_code_id = pc.id
      WHERE ps.store_id = ?
    `;

    const queryParams = [store_id];

    // Filter pencarian berdasarkan nama produk atau SKU
    if (search) {
      queryText += ` AND (p.product_name LIKE ? OR v.sku LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Filter berdasarkan kategori
    if (category_id) {
      queryText += ` AND p.category_id = ?`;
      queryParams.push(category_id);
    }

    const [rows] = await pool.query(queryText, queryParams);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2. POST /api/products/calculate-price
 * Hitung harga akhir secara dinamis (Base Price / Tier Price + Diskon Toko)
 * Body JSON: { "price_code_id": 1, "quantity": 10, "base_price": 5000, "discount_store": 5 }
 */
router.post('/calculate-price', async (req, res) => {
  const { price_code_id, quantity, base_price, discount_store = 0 } = req.body;

  if (!quantity || base_price === undefined) {
    return res.status(400).json({ error: 'Data quantity dan base_price wajib dikirim.' });
  }

  try {
    let unitPrice = parseFloat(base_price);
    let appliedTier = false;

    // Jika produk memiliki kode harga bertingkat, cek tr_tier_price
    if (price_code_id) {
      const queryTier = `
        SELECT unit_price 
        FROM tr_tier_price
        WHERE price_code_id = ? AND ? >= min_qty AND ? <= max_qty
        LIMIT 1;
      `;
      const [tierRows] = await pool.query(queryTier, [price_code_id, quantity, quantity]);

      if (tierRows.length > 0) {
        unitPrice = parseFloat(tierRows[0].unit_price);
        appliedTier = true;
      }
    }

    // Terapkan diskon tambahan toko (persen) jika ada
    const discountAmount = (unitPrice * parseFloat(discount_store)) / 100;
    const finalUnitPrice = unitPrice - discountAmount;
    const totalPrice = finalUnitPrice * parseInt(quantity);

    res.json({
      original_base_price: parseFloat(base_price),
      tier_applied: appliedTier,
      unit_price_before_discount: unitPrice,
      discount_store_percent: parseFloat(discount_store),
      final_unit_price: finalUnitPrice,
      quantity: parseInt(quantity),
      total_price: totalPrice
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. GET /api/products/low-stock
 * Mengambil daftar produk yang stoknya di bawah batas minimum (menggunakan View vw_low_stock_alert)
 */
router.get('/low-stock', async (req, res) => {
  const { store_id } = req.query;

  try {
    let queryText = `SELECT * FROM vw_low_stock_alert`;
    const queryParams = [];

    if (store_id) {
      queryText += ` WHERE store_id = ?`;
      queryParams.push(store_id);
    }

    const [rows] = await pool.query(queryText, queryParams);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;