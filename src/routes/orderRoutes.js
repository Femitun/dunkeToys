const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Route: POST /api/orders
// User must be logged in, but does not need admin privileges
router.post('/', authenticateToken, createOrder);

module.exports = router;