require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/database');

const dashboardRoutes = require('./src/routes/dashboardRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Koneksi ke PostgreSQL
connectDB();

// Menghubungkan Route API
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

// Pengecekan server dasar
app.get('/', (req, res) => {
  res.send('IntelliMart Dashboard & Analytics API is running 🚀');
});

// Mulai Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Dashboard API Server berjalan di http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
