const express = require('express');
const router = express.Router();
// Update the import to include getAllProducts
const { createProduct, getAllProducts } = require('../controllers/productController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// Existing POST route
router.post('/', authenticateToken, authorizeAdmin, createProduct);

// New GET route
router.get('/', getAllProducts);

module.exports = router;