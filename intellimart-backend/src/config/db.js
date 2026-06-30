// src/config/db.js
// Konfigurasi koneksi PostgreSQL menggunakan pool connection

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'intellimart_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  // Pool configuration
  max: 20,                  // Maksimum koneksi dalam pool
  idleTimeoutMillis: 30000, // Koneksi idle ditutup setelah 30 detik
  connectionTimeoutMillis: 2000, // Timeout koneksi baru setelah 2 detik
});

// Test koneksi saat aplikasi pertama kali dijalankan
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error koneksi ke PostgreSQL:', err.stack);
    process.exit(1); // Keluar jika tidak bisa konek
  } else {
    console.log('✅ Berhasil terhubung ke PostgreSQL');
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    release(); // Lepaskan client kembali ke pool
  }
});

// Handle error yang tidak tertangkap pada pool
pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err);
  process.exit(1);
});

/**
 * Helper function untuk menjalankan query
 * @param {string} text - SQL query string
 * @param {Array} params - Parameter query (untuk prepared statements)
 * @returns {Promise} - Result dari query
 */
const query = (text, params) => {
  return pool.query(text, params);
};

/**
 * Helper function untuk transaksi
 * Contoh penggunaan:
 *   const client = await getClient();
 *   try {
 *     await client.query('BEGIN');
 *     // ... query-query lain
 *     await client.query('COMMIT');
 *   } catch (e) {
 *     await client.query('ROLLBACK');
 *   } finally {
 *     client.release();
 *   }
 */
const getClient = () => {
  return pool.connect();
};

module.exports = { query, getClient, pool };
