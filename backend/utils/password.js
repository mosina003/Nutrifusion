const bcrypt = require('bcryptjs');

/**
 * Hash password
 * @param {String} password - Plain text password
 * @returns {String} Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 * @param {String} password - Plain text password
 * @param {String} hashedPassword - Hashed password from database
 * @returns {Boolean} True if password matches
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword
};
