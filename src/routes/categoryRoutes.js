const express = require('express');
const router = express.Router();
// We imported the new function here
const { createCategory, getAllCategories } = require('../controllers/categoryController'); 
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// The POST route you already built
router.post('/', authenticateToken, authorizeAdmin, createCategory);

// The new GET route
router.get('/', getAllCategories); 

module.exports = router;