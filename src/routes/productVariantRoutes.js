const express = require('express');
const router = express.Router();
const { createVariant, getAllVariants } = require('../controllers/productVariantController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');


router.post('/', authenticateToken, authorizeAdmin, createVariant);
router.get('/', getAllVariants);

module.exports = router;