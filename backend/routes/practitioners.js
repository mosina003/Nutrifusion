const express = require('express');
const router = express.Router();
const Practitioner = require('../models/Practitioner');
const User = require('../models/User');
const HealthProfile = require('../models/HealthProfile');
const DietPlan = require('../models/DietPlan');
const { protect, authorize, authorizeAuthority, requireVerified } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

/**
 * @route   GET /api/practitioners
 * @desc    Get all practitioners (Admin only - for verification)
 * @access  Private/Admin
 */
router.get('/', protect, async (req, res) => {
  try {
    const { verified, type } = req.query;

    const filter = {};
    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }
    if (type) {
      filter.type = type;
    }

    const practitioners = await Practitioner.find(filter).select('-password');

    res.status(200).json({
      success: true,
      count: practitioners.length,
      data: practitioners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching practitioners',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/practitioners/me
 * @desc    Get current practitioner profile
 * @access  Private/Practitioner
 */
router.get('/me', protect, authorize('practitioner'), async (req, res) => {
  try {
    const practitioner = await Practitioner.findById(req.practitioner._id).select('-password');

    if (!practitioner) {
      return res.status(404).json({
        success: false,
        message: 'Practitioner not found'
      });
    }

    res.status(200).json({
      success: true,
      data: practitioner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching practitioner profile',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/practitioners/:id
 * @desc    Get single practitioner
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const practitioner = await Practitioner.findById(req.params.id).select('-password');

    if (!practitioner) {
      return res.status(404).json({
        success: false,
        message: 'Practitioner not found'
      });
    }

    res.status(200).json({
      success: true,
      data: practitioner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching practitioner',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/practitioners/:id/verify
 * @desc    Verify practitioner (Admin only)
 * @access  Private/Admin
 */
router.put('/:id/verify', protect, auditLog('Practitioner'), async (req, res) => {
  try {
    const practitioner = await Practitioner.findById(req.params.id);

    if (!practitioner) {
      return res.status(404).json({
        success: false,
        message: 'Practitioner not found'
      });
    }

    practitioner.verified = true;
    await practitioner.save();

    res.status(200).json({
      success: true,
      message: 'Practitioner verified successfully',
      data: practitioner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying practitioner',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/practitioners/:id/authority
 * @desc    Update practitioner authority level (Admin only)
 * @access  Private/Admin
 */
router.put('/:id/authority', protect, auditLog('Practitioner'), async (req, res) => {
  try {
    const { authorityLevel } = req.body;

    if (!['Viewer', 'Editor', 'Approver'].includes(authorityLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid authority level. Must be Viewer, Editor, or Approver'
      });
    }

    const practitioner = await Practitioner.findById(req.params.id);

    if (!practitioner) {
      return res.status(404).json({
        success: false,
        message: 'Practitioner not found'
      });
    }

    practitioner.authorityLevel = authorityLevel;
    await practitioner.save();

    res.status(200).json({
      success: true,
      message: 'Authority level updated successfully',
      data: practitioner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating authority level',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/practitioners/me
 * @desc    Update practitioner profile
 * @access  Private/Practitioner
 */
router.put('/me', protect, authorize('practitioner'), auditLog('Practitioner'), async (req, res) => {
  try {
    const {
      name,
      type,
      specialization,
      licenseNumber
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (specialization) updateData.specialization = specialization;
    if (licenseNumber) {
      // Check if license number already exists for different practitioner
      const existing = await Practitioner.findOne({
        licenseNumber,
        _id: { $ne: req.practitioner._id }
      });
      
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'License number already in use'
        });
      }
      updateData.licenseNumber = licenseNumber;
    }

    const practitioner = await Practitioner.findByIdAndUpdate(
      req.practitioner._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: practitioner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/practitioners/me/users
 * @desc    Get users assigned to practitioner
 * @access  Private/Practitioner
 */
router.get('/me/users', protect, authorize('practitioner'), requireVerified, async (req, res) => {
  try {
    // Get only users assigned to this practitioner
    const users = await User.find({ assignedPractitioner: req.practitioner._id })
      .select('-password')
      .populate('chronicConditions');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/practitioners/users/:userId/profile
 * @desc    Get user health profile (Practitioner)
 * @access  Private/Practitioner
 */
router.get('/users/:userId/profile', protect, authorize('practitioner'), requireVerified, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if user is assigned to this practitioner
    const user = await User.findById(userId)
      .select('-password')
      .populate('chronicConditions');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify the user is assigned to this practitioner
    if (!user.assignedPractitioner || user.assignedPractitioner.toString() !== req.practitioner._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this user\'s profile'
      });
    }

    // Get health profiles for this user
    const healthProfiles = await HealthProfile.find({ userId })
      .sort({ recordedAt: -1 })
      .limit(5);

    // Get diet plans for this user
    const dietPlans = await DietPlan.find({ userId })
      .populate('meals.recipeId')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        user,
        healthProfiles,
        dietPlans
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/practitioners/me/health-profiles
 * @desc    Get health profiles for practitioner's users
 * @access  Private/Practitioner
 */
router.get('/me/health-profiles', protect, authorize('practitioner'), requireVerified, async (req, res) => {
  try {
    const { userId } = req.query;

    const filter = userId ? { userId } : {};
    
    const healthProfiles = await HealthProfile.find(filter)
      .populate('userId', 'name email age gender')
      .sort({ recordedAt: -1 });

    res.status(200).json({
      success: true,
      count: healthProfiles.length,
      data: healthProfiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching health profiles',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/practitioners/me/users/:userId/prakriti
 * @desc    Confirm user's Prakriti assessment
 * @access  Private/Practitioner/Editor+
 */
router.put(
  '/me/users/:userId/prakriti',
  protect,
  authorize('practitioner'),
  requireVerified,
  authorizeAuthority('Editor', 'Approver'),
  auditLog('User'),
  async (req, res) => {
    try {
      const { vata, pitta, kapha } = req.body;

      // Validation
      if (vata === undefined || pitta === undefined || kapha === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Please provide vata, pitta, and kapha values'
        });
      }

      const user = await User.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update Prakriti
      user.prakriti = {
        status: 'Confirmed',
        vata,
        pitta,
        kapha,
        source: 'Practitioner',
        assessedAt: new Date()
      };

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Prakriti confirmed successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error confirming Prakriti',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/practitioners/me/diet-plans
 * @desc    Get diet plans created by practitioner
 * @access  Private/Practitioner
 */
router.get('/me/diet-plans', protect, authorize('practitioner'), requireVerified, async (req, res) => {
  try {
    const { userId, status } = req.query;

    const filter = { createdBy: req.practitioner._id };
    
    if (userId) filter.userId = userId;
    if (status) filter.status = status;

    const dietPlans = await DietPlan.find(filter)
      .populate('userId', 'name email')
      .populate('meals.recipeId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dietPlans.length,
      data: dietPlans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching diet plans',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/practitioners/:id
 * @desc    Update practitioner profile
 * @access  Private/Practitioner (Own profile only)
 */
router.put('/:id', protect, authorize('practitioner'), auditLog('Practitioner'), async (req, res) => {
  try {
    // Ensure practitioner can only update their own profile
    if (req.practitioner._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const { name, specialization } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (specialization) updateData.specialization = specialization;

    const practitioner = await Practitioner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: practitioner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

module.exports = router;
