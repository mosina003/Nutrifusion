const express = require('express');
const router = express.Router();
const HealthProfile = require('../models/HealthProfile');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

/**
 * @route   POST /api/health-profiles
 * @desc    Create health profile (User or Practitioner)
 * @access  Private
 */
router.post('/', protect, auditLog('HealthProfile'), async (req, res) => {
  try {
    const {
      userId,
      bmi,
      chronicConditions,
      lifestyle,
      digestionIndicators
    } = req.body;

    // If user is creating their own profile
    const targetUserId = req.userRole === 'user' ? req.user._id : userId;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user exists
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate BMI if not provided
    let calculatedBmi = bmi;
    if (!calculatedBmi && user.height && user.weight) {
      const heightInMeters = user.height / 100;
      calculatedBmi = (user.weight / (heightInMeters * heightInMeters)).toFixed(2);
    }

    const healthProfile = await HealthProfile.create({
      userId: targetUserId,
      bmi: calculatedBmi,
      chronicConditions: chronicConditions || [],
      lifestyle: lifestyle || {},
      digestionIndicators: digestionIndicators || {},
      recordedAt: new Date()
    });

    await healthProfile.populate('userId', 'name email');
    await healthProfile.populate('chronicConditions');

    res.status(201).json({
      success: true,
      message: 'Health profile created successfully',
      data: healthProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating health profile',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/health-profiles/me
 * @desc    Get current user's health profiles
 * @access  Private/User
 */
router.get('/me', protect, authorize('user'), async (req, res) => {
  try {
    const healthProfiles = await HealthProfile.find({ userId: req.user._id })
      .populate('chronicConditions')
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
 * @route   GET /api/health-profiles/me/latest
 * @desc    Get current user's latest health profile
 * @access  Private/User
 */
router.get('/me/latest', protect, authorize('user'), async (req, res) => {
  try {
    const healthProfile = await HealthProfile.findOne({ userId: req.user._id })
      .populate('chronicConditions')
      .sort({ recordedAt: -1 });

    if (!healthProfile) {
      return res.status(404).json({
        success: false,
        message: 'No health profile found. Please create one.'
      });
    }

    res.status(200).json({
      success: true,
      data: healthProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching health profile',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/health-profiles/user/:userId
 * @desc    Get health profiles for specific user (Practitioner access)
 * @access  Private/Practitioner
 */
router.get('/user/:userId', protect, authorize('practitioner'), async (req, res) => {
  try {
    const healthProfiles = await HealthProfile.find({ userId: req.params.userId })
      .populate('userId', 'name email age gender')
      .populate('chronicConditions')
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
 * @route   GET /api/health-profiles/:id
 * @desc    Get single health profile
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const healthProfile = await HealthProfile.findById(req.params.id)
      .populate('userId', 'name email age gender')
      .populate('chronicConditions');

    if (!healthProfile) {
      return res.status(404).json({
        success: false,
        message: 'Health profile not found'
      });
    }

    // Check authorization
    if (req.userRole === 'user' && healthProfile.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this health profile'
      });
    }

    res.status(200).json({
      success: true,
      data: healthProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching health profile',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/health-profiles/:id
 * @desc    Update health profile
 * @access  Private
 */
router.put('/:id', protect, auditLog('HealthProfile'), async (req, res) => {
  try {
    const healthProfile = await HealthProfile.findById(req.params.id);

    if (!healthProfile) {
      return res.status(404).json({
        success: false,
        message: 'Health profile not found'
      });
    }

    // Check authorization
    if (req.userRole === 'user' && healthProfile.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this health profile'
      });
    }

    const {
      bmi,
      chronicConditions,
      lifestyle,
      digestionIndicators
    } = req.body;

    if (bmi !== undefined) healthProfile.bmi = bmi;
    if (chronicConditions) healthProfile.chronicConditions = chronicConditions;
    if (lifestyle) healthProfile.lifestyle = { ...healthProfile.lifestyle, ...lifestyle };
    if (digestionIndicators) healthProfile.digestionIndicators = { ...healthProfile.digestionIndicators, ...digestionIndicators };

    await healthProfile.save();
    await healthProfile.populate('chronicConditions');

    res.status(200).json({
      success: true,
      message: 'Health profile updated successfully',
      data: healthProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating health profile',
      error: error.message
    });
  }
});

module.exports = router;
