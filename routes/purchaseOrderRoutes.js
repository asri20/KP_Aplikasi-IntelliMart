// routes/purchaseOrderRoutes.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/purchaseOrderController');

// Ringkasan untuk dashboard (harus sebelum /:id)
router.get('/summary', ctrl.getSummary);

// CRUD
router.get('/',    ctrl.getAllPOs);
router.post('/',   ctrl.createPO);
router.get('/:id', ctrl.getPOById);
router.put('/:id', ctrl.updatePO);

// Aksi status
router.patch('/:id/status',  ctrl.updateStatus);   // ubah status fleksibel
router.put('/:id/receive',   ctrl.receivePO);       // shortcut → langsung received

// DELETE (Soft Delete)
router.delete('/:id', ctrl.deletePO);

module.exports = router;
