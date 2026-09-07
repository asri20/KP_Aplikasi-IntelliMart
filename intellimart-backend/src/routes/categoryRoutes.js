const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.listCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', categoryController.addCategory);
router.put('/:id', categoryController.editCategory);
router.delete('/:id', categoryController.removeCategory);

module.exports = router;