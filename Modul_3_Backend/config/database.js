const mysql = require('mysql2/promise');
require('dotenv').config();

// Konfigurasi koneksi ke HeidiSQL/MySQL berdasarkan environment atau data langsung
const pool = mysql.createPool({
    host: process.env.DB_HOST || '153.92.15.23', // Sesuai host HeidiSQL di gambar kamu
    user: process.env.DB_USER || 'u203366347_intellimart', // Sesuaikan user kamu
    password: process.env.DB_PASSWORD || 'Itenas@SSIP26', // Masukkan password database kamu
    database: process.env.DB_NAME || 'u203366347_intellimart',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;