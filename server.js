require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/database');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const storeRoutes = require('./src/routes/storeRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const brandRoutes = require('./src/routes/brandRoutes');
const unitRoutes = require('./src/routes/unitRoutes');
const productRoutes = require('./src/routes/productRoutes');
const variantRoutes = require('./src/routes/variantRoutes');
const stockRoutes = require('./src/routes/stockRoutes');
const priceCodeRoutes = require('./src/routes/priceCodeRoutes');
const tierPriceRoutes = require('./src/routes/tierPriceRoutes');
const stockMovementRoutes = require('./src/routes/stockMovementRoutes');
const unitConversionRoutes = require('./src/routes/unitConversionRoutes');
const productImageRoutes = require('./src/routes/productImageRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redirect root akses langsung ke aplikasi React (localhost:3000)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.get(['/', '/index.html'], (req, res) => {
  res.redirect(FRONTEND_URL);
});

// Serve frontend statis dari folder 'public'
app.use(express.static('public'));

// Koneksi ke MySQL Remote
connectDB();

// =============================================
// API ROUTES (Gabungan Modul Lengkap + Modul 10)
// =============================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/products', productRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/price-codes', priceCodeRoutes);
app.use('/api/tier-prices', tierPriceRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/unit-conversions', unitConversionRoutes);
app.use('/api/product-images', productImageRoutes);
app.use('/api/transactions', transactionRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'IntelliMart Unified REST API berjalan 🚀',
    port: process.env.PORT || 5001,
    endpoints: {
      auth: ['/api/auth/register', '/api/auth/login', '/api/auth/logout'],
      users: ['/api/users'],
      stores: ['/api/stores', '/api/stores/assign-manager'],
      catalog: ['/api/categories', '/api/brands', '/api/units', '/api/products', '/api/variants'],
      inventory: ['/api/stocks', '/api/stock-movements'],
      pricing: ['/api/price-codes', '/api/tier-prices', '/api/unit-conversions'],
      transactions: ['/api/transactions', '/api/transactions/checkout'],
      dashboard: ['/api/dashboard/stores', '/api/dashboard/summary', '/api/dashboard/low-stock', '/api/dashboard/recent-transactions'],
      analytics: ['/api/analytics/top-products', '/api/analytics/profit', '/api/analytics/sales-trend', '/api/analytics/product-catalog', '/api/analytics/customer-segments'],
      reports: ['/api/reports/product-catalog', '/api/reports/low-stock', '/api/reports/sales-daily', '/api/reports/best-selling', '/api/reports/customer-segment'],
    },
  });
});

// Mulai Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 IntelliMart Unified Backend API`);
  console.log(`   API Server  : http://localhost:${PORT}/api`);
  console.log(`   Frontend    : ${FRONTEND_URL}`);
  console.log(`======================================================\n`);
});

module.exports = app;
