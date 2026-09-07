// src/models/sessionModel.js
const db = require('../config/db');

// Simpan Session Baru saat Login
async function createSession(userId, token, deviceInfo) {
  // Waktu expired diset 1 hari (24 jam) ke depan sesuai dengan durasi JWT
  const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [result] = await db.query(
    `INSERT INTO tt_user_session (user_id, token, device_info, expired_at, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [userId, token, deviceInfo || 'Unknown Device', expiredAt]
  );
  return result.insertId;
}

// Hapus Session saat Logout
async function deleteSessionByToken(token) {
  const [result] = await db.query('DELETE FROM tt_user_session WHERE token = ?', [token]);
  return result.affectedRows > 0;
}

module.exports = {
  createSession,
  deleteSessionByToken
};