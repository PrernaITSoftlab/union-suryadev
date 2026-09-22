import jwt from 'jsonwebtoken';
import { inMemoryStore } from '../config/db.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'unionsuyradev_secret_jwt_key_2026_super_secure');
    
    // Find user in memory store or attach decoded user
    const user = inMemoryStore.users.find(u => u.id === decoded.id) || decoded;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator rights required.' });
  }
  next();
};
