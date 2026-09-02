// src/models/userModel.js
// CATATAN: Versi MINIMAL, cuma untuk validasi FK (mis. created_by) dari modul lain.
// Modul User & Keamanan nanti bisa memperluas file ini dengan CRUD lengkap + auth,
// pastikan function findById tetap ada supaya modul lain tidak ikut rusak.

const pool = require('../config/db');

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM tm_users WHERE id = ?', [id]);
  return rows[0] || null;
}

module.exports = { findById };
