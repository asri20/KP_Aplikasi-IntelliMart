const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requireStoreAccess } = require('../middlewares/storeAccess');

// Semua endpoint dashboard wajib login
router.use(verifyToken);

// GET /api/dashboard/stores - Hanya toko milik Owner / toko yang dikelola Manager
router.get('/stores', requireStoreAccess({ required: false }), (req, res) => {
  const data = (req.accessibleStores || []).filter((s) => Number(s.is_active ?? 1) === 1);
  res.json({ success: true, count: data.length, data });
});

// GET /api/dashboard/summary?store_id=X - Ringkasan KPI statistik
router.get('/summary', requireStoreAccess(), dashboardController.getSummary);

// GET /api/dashboard/low-stock?store_id=X - Peringatan stok menipis
router.get('/low-stock', requireStoreAccess(), dashboardController.getLowStock);

// GET /api/dashboard/recent-transactions?store_id=X - Transaksi terbaru
router.get('/recent-transactions', requireStoreAccess(), dashboardController.getRecentTransactions);

module.exports = router;
