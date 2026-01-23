const express = require('express');
const router = express.Router();
const User = require('../models/User');
const HealthProfile = require('../models/HealthProfile');
const { protect, authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private/User
 */
router.get('/me', protect, authorize('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('chronicConditions')
      .select('-password');

    res.status(200).json({
      success: true,
      data: user
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
 * @route   PUT /api/users/me
 * @desc    Update user profile
 * @access  Private/User
 */
router.put('/me', protect, authorize('user'), auditLog('User'), async (req, res) => {
  try {
    const {
      name,
      age,
      height,
      weight,
      dietaryPreference,
      allergies,
      chronicConditions,
      medicinePreference,
      consent
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (age) updateData.age = age;
    if (height) updateData.height = height;
    if (weight) updateData.weight = weight;
    if (dietaryPreference) updateData.dietaryPreference = dietaryPreference;
    if (allergies) updateData.allergies = allergies;
    if (chronicConditions) updateData.chronicConditions = chronicConditions;
    if (medicinePreference) updateData.medicinePreference = medicinePreference;
    if (consent) updateData.consent = consent;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
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
 * @route   PUT /api/users/me/prakriti
 * @desc    Update Prakriti assessment (self-assessment)
 * @access  Private/User
 */
router.put('/me/prakriti', protect, authorize('user'), auditLog('User'), async (req, res) => {
  try {
    const { vata, pitta, kapha, source } = req.body;

    if (vata === undefined || pitta === undefined || kapha === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vata, pitta, and kapha values'
      });
    }

    // Validate percentages add up to 100
    const total = vata + pitta + kapha;
    if (total !== 100) {
      return res.status(400).json({
        success: false,
        message: `Prakriti percentages must add up to 100. Current total: ${total}`
      });
    }

    const user = await User.findById(req.user._id);

    user.prakriti = {
      status: 'Estimated',
      vata,
      pitta,
      kapha,
      source: source || 'Questionnaire',
      assessedAt: new Date()
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Prakriti assessment updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating Prakriti assessment',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/users/me/mizaj
 * @desc    Update Mizaj (Unani constitution)
 * @access  Private/User
 */
router.put('/me/mizaj', protect, authorize('user'), auditLog('User'), async (req, res) => {
  try {
    const { heat, moisture } = req.body;

    if (!heat || !moisture) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both heat and moisture values'
      });
    }

    // Validate enum values
    const validHeat = ['Hot', 'Cold', 'Balanced'];
    const validMoisture = ['Dry', 'Moist', 'Balanced'];

    if (!validHeat.includes(heat)) {
      return res.status(400).json({
        success: false,
        message: `Invalid heat value. Must be one of: ${validHeat.join(', ')}`
      });
    }

    if (!validMoisture.includes(moisture)) {
      return res.status(400).json({
        success: false,
        message: `Invalid moisture value. Must be one of: ${validMoisture.join(', ')}`
      });
    }

    const user = await User.findById(req.user._id);

    user.mizaj = {
      heat,
      moisture
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Mizaj updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating Mizaj',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/practitioners/verified
 * @desc    Get list of verified practitioners for user to choose
 * @access  Private/User
 */
router.get('/practitioners/verified', protect, authorize('user'), async (req, res) => {
  try {
    const Practitioner = require('../models/Practitioner');
    
    const practitioners = await Practitioner.find({ 
      verified: true,
      role: { $ne: 'admin' } // Exclude admin accounts
    })
      .select('name email type specialization')
      .sort('name');

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
 * @route   PUT /api/users/me/practitioner
 * @desc    Assign/change practitioner
 * @access  Private/User
 */
router.put('/me/practitioner', protect, authorize('user'), auditLog('User'), async (req, res) => {
  try {
    const { practitionerId } = req.body;

    if (!practitionerId) {
      return res.status(400).json({
        success: false,
        message: 'Practitioner ID is required'
      });
    }

    const Practitioner = require('../models/Practitioner');
    
    // Verify practitioner exists and is verified
    const practitioner = await Practitioner.findById(practitionerId);
    
    if (!practitioner) {
      return res.status(404).json({
        success: false,
        message: 'Practitioner not found'
      });
    }

    if (!practitioner.verified) {
      return res.status(400).json({
        success: false,
        message: 'Practitioner is not verified. Please choose a verified practitioner.'
      });
    }

    const user = await User.findById(req.user._id);
    user.assignedPractitioner = practitionerId;
    await user.save();

    const updatedUser = await User.findById(req.user._id)
      .populate('assignedPractitioner', 'name email type specialization')
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'Practitioner assigned successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning practitioner',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/users/me/practitioner
 * @desc    Remove assigned practitioner
 * @access  Private/User
 */
router.delete('/me/practitioner', protect, authorize('user'), auditLog('User'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.assignedPractitioner) {
      return res.status(400).json({
        success: false,
        message: 'No practitioner assigned'
      });
    }

    user.assignedPractitioner = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Practitioner removed successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing practitioner',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (Practitioner access)
 * @access  Private/Practitioner
 */
router.get('/:id', protect, authorize('practitioner'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('chronicConditions')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

module.exports = router;
