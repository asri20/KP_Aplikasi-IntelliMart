// routes/goodsReceiptRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/goodsReceiptController');

router.get('/',    ctrl.getAllReceipts);
router.post('/',   ctrl.createReceipt);
router.get('/:id', ctrl.getReceiptById);

// Verifikasi & tolak
router.put('/:id/verify', ctrl.verifyReceipt);
router.put('/:id/reject', ctrl.rejectReceipt);

module.exports = router;
