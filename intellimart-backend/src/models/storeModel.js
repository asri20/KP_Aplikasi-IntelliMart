// src/models/storeModel.js
// CATATAN: Ini versi MINIMAL, cuma untuk validasi FK dari Modul Produk & Stok.
// Kalau tim Modul Core/User sudah bikin storeModel.js sendiri dengan CRUD lengkap,
// pastikan function findById tetap ada (nama & signature sama) supaya modul lain
// yang sudah pakai file ini tidak ikut rusak.

// src/models/storeModel.js
const pool = require('../config/db');

// 1. Cari toko berdasarkan ID (Digunakan untuk validasi & modul lain)
async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM tm_store WHERE id = ?', [id]);
  return rows[0] || null;
}

// 2. Buat toko baru
async function createStore(storeData) {
  const { store_name, location, phone, owner_id, manager_id } = storeData;
  const [result] = await pool.query(
    `INSERT INTO tm_store (store_name, location, phone, owner_id, manager_id, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
    [store_name, location || null, phone || null, owner_id, manager_id || null]
  );
  return { id: result.insertId, ...storeData };
}

// 3. Menugaskan Manager ke Toko
async function assignManager(storeId, managerId) {
  const [result] = await pool.query(
    `UPDATE tm_store SET manager_id = ?, updated_at = NOW() WHERE id = ?`,
    [managerId, storeId]
  );
  return result.affectedRows > 0;
}

// 4. Ambil semua toko milik Owner tertentu
async function findByOwnerId(ownerId) {
  const [rows] = await pool.query('SELECT * FROM tm_store WHERE owner_id = ? ORDER BY id DESC', [ownerId]);
  return rows;
}

module.exports = {
  findById,
  createStore,
  assignManager,
  findByOwnerId
};
