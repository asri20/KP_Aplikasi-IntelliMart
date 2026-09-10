// src/helpers/loggerHelper.js
const db = require('../config/db');

/**
 * Helper untuk mencatat aktivitas ke tabel tt_activity_log
 * @param {number} userId - ID User yang melakukan aksi
 * @param {string} action - Nama aksi (LOGIN, LOGOUT, REGISTER, CHANGE_PASSWORD, dll)
 * @param {string|null} tableName - Nama tabel target ('tm_users', 'tm_store', dll)
 * @param {number|null} recordId - ID data yang diakses/diubah
 */
async function logActivity(userId, action, tableName = null, recordId = null) {
  try {
    await db.query(
      `INSERT INTO tt_activity_log (user_id, action, table_name, record_id, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId || null, action, tableName, recordId]
    );
  } catch (error) {
    console.error('[LOGGER ERROR] Gagal mencatat tt_activity_log:', error.message);
  }
}

module.exports = { logActivity };