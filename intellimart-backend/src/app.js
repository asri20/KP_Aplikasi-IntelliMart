// src/app.js
// Entry point utama aplikasi IntelliMart Backend

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import semua routes
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes    = require('./routes/brandRoutes');
const unitRoutes     = require('./routes/unitRoutes');
const productRoutes  = require('./routes/productRoutes');
const variantRoutes  = require('./routes/variantRoutes');
const stockRoutes    = require('./routes/stockRoutes');
const priceCodeRoutes = require('./routes/priceCodeRoutes');
const tierPriceRoutes = require('./routes/tierPriceRoutes');
const stockMovementRoutes = require('./routes/stockMovementRoutes');
const unitConversionRoutes = require('./routes/unitConversionRoutes');
const productImageRoutes = require('./routes/productImageRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// =============================================
// MIDDLEWARE
// =============================================

// CORS - Izinkan frontend React mengakses API
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON body
app.use(express.json());

// Parse URL-encoded body
app.use(express.urlencoded({ extended: true }));

// Logger sederhana untuk setiap request
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// =============================================
// ROUTES
// =============================================

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'IntelliMart API berjalan dengan baik',
    version: '1.0.0',
    endpoints: {
      categories: '/api/categories',
      brands:     '/api/brands',
      units:      '/api/units',
      products:   '/api/products',
      variants:   '/api/variants',
      stocks:     '/api/stocks',
    },
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'IntelliMart REST API v1.0',
    documentation: 'Lihat README.md untuk dokumentasi lengkap',
  });
});

// Mount semua routes di bawah prefix /api
app.use('/api/categories', categoryRoutes);
app.use('/api/brands',     brandRoutes);
app.use('/api/units',      unitRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/variants',   variantRoutes);
app.use('/api/stocks',     stockRoutes);
app.use('/api/price-codes', priceCodeRoutes);
app.use('/api/tier-prices', tierPriceRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/unit-conversions', unitConversionRoutes);
app.use('/api/product-images', productImageRoutes);
app.use('/api/reports', reportRoutes);

// =============================================
// ERROR HANDLING MIDDLEWARE
// =============================================

// Handler untuk route yang tidak ditemukan (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.url}' tidak ditemukan`,
    error: 'NOT_FOUND',
  });
});

// Handler error global (500)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err);

  // Cek apakah ini error dari MySQL/MariaDB
  if (err.code) {
    // Unique constraint violation (misal: sku/email/po_number sudah ada)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Data sudah ada (duplikat). Periksa kembali data yang dimasukkan.',
        error: 'DUPLICATE_ENTRY',
        detail: err.sqlMessage,
      });
    }

    // Insert/update menunjuk ke data induk yang tidak ada
    // (misal: kasih price_code_id yang belum terdaftar di tm_price_code)
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
      return res.status(400).json({
        success: false,
        message: 'Data referensi tidak ditemukan (foreign key violation).',
        error: 'FOREIGN_KEY_VIOLATION',
        detail: err.sqlMessage,
      });
    }

    // Coba hapus/ubah data induk yang masih dipakai data lain
    // (misal: hapus tm_price_code yang masih dipakai tr_product_stock -> diblokir RESTRICT)
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({
        success: false,
        message: 'Data ini masih dipakai di tempat lain, tidak bisa dihapus/diubah.',
        error: 'ROW_IS_REFERENCED',
        detail: err.sqlMessage,
      });
    }

    // Field wajib (NOT NULL) tidak diisi
    if (err.code === 'ER_BAD_NULL_ERROR') {
      return res.status(400).json({
        success: false,
        message: 'Field wajib tidak boleh kosong.',
        error: 'NOT_NULL_VIOLATION',
        detail: err.sqlMessage,
      });
    }
  }

  // Error umum
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'INTERNAL_SERVER_ERROR',
  });
});

// =============================================
// START SERVER
// =============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('================================================');
  console.log(`🚀 IntelliMart Backend berjalan di port ${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   URL:  http://localhost:${PORT}`);
  console.log(`   API:  http://localhost:${PORT}/api`);
  console.log('================================================');
});

module.exports = app;