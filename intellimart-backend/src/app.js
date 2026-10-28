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

  // Cek apakah ini error dari PostgreSQL
  if (err.code) {
    // Unique constraint violation
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Data sudah ada (duplikat). Periksa kembali data yang dimasukkan.',
        error: 'DUPLICATE_ENTRY',
        detail: err.detail,
      });
    }

    // Foreign key violation
    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Data referensi tidak ditemukan (foreign key violation).',
        error: 'FOREIGN_KEY_VIOLATION',
        detail: err.detail,
      });
    }

    // Not null violation
    if (err.code === '23502') {
      return res.status(400).json({
        success: false,
        message: 'Field wajib tidak boleh kosong.',
        error: 'NOT_NULL_VIOLATION',
        detail: err.detail,
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
