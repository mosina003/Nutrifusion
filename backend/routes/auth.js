const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Practitioner = require('../models/Practitioner');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register/user
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register/user', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword
    });

    // Generate token
    const token = generateToken({
      id: user._id,
      role: 'user',
      email: user.email
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please complete your profile.',
      data: {
        _id: user._id,
        email: user.email,
        role: 'user'
      },
      token
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/register/practitioner
 * @desc    Register a new practitioner
 * @access  Public
 */
router.post('/register/practitioner', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if practitioner already exists
    const existingPractitioner = await Practitioner.findOne({ email: email.toLowerCase() });

    if (existingPractitioner) {
      return res.status(400).json({
        success: false,
        message: 'Practitioner with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create practitioner (unverified by default)
    const practitioner = await Practitioner.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      authorityLevel: 'Viewer', // Default authority
      verified: false // Admin must verify
    });

    // Generate token
    const token = generateToken({
      id: practitioner._id,
      role: 'practitioner',
      email: practitioner.email,
      type: practitioner.type,
      authorityLevel: practitioner.authorityLevel
    });

    res.status(201).json({
      success: true,
      message: 'Practitioner registered successfully. Please complete your profile.',
      data: {
        _id: practitioner._id,
        email: practitioner.email,
        verified: practitioner.verified,
        authorityLevel: practitioner.authorityLevel,
        role: 'practitioner'
      },
      token
    });
  } catch (error) {
    console.error('Practitioner registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering practitioner',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/login/user
 * @desc    Login user
 * @access  Public
 */
router.post('/login/user', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password hasCompletedAssessment preferredMedicalFramework');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken({
      id: user._id,
      role: 'user',
      email: user.email
    });

    console.log('✅ User login - Assessment status:', {
      userId: user._id,
      email: user.email,
      hasCompletedAssessment: user.hasCompletedAssessment,
      preferredMedicalFramework: user.preferredMedicalFramework
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: 'user',
        hasCompletedAssessment: user.hasCompletedAssessment || false,
        preferredMedicalFramework: user.preferredMedicalFramework
      },
      token
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/login/practitioner
 * @desc    Login practitioner
 * @access  Public
 */
router.post('/login/practitioner', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find practitioner and include password
    const practitioner = await Practitioner.findOne({ email: email.toLowerCase() }).select('+password');

    if (!practitioner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, practitioner.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken({
      id: practitioner._id,
      role: 'practitioner',
      email: practitioner.email,
      type: practitioner.type,
      authorityLevel: practitioner.authorityLevel
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: practitioner._id,
        name: practitioner.name,
        email: practitioner.email,
        type: practitioner.type,
        verified: practitioner.verified,
        authorityLevel: practitioner.authorityLevel,
        role: 'practitioner'
      },
      token
    });
  } catch (error) {
    console.error('Practitioner login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Unified login for both user and practitioner
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Try to find user first
    let user = await User.findOne({ email: email.toLowerCase() })
      .select('+password hasCompletedAssessment preferredMedicalFramework');
    
    if (user) {
      // Check password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate token
      const token = generateToken({
        id: user._id,
        role: 'user',
        email: user.email
      });

      console.log('✅ User login (unified) - Assessment status:', {
        userId: user._id,
        email: user.email,
        hasCompletedAssessment: user.hasCompletedAssessment,
        preferredMedicalFramework: user.preferredMedicalFramework
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: 'user',
          hasCompletedAssessment: user.hasCompletedAssessment || false,
          preferredMedicalFramework: user.preferredMedicalFramework
        },
        token
      });
    }

    // If not a user, try practitioner
    let practitioner = await Practitioner.findOne({ email: email.toLowerCase() }).select('+password');

    if (practitioner) {
      // Check password
      const isPasswordValid = await comparePassword(password, practitioner.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate token
      const token = generateToken({
        id: practitioner._id,
        role: 'practitioner',
        email: practitioner.email,
        type: practitioner.type,
        authorityLevel: practitioner.authorityLevel
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          _id: practitioner._id,
          name: practitioner.name,
          email: practitioner.email,
          type: practitioner.type,
          verified: practitioner.verified,
          authorityLevel: practitioner.authorityLevel,
          role: 'practitioner'
        },
        token
      });
    }

    // Neither user nor practitioner found
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user/practitioner
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    if (req.userRole === 'user') {
      res.status(200).json({
        success: true,
        data: {
          ...req.user.toObject(),
          role: 'user'
        }
      });
    } else if (req.userRole === 'practitioner') {
      res.status(200).json({
        success: true,
        data: {
          ...req.practitioner.toObject(),
          role: 'practitioner'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
});

module.exports = router;
