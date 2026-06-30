// routes/supplierRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/supplierController');

// Rekomendasi supplier terbaik (harus sebelum /:id agar tidak bentrok)
router.get('/best', ctrl.getBestSuppliers);

// CRUD
router.get('/',    ctrl.getAllSuppliers);
router.post('/',   ctrl.createSupplier);
router.get('/:id', ctrl.getSupplierById);
router.put('/:id', ctrl.updateSupplier);
router.delete('/:id', ctrl.deleteSupplier);

module.exports = router;
