const express = require('express');
const router = express.Router();
const { createVariant, getAllVariants } = require('../controllers/productVariantController');

router.post('/', createVariant);
router.get('/', getAllVariants);

module.exports = router;