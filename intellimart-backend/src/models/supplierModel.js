// src/models/supplierModel.js
// CATATAN: Versi MINIMAL, cuma untuk validasi FK dari Modul Produk & Stok.
// Modul Supplier & Pembelian nanti bisa memperluas file ini dengan CRUD lengkap,
// pastikan function findById tetap ada supaya modul lain tidak ikut rusak.

const pool = require('../config/db');

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM tm_supplier WHERE id = ?', [id]);
  return rows[0] || null;
}

module.exports = { findById };
