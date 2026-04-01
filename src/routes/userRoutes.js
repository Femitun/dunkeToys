const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers } = require('../controllers/userController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// The route will be POST /api/users/register
router.post('/register', registerUser);

// The new route will be POST /api/users/login
router.post('/login', loginUser);

router.get('/',authenticateToken, authorizeAdmin, getAllUsers);

module.exports = router;