const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  // 1. Look for the "Authorization" header in the incoming request
  const authHeader = req.headers['authorization'];

  // 2. The standard format is "Bearer <token>". We split the string to just get the token part.
  const token = authHeader && authHeader.split(' ')[1];

  // 3. If there is no token, kick them out immediately
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // 4. Verify the token using our secret signature
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      // 403 Forbidden means the token was provided, but it is invalid or expired
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }

    // 5. The token is real! Attach the decoded user data (id, role) to the request object
    // This allows the controller to know exactly who made the request
    req.user = decodedUser;

    // 6. Pass the request to the next function (your controller)
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  // 1. req.user was securely attached by the authenticateToken middleware
  // We check if it exists and if the role strictly equals 'admin'
  if (!req.user || req.user.role !== 'admin') {
    // 403 Forbidden means: "I know exactly who you are, but you do not have permission to do this."
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }

  // 2. If they are an admin, let them through to the controller
  next();
};

module.exports = {
  authenticateToken,
  authorizeAdmin
};