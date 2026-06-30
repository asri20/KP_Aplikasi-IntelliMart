const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Route untuk Ringkasan Utama Dashboard
router.get('/summary', dashboardController.getSummary);

module.exports = router;
