// src/models/storeModel.js
// CATATAN: Ini versi MINIMAL, cuma untuk validasi FK dari Modul Produk & Stok.
// Kalau tim Modul Core/User sudah bikin storeModel.js sendiri dengan CRUD lengkap,
// pastikan function findById tetap ada (nama & signature sama) supaya modul lain
// yang sudah pakai file ini tidak ikut rusak.

const pool = require('../config/db');

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM tm_store WHERE id = ?', [id]);
  return rows[0] || null;
}

module.exports = { findById };
