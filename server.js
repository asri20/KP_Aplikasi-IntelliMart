// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { sequelize } = require('./models');

// Middleware Auth
const { authenticate } = require('./middleware/auth');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/auth', require('./routes/authRoutes'));

// ── Routes dengan Proteksi Auth & Multi-Toko ─────────────────────────────────
app.use('/api/suppliers', authenticate, require('./routes/supplierRoutes'));
app.use('/api/purchase-orders', authenticate, require('./routes/purchaseOrderRoutes'));
app.use('/api/goods-receipts', authenticate, require('./routes/goodsReceiptRoutes')); // ← BARU

// ── Public Routes (tidak perlu auth) ───────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server berjalan', 
    timestamp: new Date() 
  });
});

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.path} tidak ditemukan` 
  });
});

// ── Start Server ───────────────────────────────────────────────────────────
sequelize.sync({ alter: true })  // alter: true = update tabel tanpa hapus data
  .then(() => {
    console.log('✅ Database connected & tables synced');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
  });