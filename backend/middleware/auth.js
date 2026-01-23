const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Practitioner = require('../models/Practitioner');

/**
 * Protect routes - Verify JWT token
 * Adds req.user or req.practitioner to request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    console.log('\n=== AUTH MIDDLEWARE DEBUG ===');
    console.log('Full header value:', JSON.stringify(authHeader));
    console.log('Header length:', authHeader ? authHeader.length : 0);
    console.log('Starts with Bearer?', authHeader ? authHeader.startsWith('Bearer') : false);
    
    if (authHeader && authHeader.startsWith('Bearer')) {
      const parts = authHeader.split(' ');
      console.log('Split parts:', parts.length, 'parts');
      console.log('Part 0:', parts[0]);
      console.log('Part 1 (first 30 chars):', parts[1] ? parts[1].substring(0, 30) : 'NONE');
      token = parts[1];
    }

    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Token required.'
      });
    }

    // Verify token
    try {
      const decoded = verifyToken(token);
      console.log('✅ Token decoded successfully:', decoded);
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
        error: error.message
      });
    }
    
    const decoded = verifyToken(token);

    // Check user type and fetch from database
    if (decoded.role === 'user') {
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
    } else if (decoded.role === 'practitioner') {
      req.practitioner = await Practitioner.findById(decoded.id).select('-password');
      if (!req.practitioner) {
        return res.status(401).json({
          success: false,
          message: 'Practitioner not found'
        });
      }
      
      // Add practitioner type and authority to request
      req.practitionerType = req.practitioner.type;
      req.authorityLevel = req.practitioner.authorityLevel;
    }

    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error: error.message
    });
  }
};

/**
 * Authorize specific roles
 * @param  {...String} roles - Allowed roles ('user', 'practitioner', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.userRole}' is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Authorize practitioner authority levels
 * @param  {...String} authorities - Allowed authority levels ('Viewer', 'Editor', 'Approver')
 */
const authorizeAuthority = (...authorities) => {
  return (req, res, next) => {
    if (req.userRole !== 'practitioner') {
      return res.status(403).json({
        success: false,
        message: 'Only practitioners can access this route'
      });
    }

    if (!req.authorityLevel || !authorities.includes(req.authorityLevel)) {
      return res.status(403).json({
        success: false,
        message: `Authority level '${req.authorityLevel}' is not sufficient. Required: ${authorities.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * Check if practitioner is verified
 */
const requireVerified = (req, res, next) => {
  if (req.userRole !== 'practitioner') {
    return res.status(403).json({
      success: false,
      message: 'Only practitioners can access this route'
    });
  }

  if (!req.practitioner.verified) {
    return res.status(403).json({
      success: false,
      message: 'Your practitioner account is not verified yet. Please wait for admin approval.'
    });
  }

  next();
};

module.exports = {
  protect,
  authorize,
  authorizeAuthority,
  requireVerified
};
