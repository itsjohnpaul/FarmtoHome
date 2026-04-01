const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = "your_secret_key"; // later move to .env

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(403).json({ message: 'Invalid token' });
  }
};

const requireFarmer = (req, res, next) => {
  if (req.user.userType !== 'farmer') {
    return res.status(403).json({ message: 'Access denied. Farmer role required.' });
  }
  next();
};

const requireCustomer = (req, res, next) => {
  if (req.user.userType !== 'customer') {
    return res.status(403).json({ message: 'Access denied. Customer role required.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireFarmer,
  requireCustomer
};