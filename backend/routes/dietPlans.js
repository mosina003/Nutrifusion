const express = require('express');
const router = express.Router();
const DietPlan = require('../models/DietPlan');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Food = require('../models/Food');
const { protect, authorize, authorizeAuthority, requireVerified } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');
const unaniDietPlanService = require('../services/intelligence/diet/unaniDietPlanService');
const ayurvedaDietPlanService = require('../services/intelligence/diet/ayurvedaDietPlanService');
const tcmDietPlanService = require('../services/intelligence/diet/tcmDietPlanService');

/**
 * Calculate nutrient totals from meals
 */
const calculateNutrientSnapshot = async (meals) => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  for (const meal of meals) {
    const recipe = await Recipe.findById(meal.recipeId);
    if (recipe && recipe.nutrientSnapshot) {
      const portion = meal.portion || 1;
      totalCalories += (recipe.nutrientSnapshot.calories || 0) * portion;
      totalProtein += (recipe.nutrientSnapshot.protein || 0) * portion;
      totalCarbs += (recipe.nutrientSnapshot.carbs || 0) * portion;
      totalFat += (recipe.nutrientSnapshot.fat || 0) * portion;
      totalFiber += (recipe.nutrientSnapshot.fiber || 0) * portion;
    }
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10
  };
};

/**
 * Calculate Dosha balance from meals
 */
const calculateDoshaBalance = async (meals) => {
  let vataScore = 0;
  let pittaScore = 0;
  let kaphaScore = 0;
  let totalItems = 0;

  for (const meal of meals) {
    const recipe = await Recipe.findById(meal.recipeId).populate('ingredients.foodId');
    if (recipe && recipe.ingredients) {
      for (const ingredient of recipe.ingredients) {
        if (ingredient.foodId && ingredient.foodId.ayurveda && ingredient.foodId.ayurveda.doshaEffect) {
          const effect = ingredient.foodId.ayurveda.doshaEffect;
          
          // Simple scoring: Increase = +1, Decrease = -1, Neutral = 0
          vataScore += effect.vata === 'Increase' ? 1 : effect.vata === 'Decrease' ? -1 : 0;
          pittaScore += effect.pitta === 'Increase' ? 1 : effect.pitta === 'Decrease' ? -1 : 0;
          kaphaScore += effect.kapha === 'Increase' ? 1 : effect.kapha === 'Decrease' ? -1 : 0;
          totalItems++;
        }
      }
    }
  }

  if (totalItems === 0) return null;

  return {
    vata: Math.round((vataScore / totalItems) * 100) / 100,
    pitta: Math.round((pittaScore / totalItems) * 100) / 100,
    kapha: Math.round((kaphaScore / totalItems) * 100) / 100
  };
};

/**
 * @route   POST /api/diet-plans
 * @desc    Create diet plan (Practitioner: Editor/Approver)
 * @access  Private/Practitioner
 */
