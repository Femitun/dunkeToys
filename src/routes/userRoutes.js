const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/userController');

// The route will be POST /api/users/register
router.post('/register', registerUser);

module.exports = router;