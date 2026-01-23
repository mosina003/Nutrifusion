const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token (userId, role, etc.)
 * @param {String} expiresIn - Token expiration time (default: 7d)
 * @returns {String} JWT token
 */
const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn
  });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken
};