router.post(
  '/',
  protect,
  authorize('practitioner'),
  requireVerified,
  authorizeAuthority('Editor', 'Approver'),
  auditLog('DietPlan'),
  async (req, res) => {
    try {
      const {
        userId,
        planName,
        meals,
        rulesApplied,
        validFrom,
        validTo,
        status
      } = req.body;

      // Validation
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide userId'
        });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Validate all recipes exist (if meals provided)
      if (meals && meals.length > 0) {
        for (const meal of meals) {
          const recipe = await Recipe.findById(meal.recipeId);
          if (!recipe) {
            return res.status(404).json({
              success: false,
              message: `Recipe not found: ${meal.recipeId}`
            });
          }
        }
      }

      // Calculate nutrients (only if meals exist)
      const nutrientSnapshot = meals && meals.length > 0 
        ? await calculateNutrientSnapshot(meals) 
        : null;

      // Calculate Dosha balance (only if meals exist)
      const doshaBalance = meals && meals.length > 0 
        ? await calculateDoshaBalance(meals) 
        : null;

      // Create diet plan
      const dietPlan = await DietPlan.create({
        userId,
        planName: planName || 'My Diet Plan',
        meals: meals || [],
        rulesApplied: rulesApplied || [],
        nutrientSnapshot,
        doshaBalance,
        status: status || 'Draft',
        createdBy: req.practitioner._id,
        createdByModel: 'Practitioner',
        validFrom: validFrom || new Date(),
        validTo: validTo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
      });

      await dietPlan.populate('userId', 'name email');
      if (meals && meals.length > 0) {
        await dietPlan.populate('meals.recipeId');
      }

      res.status(201).json({
        success: true,
        message: 'Diet plan created successfully',
        data: dietPlan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating diet plan',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/diet-plans
 * @desc    Get all diet plans (filtered by user)
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { userId, status } = req.query;

    let filter = {};

    // If user, only show their own plans
    if (req.userRole === 'user') {
      filter.userId = req.user._id;
    } else if (userId) {
      filter.userId = userId;
    }

    if (status) {
      filter.status = status;
    }

    const dietPlans = await DietPlan.find(filter)
      .populate('userId', 'name email')
      .populate('meals.recipeId')
      .populate('createdBy')
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
 * @route   GET /api/diet-plans/me
 * @desc    Get my diet plans (User) - Only Active and Archived
 * @access  Private/User
 */
router.get('/me', protect, authorize('user'), async (req, res) => {
  try {
    const dietPlans = await DietPlan.find({ 
      userId: req.user._id,
      status: { $in: ['Active', 'Archived'] } // Hide Draft plans from users
    })
      .populate('meals.recipeId')
      .populate('createdBy', 'name email')
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
 * @route   GET /api/diet-plans/me/active
 * @desc    Get my active diet plan (User)
 * @access  Private/User
 */
router.get('/me/active', protect, authorize('user'), async (req, res) => {
  try {
    const dietPlan = await DietPlan.findOne({ 
      userId: req.user._id,
      status: 'Active'
    })
      .populate('meals.recipeId')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'No active diet plan found'
      });
    }

    res.status(200).json({
      success: true,
      data: dietPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active diet plan',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/diet-plans/:id
 * @desc    Get single diet plan
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id)
      .populate('userId', 'name email prakriti')
      .populate('meals.recipeId')
      .populate('createdBy')
      .populate('approvedBy');

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }

    // Authorization check
    if (req.userRole === 'user' && dietPlan.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this diet plan'
      });
    }

    res.status(200).json({
      success: true,
      data: dietPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching diet plan',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/diet-plans/:id
 * @desc    Update diet plan (Practitioner: Editor/Approver)
 * @access  Private/Practitioner
 */
router.put(
  '/:id',
  protect,
  authorize('practitioner'),
  requireVerified,
  authorizeAuthority('Editor', 'Approver'),
  auditLog('DietPlan'),
  async (req, res) => {
    try {
      const dietPlan = await DietPlan.findById(req.params.id);

      if (!dietPlan) {
        return res.status(404).json({
          success: false,
          message: 'Diet plan not found'
        });
      }

      const {
        planName,
        meals,
        rulesApplied,
        validFrom,
        validTo,
        status
      } = req.body;

      // Update fields
      if (planName) dietPlan.planName = planName;
      if (meals) {
        dietPlan.meals = meals;
        // Recalculate nutrients
        dietPlan.nutrientSnapshot = await calculateNutrientSnapshot(meals);
        dietPlan.doshaBalance = await calculateDoshaBalance(meals);
      }
      if (rulesApplied) dietPlan.rulesApplied = rulesApplied;
      if (validFrom) dietPlan.validFrom = validFrom;
      if (validTo) dietPlan.validTo = validTo;
      if (status) dietPlan.status = status;

      await dietPlan.save();
      await dietPlan.populate('userId', 'name email');
      await dietPlan.populate('meals.recipeId');

      res.status(200).json({
        success: true,
        message: 'Diet plan updated successfully',
        data: dietPlan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating diet plan',
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/diet-plans/:id/approve
 * @desc    Approve diet plan (Practitioner: Approver only)
 * @access  Private/Practitioner/Approver
 */
router.put(
  '/:id/approve',
  protect,
  authorize('practitioner'),
  requireVerified,
  authorizeAuthority('Approver'),
  auditLog('DietPlan'),
  async (req, res) => {
    try {
      const dietPlan = await DietPlan.findById(req.params.id);

      if (!dietPlan) {
        return res.status(404).json({
          success: false,
          message: 'Diet plan not found'
        });
      }

      dietPlan.status = 'Active';
      dietPlan.approvedBy = req.practitioner._id;
      dietPlan.approvedAt = new Date();

      await dietPlan.save();
      await dietPlan.populate('userId', 'name email');
      await dietPlan.populate('meals.recipeId');
      await dietPlan.populate('approvedBy');

      res.status(200).json({
        success: true,
        message: 'Diet plan approved successfully',
        data: dietPlan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error approving diet plan',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/diet-plans/:id
 * @desc    Archive diet plan
 * @access  Private/Practitioner
 */
router.delete(
  '/:id',
  protect,
  authorize('practitioner'),
  requireVerified,
  authorizeAuthority('Editor', 'Approver'),
  auditLog('DietPlan'),
  async (req, res) => {
    try {
      const dietPlan = await DietPlan.findById(req.params.id);

      if (!dietPlan) {
        return res.status(404).json({
          success: false,
          message: 'Diet plan not found'
        });
      }

      dietPlan.status = 'Archived';
      await dietPlan.save();

      res.status(200).json({
        success: true,
        message: 'Diet plan archived successfully',
        data: dietPlan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error archiving diet plan',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/diet-plans/user/:userId/active
 * @desc    Get active diet plan for user
 * @access  Private
 */
router.get('/user/:userId/active', protect, async (req, res) => {
  try {
    const dietPlan = await DietPlan.findOne({
      userId: req.params.userId,
      status: 'Active',
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() }
    })
      .populate('userId', 'name email prakriti')
      .populate('meals.recipeId')
      .populate('createdBy')
      .populate('approvedBy')
      .sort({ createdAt: -1 });

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'No active diet plan found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: dietPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active diet plan',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/diet-plans/unani/generate
 * @desc    Generate comprehensive Unani diet plan based on assessment results
 * @access  Private/Practitioner
 */
router.post(
  '/unani/generate',
  protect,
  authorize('practitioner'),
  requireVerified,
  authorizeAuthority('Editor', 'Approver'),
  auditLog('DietPlan'),
  async (req, res) => {
    try {
      const { assessmentResult, userId, preferences } = req.body;

      // Validation
      if (!assessmentResult || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide assessmentResult and userId'
        });
      }

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate Unani diet plan
      const dietPlanData = await unaniDietPlanService.generateDietPlan(
        assessmentResult,
        preferences
      );

      // Save to database
      const dietPlan = await DietPlan.create({
        userId,
        planName: `Unani Diet Plan - ${assessmentResult.primary_mizaj || 'Balanced'}`,
        planType: 'unani',
        meals: dietPlanData.weeklyPlan || [],
        rulesApplied: [
          {
            framework: 'unani',
            details: {
              primary_mizaj: assessmentResult.primary_mizaj,
              dominant_humor: assessmentResult.dominant_humor,
              severity: assessmentResult.severity,
              digestive_strength: assessmentResult.digestive_strength,
              reasoning: dietPlanData.reasoning
            }
          }
        ],
        status: 'Draft',
        createdBy: req.practitioner._id,
        createdByModel: 'Practitioner',
        validFrom: new Date(),
        validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      await dietPlan.populate('userId', 'name email');

      res.status(201).json({
        success: true,
        message: 'Unani diet plan generated successfully',
        data: {
          dietPlan,
          weeklyPlan: dietPlanData.weeklyPlan,
          reasoning: dietPlanData.reasoning,
          topRecommendations: dietPlanData.topRecommendations,
          avoidFoods: dietPlanData.avoidFoods
        }
      });
    } catch (error) {
      console.error('Unani diet plan generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating Unani diet plan',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/diet-plans/unani/recommendations
 * @desc    Get scored Unani food recommendations
 * @access  Private/Practitioner
 */
router.post(
  '/unani/recommendations',
  protect,
  authorize('practitioner'),
  requireVerified,
  async (req, res) => {
    try {
      const { assessmentResult, limit } = req.body;

      // Validation
      if (!assessmentResult) {
        return res.status(400).json({
          success: false,
          message: 'Please provide assessmentResult'
        });
      }

      // Get food recommendations
      const recommendations = await unaniDietPlanService.getFoodRecommendations(
        assessmentResult,
        limit || 50
      );

      res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Unani recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching Unani recommendations',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/diet-plans/unani/score-food
 * @desc    Score a single food item for Unani compatibility
 * @access  Private/Practitioner
 */
router.post(
  '/unani/score-food',
  protect,
  authorize('practitioner'),
  requireVerified,
  async (req, res) => {
    try {
      const { assessmentResult, foodId } = req.body;

      // Validation
      if (!assessmentResult || !foodId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide assessmentResult and foodId'
        });
      }

      // Get food
      const food = await Food.findById(foodId);
      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Food not found'
        });
      }

      // Score the food
      const scoreData = await unaniDietPlanService.scoreSingleFood(
        assessmentResult,
        food
      );

      res.status(200).json({
        success: true,
        data: scoreData
      });
    } catch (error) {
      console.error('Unani food scoring error:', error);
      res.status(500).json({
        success: false,
        message: 'Error scoring food',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/diet-plans/ayurveda/generate
 * @desc    Generate comprehensive Ayurveda diet plan based on assessment results
 * @access  Private/Practitioner
 */
router.post(
  '/ayurveda/generate',
  protect,
  authorize('practitioner'),
  requireVerified,
  authorizeAuthority('Editor', 'Approver'),
  auditLog('DietPlan'),
  async (req, res) => {
    try {
      const { assessmentResult, userId, preferences } = req.body;

      // Validation
      if (!assessmentResult || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide assessmentResult and userId'
        });
      }

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate Ayurveda diet plan
      const dietPlanData = await ayurvedaDietPlanService.generateDietPlan(
        assessmentResult,
        preferences
      );

      // Save to database
      const dietPlan = await DietPlan.create({
        userId,
        planName: `Ayurveda Diet Plan - ${assessmentResult.dominant_dosha || 'Balanced'} Dosha`,
        planType: 'ayurveda',
        meals: dietPlanData.weeklyPlan || [],
        rulesApplied: [
          {
            framework: 'ayurveda',
            details: {
              dominant_dosha: assessmentResult.dominant_dosha,
              agni: assessmentResult.agni,
              severity: assessmentResult.severity,
              prakriti: assessmentResult.prakriti,
              vikriti: assessmentResult.vikriti,
              reasoning: dietPlanData.reasoning
            }
          }
        ],
        status: 'Draft',
        createdBy: req.practitioner._id,
        createdByModel: 'Practitioner',
        validFrom: new Date(),
        validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      await dietPlan.populate('userId', 'name email');

      res.status(201).json({
        success: true,
        message: 'Ayurveda diet plan generated successfully',
        data: {
          dietPlan,
          weeklyPlan: dietPlanData.weeklyPlan,
          reasoning: dietPlanData.reasoning,
          topRecommendations: dietPlanData.topRecommendations,
          avoidFoods: dietPlanData.avoidFoods
        }
      });
    } catch (error) {
      console.error('Ayurveda diet plan generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating Ayurveda diet plan',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/diet-plans/ayurveda/recommendations
 * @desc    Get scored Ayurveda food recommendations
 * @access  Private/Practitioner
 */
router.post(
  '/ayurveda/recommendations',
  protect,
  authorize('practitioner'),
  requireVerified,
  async (req, res) => {
    try {
      const { assessmentResult, limit } = req.body;

      // Validation
      if (!assessmentResult) {
        return res.status(400).json({
          success: false,
          message: 'Please provide assessmentResult'
        });
      }

      // Get food recommendations
      const recommendations = await ayurvedaDietPlanService.getFoodRecommendations(
        assessmentResult,
        limit || 50
      );

      res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Ayurveda recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching Ayurveda recommendations',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/diet-plans/ayurveda/score-food
 * @desc    Score a single food item for Ayurveda compatibility
 * @access  Private/Practitioner
 */
router.post(
  '/ayurveda/score-food',
  protect,
  authorize('practitioner'),
  requireVerified,
  async (req, res) => {
    try {
      const { assessmentResult, foodId } = req.body;

      // Validation
      if (!assessmentResult || !foodId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide assessmentResult and foodId'
        });
      }

      // Get food
      const food = await Food.findById(foodId);
      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Food not found'
        });
      }

      // Score the food
      const scoreData = await ayurvedaDietPlanService.scoreSingleFood(
        assessmentResult,
        food
      );

      res.status(200).json({
        success: true,
        data: scoreData
      });
    } catch (error) {
      console.error('Ayurveda food scoring error:', error);
      res.status(500).json({
        success: false,
        message: 'Error scoring food',
        error: error.message
      });
    }
  }
);

// ============================================================================
// TCM DIET PLAN ENDPOINTS
// ============================================================================

/**
 * @route   POST /api/diet-plans/tcm/generate
 * @desc    Generate complete TCM diet plan with 7-day meal plan
 * @access  Private/Practitioner
 */
router.post(
  '/tcm/generate',
  protect,
  authorize('practitioner'),
  requireVerified,
  async (req, res) => {
    try {
      const { assessmentResult, userId } = req.body;

      // Validation
      if (!assessmentResult || !assessmentResult.primary_pattern) {
        return res.status(400).json({
          success: false,
          message: 'Please provide valid TCM assessment result with primary_pattern'
        });
      }

      // Generate diet plan using TCM Diet Engine
      const dietPlan = await tcmDietPlanService.generateDietPlan(assessmentResult);

      // Save to database if userId provided
      if (userId) {
        const newDietPlan = new DietPlan({
          userId,
          framework: 'tcm',
          assessmentSnapshot: {
            primary_pattern: assessmentResult.primary_pattern,
            secondary_pattern: assessmentResult.secondary_pattern,
            cold_heat: assessmentResult.cold_heat,
            severity: assessmentResult.severity
          },
          meals: [], // Can be populated from 7_day_plan if needed
          createdBy: req.user._id,
          createdAt: new Date()
        });

        await newDietPlan.save();

        console.log(`✅ TCM Diet plan saved for user ${userId}`);
      }

      res.status(200).json(dietPlan);
    } catch (error) {
      console.error('TCM diet plan generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating TCM diet plan',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/diet-plans/tcm/recommendations
 * @desc    Get TCM food recommendations without full meal plan
 * @access  Private/Practitioner
 */
router.post(
  '/tcm/recommendations',
  protect,
  authorize('practitioner'),
  requireVerified,
  async (req, res) => {
    try {
      const { assessmentResult, limit } = req.body;

      // Validation
      if (!assessmentResult || !assessmentResult.primary_pattern) {
        return res.status(400).json({
          success: false,
          message: 'Please provide valid TCM assessment result'
        });
      }

      // Get recommendations
      const recommendations = await tcmDietPlanService.getFoodRecommendations(
        assessmentResult,
        limit || 20
      );

      res.status(200).json({
        success: true,
        data: {
          pattern: {
            primary: assessmentResult.primary_pattern,
            secondary: assessmentResult.secondary_pattern,
            cold_heat: assessmentResult.cold_heat
          },
          recommendations
        }
      });
    } catch (error) {
      console.error('TCM food recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting TCM food recommendations',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/diet-plans/tcm/score-food
 * @desc    Score a single food item for TCM compatibility
 * @access  Private/Practitioner
 */
router.post(
  '/tcm/score-food',
  protect,
  authorize('practitioner'),
  requireVerified,
  async (req, res) => {
    try {
      const { assessmentResult, foodId } = req.body;

      // Validation
      if (!assessmentResult || !foodId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide assessmentResult and foodId'
        });
      }

      // Get food
      const food = await Food.findById(foodId);
      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Food not found'
        });
      }

      // Score the food
      const scoreData = tcmDietPlanService.scoreSingleFood(food, assessmentResult);

      res.status(200).json({
        success: true,
        data: scoreData
      });
    } catch (error) {
      console.error('TCM food scoring error:', error);
      res.status(500).json({
        success: false,
        message: 'Error scoring food',
        error: error.message
      });
    }
  }
);

module.exports = router;
