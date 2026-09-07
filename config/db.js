// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '153.92.15.23',
  user: process.env.DB_USER || 'u203366347_intellimart',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'u203366347_intellimart',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;