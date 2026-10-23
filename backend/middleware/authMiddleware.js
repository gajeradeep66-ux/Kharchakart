const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { normalizeRole } = require('../utils/roleUtils');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError'
      ? 'Session expired, please log in again'
      : 'Not authorized, invalid token';
    return res.status(401).json({ error: message });
  }
};

const authorize = (...roles) => (req, res, next) => {
  const normalizedUserRole = normalizeRole(req.user?.role);
  const allowedRoles = roles.map(normalizeRole);

  if (!req.user || !allowedRoles.includes(normalizedUserRole)) {
    return res.status(403).json({
      error: `Role '${req.user?.role || 'none'}' is not authorized to access this route`,
    });
  }
  next();
};

module.exports = { protect, authorize };
