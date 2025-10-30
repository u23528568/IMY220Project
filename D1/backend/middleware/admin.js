const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'repofox-secret-key-2024';

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    } else {
      return res.status(500).json({ error: 'Server error in authentication.' });
    }
  }
};

module.exports = adminAuth;
