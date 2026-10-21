
const express = require('express');
const router = express.Router();

const storeStaffController = require('../controllers/storeStaffController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

router.get(
  '/',
  verifyToken,
  checkPermission('manage_stores'),
  storeStaffController.getMyStaff
);

router.post(
  '/assign',
  verifyToken,
  checkPermission('manage_stores'),
  storeStaffController.assignStaff
);

router.put(
  '/:userId/move',
  verifyToken,
  checkPermission('manage_stores'),
  storeStaffController.moveStaff
);

module.exports = router;
