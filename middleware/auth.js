// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};

const checkStoreAccess = (req, res, next) => {
  const { store_id } = req.body || req.query;
  if (store_id && store_id != req.user.store_id) {
    return res.status(403).json({ message: 'Akses toko ditolak' });
  }
  next();
};

module.exports = { authenticate, checkStoreAccess };