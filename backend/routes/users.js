const express = require('express');
const router = express.Router();
const User = require('../models/User');
const HealthProfile = require('../models/HealthProfile');
const Assessment = require('../models/Assessment');
const UserActivity = require('../models/UserActivity');
const DietPlan = require('../models/DietPlan');
const MedicalCondition = require('../models/MedicalCondition');
const { protect, authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

/**
 * @route   GET /api/users/profile/complete
 * @desc    Get comprehensive user profile with all health data, analytics, and history
 * @access  Private/User
 */
router.get('/profile/complete', protect, authorize('user'), async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get user basic data
    const user = await User.findById(userId)
      .populate('chronicConditions')
      .populate('assignedPractitioner', 'name email specialization')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 2. Get latest health profile
    const healthProfile = await HealthProfile.findOne({ userId })
      .sort({ recordedAt: -1 })
      .lean();

    // 3. Get latest assessment (for framework-specific data)
    const assessment = await Assessment.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // 4. Get user activity stats (last 30 days)
    const userStats = await UserActivity.getUserStats(userId, 30);
    
    // 5. Get current streak
    const currentStreak = await UserActivity.calculateStreak(userId);

    // 6. Get diet plan history (includes both practitioner and auto-generated plans)
    const dietPlans = await DietPlan.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('planName status createdAt nutrientSnapshot planType createdByModel')
      .lean();

    // 7. Calculate anthropometric metrics
    const height = user.height || 0;
    const weight = user.weight || 0;
    const age = user.age || 25;
    const gender = user.gender || 'Male';

    // BMI = weight(kg) / height(m)^2
    const heightInMeters = height / 100;
    const bmi = height > 0 && weight > 0 
      ? Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10 
      : 0;

    // BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation
    let bmr = 0;
    if (weight > 0 && height > 0 && age > 0) {
      if (gender === 'Male') {
        bmr = Math.round(10 * weight + 6.25 * height - 5 * age + 5);
      } else {
        bmr = Math.round(10 * weight + 6.25 * height - 5 * age - 161);
      }
    }

    // TDEE (Total Daily Energy Expenditure) = BMR × Activity Factor
    const activityLevel = healthProfile?.lifestyle?.activityLevel || 'Moderate';
    const activityMultipliers = {
      'Sedentary': 1.2,
      'Moderate': 1.55,
      'Active': 1.725
    };
    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

    // 8. Calculate risk level based on BMI, chronic conditions, and lifestyle
    let riskLevel = 'Low';
    let riskScore = 0;

    if (bmi > 30 || bmi < 18.5) riskScore += 2;
    else if (bmi > 25 || bmi < 20) riskScore += 1;

    if (user.chronicConditions && user.chronicConditions.length > 0) {
      riskScore += user.chronicConditions.length;
    }

    if (healthProfile?.lifestyle?.stressLevel === 'High') riskScore += 1;
    if (healthProfile?.digestionIndicators?.acidReflux) riskScore += 1;

    if (riskScore >= 4) riskLevel = 'High';
    else if (riskScore >= 2) riskLevel = 'Moderate';

    // 9. Calculate profile completion percentage
    let completionScore = 0;
    const totalFields = 20;

    if (user.name) completionScore++;
    if (user.age) completionScore++;
    if (user.gender) completionScore++;
    if (user.height) completionScore++;
    if (user.weight) completionScore++;
    if (user.dietaryPreference) completionScore++;
    if (user.preferredMedicalFramework) completionScore++;
    if (user.hasCompletedAssessment) completionScore++;
    if (healthProfile) completionScore += 2;
    if (healthProfile?.lifestyle?.sleepHours) completionScore++;
    if (healthProfile?.lifestyle?.stressLevel) completionScore++;
    if (healthProfile?.lifestyle?.activityLevel) completionScore++;
    if (healthProfile?.digestionIndicators) completionScore += 2;
    if (assessment) completionScore += 3;
    if (user.chronicConditions && user.chronicConditions.length > 0) completionScore++;
    if (user.allergies && user.allergies.length > 0) completionScore++;

    const profileCompletion = Math.round((completionScore / totalFields) * 100);

    // 10. Extract framework-specific intelligence
    const healthIntelligence = {
      framework: user.preferredMedicalFramework || 'modern',
      modern: null,
      ayurveda: null,
      unani: null,
      tcm: null
    };

    if (assessment) {
      // Extract data based on assessment framework
      const framework = assessment.framework;
      const scores = assessment.scores;
      const profile = assessment.healthProfile;

      // Modern framework data
      if (framework === 'modern') {
        healthIntelligence.modern = {
          metabolicRiskLevel: riskLevel,
          bmi: bmi,
          bmr: bmr,
          tdee: tdee,
          digestiveScore: healthProfile?.digestionIndicators ? 
            (healthProfile.digestionIndicators.bowelRegularity === 'Regular' && 
             !healthProfile.digestionIndicators.bloating && 
             !healthProfile.digestionIndicators.acidReflux ? 'Good' : 'Fair') : 'Unknown',
          lifestyleLoadScore: healthProfile?.lifestyle?.stressLevel || 'Unknown',
          macroSplit: {
            protein: 30,
            carbs: 40,
            fat: 30
          }
        };
      }

      // Ayurveda framework data
      if (framework === 'ayurveda' && scores) {
        const prakriti = scores.prakriti;
        const vikriti = scores.vikriti;
        const agni = scores.agni;

        healthIntelligence.ayurveda = {
          primaryDosha: prakriti?.primary || 'Unknown',
          secondaryDosha: prakriti?.secondary || 'Unknown',
          doshaType: prakriti?.dosha_type || 'Unknown',
          percentages: prakriti?.percentages || { vata: 0, pitta: 0, kapha: 0 },
          agniType: agni?.type || 'Unknown',
          agniName: agni?.name || 'Unknown',
          imbalanceSeverity: vikriti?.is_balanced ? 'Balanced' : 'Imbalanced',
          currentDosha: vikriti?.dominant || 'Unknown'
        };
      }

      // Unani framework data
      if (framework === 'unani' && scores) {
        healthIntelligence.unani = {
          mizaj: scores.mizaj?.type || 'Unknown',
          heat: scores.mizaj?.heat || 'Unknown',
          moisture: scores.mizaj?.moisture || 'Unknown',
          dominantHumor: scores.dominant_humor || 'Unknown',
          digestiveStrength: scores.digestive_strength || 'Unknown'
        };
      }

      // TCM framework data
      if (framework === 'tcm' && scores) {
        healthIntelligence.tcm = {
          primaryPattern: scores.primary_pattern || 'Unknown',
          coldHeatPattern: scores.cold_heat || 'Unknown',
          organImbalance: scores.organ_imbalance || [],
          yangDeficiency: scores.yang_deficiency || false,
          yinDeficiency: scores.yin_deficiency || false
        };
      }
    }

    // 11. Dietary restrictions and preferences
    const dietaryInfo = {
      preferences: [user.dietaryPreference],
      restrictions: user.allergies || [],
      chronicConditions: user.chronicConditions.map(c => c.name || c.toString())
    };

    // 12. Lifestyle indicators
    const lifestyleIndicators = {
      sleepDuration: healthProfile?.lifestyle?.sleepHours || 0,
      sleepQuality: healthProfile?.lifestyle?.sleepHours >= 7 ? 'Good' : 
                    healthProfile?.lifestyle?.sleepHours >= 5 ? 'Fair' : 'Poor',
      stressLevel: healthProfile?.lifestyle?.stressLevel || 'Unknown',
      hydrationLevel: 'Unknown', // TODO: Add to health profile
      activityLevel: healthProfile?.lifestyle?.activityLevel || 'Unknown',
      appetite: healthProfile?.digestionIndicators?.appetite || 'Unknown',
      bowelRegularity: healthProfile?.digestionIndicators?.bowelRegularity || 'Unknown'
    };

    // 13. System history and analytics
    const analytics = {
      lastDietGenerated: dietPlans.length > 0 ? dietPlans[0].createdAt : null,
      complianceScore: userStats.adherence || 0,
      currentStreak: currentStreak,
      totalDaysTracked: userStats.totalDaysTracked || 0,
      dietPlansCount: dietPlans.length,
      assessmentDate: assessment?.createdAt || null,
      frameworkComparison: {
        ayurveda: assessment?.ayurveda_system?.prakriti?.primary || null,
        modern: riskLevel,
        unani: assessment?.unani_system?.mizaj?.type || null,
        tcm: assessment?.tcm_system?.primary_pattern || null
      }
    };

    // 14. Build comprehensive response
    const completeProfile = {
      // Section A: Identity & Overview
      identity: {
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        profilePhoto: null, // TODO: Add avatar support
        primaryGoal: 'Health Optimization', // TODO: Add to user model
        activeFramework: user.preferredMedicalFramework || 'modern',
        profileCompletion: profileCompletion
      },

      // KPI Cards
      kpi: {
        bmi: bmi,
        calorieTarget: tdee,
        riskLevel: riskLevel
      },

      // Section B: Health Intelligence Summary
      healthIntelligence: healthIntelligence,

      // Section C: Anthropometric & Clinical Metrics
      clinicalMetrics: {
        anthropometric: {
          height: height,
          weight: weight,
          bmi: bmi,
          bmr: bmr,
          tdee: tdee,
          waist: healthProfile?.anthropometric?.waist || null,
        },
        metabolic: {
          bloodPressure: healthProfile?.metabolicMarkers?.bloodPressure || null,
          bloodSugar: healthProfile?.metabolicMarkers?.bloodSugar || null,
          cholesterol: healthProfile?.metabolicMarkers?.cholesterol || null
        }
      },

      // Section D: Lifestyle & Behavioral Indicators
      lifestyleIndicators: lifestyleIndicators,

      // Section E: Dietary Restrictions & Preferences
      dietaryInfo: dietaryInfo,

      // Section F: System History & Analytics
      analytics: analytics,

      // Additional metadata
      lastUpdated: user.updatedAt,
      hasCompletedAssessment: user.hasCompletedAssessment,
      assignedPractitioner: user.assignedPractitioner
    };

    res.status(200).json({
      success: true,
      data: completeProfile
    });

  } catch (error) {
    console.error('Error fetching complete profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

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
    
    // Convert chronic condition names to ObjectIds (find or create)
    if (chronicConditions && Array.isArray(chronicConditions)) {
      const conditionIds = [];
      for (const conditionName of chronicConditions) {
        if (typeof conditionName === 'string' && conditionName.trim()) {
          // Try to find existing condition
          let condition = await MedicalCondition.findOne({ 
            name: { $regex: new RegExp(`^${conditionName.trim()}$`, 'i') } 
          });
          
          // If not found, create a new basic medical condition
          if (!condition) {
            condition = await MedicalCondition.create({
              name: conditionName.trim(),
              category: 'Other',
              description: `User-reported condition: ${conditionName.trim()}`
            });
          }
          
          conditionIds.push(condition._id);
        }
      }
      updateData.chronicConditions = conditionIds;
    }
    
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
