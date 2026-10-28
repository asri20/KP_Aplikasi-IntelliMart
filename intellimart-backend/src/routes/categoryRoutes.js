const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, checkOwner } = require('../middlewares/authMiddleware');

// Category management is restricted to authenticated Owners.
router.use(verifyToken, checkOwner);

router.get('/', categoryController.listCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', categoryController.addCategory);
router.put('/:id', categoryController.editCategory);
router.delete('/:id', categoryController.removeCategory);

module.exports = router;
