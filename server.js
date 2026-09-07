// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import koneksi Sequelize dari folder models (Poin 4)
const { sequelize } = require('./models');

// Import rute modular yang sudah dibuat (Poin 5, 6, 7)
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const poRoutes = require('./routes/purchaseOrder');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mounting Rute API
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/po', poRoutes);

const PORT = process.env.PORT || 5000;

// Cek koneksi database & jalankan server Express
sequelize.authenticate()
  .then(() => {
    console.log('Koneksi Sequelize ke database MySQL Intellimart BERHASIL!');
    app.listen(PORT, () => {
      console.log(`Server Intellimart berjalan di port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Gagal terhubung ke database MySQL:', err.message);
  });