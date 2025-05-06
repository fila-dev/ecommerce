const express = require('express');
const router = express.Router();

const {
    getAllCategories,
    getSingleCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

// All routes (no auth required)
router.get('/', getAllCategories);
router.get('/:id', getSingleCategory);
router.post('/', createCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;