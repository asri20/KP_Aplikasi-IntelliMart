require('dotenv').config();
const { Sequelize } = require('sequelize');

// Setup koneksi Sequelize menggunakan kredensial dari .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Ubah ke console.log jika ingin melihat aktivitas query
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Berhasil terhubung ke database PostgreSQL (Dashboard Analytics)');
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error);
  }
};

module.exports = { sequelize, connectDB };
