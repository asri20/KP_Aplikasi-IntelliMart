require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/database');

const dashboardRoutes = require('./src/routes/dashboardRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const dashboardController = require('./src/controllers/dashboardController');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend statis dari folder 'public'
app.use(express.static('public'));

// Koneksi ke MySQL Remote
connectDB();

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);

// Alias untuk daftar toko
app.get('/api/stores', dashboardController.getStores);

// Health check
app.get('/api', (req, res) => {
  res.json({
    message: 'IntelliMart Dashboard & Analytics API berjalan 🚀',
    modul: 'Modul 10 — Dashboard & Analitik',
    port: process.env.PORT || 5001,
    endpoints: {
      dashboard: [
        'GET /api/dashboard/stores',
        'GET /api/dashboard/summary?store_id=X',
        'GET /api/dashboard/low-stock?store_id=X',
        'GET /api/dashboard/recent-transactions?store_id=X&limit=5'
      ],
      analytics: [
        'GET /api/analytics/top-products?store_id=X&limit=10',
        'GET /api/analytics/profit?store_id=X&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD',
        'GET /api/analytics/sales-trend?store_id=X&days=30',
        'GET /api/analytics/product-catalog?store_id=X&search=keyword',
        'GET /api/analytics/customer-segments'
      ],
      reports: [
        'GET /api/reports/product-catalog?store_id=X',
        'GET /api/reports/low-stock?store_id=X',
        'GET /api/reports/sales-daily?store_id=X',
        'GET /api/reports/best-selling?store_id=X',
        'GET /api/reports/customer-segment'
      ]
    }
  });
});

// Mulai Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 IntelliMart Modul 10 — Dashboard & Analitik`);
  console.log(`   API Server  : http://localhost:${PORT}/api`);
  console.log(`   Frontend    : http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
