// routes/supplierRoutes.js
const express = require('express');
const router = express.Router();
const { Supplier } = require('../models');

// GET /api/suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      // Tentukan kolom yang benar-benar ada di tabel MySQL
      attributes: ['id', 'supplier_name', 'contact_person', 'phone', 'address'] 
    });
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil data supplier dari database',
      error: error.message 
    });
  }
});

module.exports = router;