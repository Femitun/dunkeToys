const express = require('express');
const router = express.Router();
// Update the import to include getAllProducts
const { createProduct, getAllProducts } = require('../controllers/productController');

// Existing POST route
router.post('/', createProduct);

// New GET route
router.get('/', getAllProducts);

module.exports = router;