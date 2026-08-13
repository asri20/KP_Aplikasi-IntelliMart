require('dotenv').config();
const { Sequelize } = require('sequelize');

// Setup koneksi Sequelize ke MySQL Remote
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Ubah ke console.log untuk debug query
    dialectOptions: {
      connectTimeout: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Berhasil terhubung ke database MySQL Remote (IntelliMart)');
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error.message);
  }
};

module.exports = { sequelize, connectDB };
