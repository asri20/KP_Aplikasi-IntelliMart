require('dotenv').config();
const mysql = require('mysql2/promise');

// Pool koneksi MySQL Remote — sama persis pola dengan modul_4 & modul_UserKeamanan
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const connectDB = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Berhasil terhubung ke database MySQL Remote (IntelliMart)');
    conn.release();
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error.message);
  }
};

module.exports = { pool, connectDB };
