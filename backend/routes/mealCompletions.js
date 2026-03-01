const express = require('express');
const router = express.Router();
const MealCompletion = require('../models/MealCompletion');
const Assessment = require('../models/Assessment');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/meal-completions
 * @desc    Get meal completions for current user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const completions = await MealCompletion.find({ 
      userId: req.user.id 
    }).sort({ date: -1 });

    res.json({
      success: true,
      data: completions
    });
  } catch (error) {
    console.error('Error fetching meal completions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch meal completions'
    });
  }
});

/**
 * @route   POST /api/meal-completions/toggle
 * @desc    Toggle meal completion for a specific date and meal type
 * @access  Private
 */
router.post('/toggle', protect, async (req, res) => {
  try {
    const { date, day, mealType, dietPlanId } = req.body;

    if (!date || !day || !mealType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: date, day, mealType'
      });
    }

    // Find or create completion record for this date
    let completion = await MealCompletion.findOne({
      userId: req.user.id,
      date: date
    });

    if (!completion) {
      const completionData = {
        userId: req.user.id,
        date,
        day,
        completedMeals: []
      };
      
      // Only add dietPlanId if it's a valid ObjectId
      if (dietPlanId && dietPlanId !== 'current' && dietPlanId.match(/^[0-9a-fA-F]{24}$/)) {
        completionData.dietPlanId = dietPlanId;
      }
      
      completion = new MealCompletion(completionData);
    }

    // Check if meal is already completed
    const mealIndex = completion.completedMeals.findIndex(
      m => m.mealType === mealType.toLowerCase()
    );

    if (mealIndex > -1) {
      // Remove completion (unchecking)
      completion.completedMeals.splice(mealIndex, 1);
    } else {
      // Add completion (checking)
      completion.completedMeals.push({
        mealType: mealType.toLowerCase(),
        completedAt: new Date()
      });
    }

    // Check if all meals are completed for the day
    const totalMeals = 3; // breakfast, lunch, dinner
    completion.dayCompleted = completion.completedMeals.length === totalMeals;
    
    if (completion.dayCompleted && !completion.completedAt) {
      completion.completedAt = new Date();
    } else if (!completion.dayCompleted) {
      completion.completedAt = null;
    }

    await completion.save();

    res.json({
      success: true,
      data: completion
    });
  } catch (error) {
    console.error('Error toggling meal completion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle meal completion'
    });
  }
});

/**
 * @route   POST /api/meal-completions/regenerate-plan
 * @desc    Regenerate entire 7-day diet plan and reset completions
 * @access  Private
 */
router.post('/regenerate-plan', protect, async (req, res) => {
  try {
    // Find user's latest assessment
    const assessment = await Assessment.findOne({
      userId: req.user.id
    }).sort({ completedAt: -1 });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'No assessment found. Please complete an assessment first.'
      });
    }

    // Generate new diet plan based on framework
    const framework = assessment.framework || 'ayurveda';
    let dietPlanService;

    switch (framework) {
      case 'ayurveda':
        dietPlanService = require('../services/intelligence/diet/ayurvedaDietPlanService');
        break;
      case 'unani':
        dietPlanService = require('../services/intelligence/diet/unaniDietPlanService');
        break;
      case 'tcm':
        dietPlanService = require('../services/intelligence/diet/tcmDietPlanService');
        break;
      case 'modern':
        dietPlanService = require('../services/intelligence/diet/modernDietPlanService');
        break;
      default:
        dietPlanService = require('../services/intelligence/diet/ayurvedaDietPlanService');
    }

    // Generate new 7-day plan
    const newDietPlan = await dietPlanService.generateDietPlan(
      req.user.id,
      assessment._id,
      { regenerate: true }
    );

    // Clear all existing completions for this user
    await MealCompletion.deleteMany({ userId: req.user.id });

    res.json({
      success: true,
      message: 'Diet plan regenerated successfully',
      dietPlan: newDietPlan
    });
  } catch (error) {
    console.error('Error regenerating plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate diet plan'
    });
  }
});

/**
 * @route   POST /api/meal-completions/replace-meal
 * @desc    Replace a specific meal for a specific day
 * @access  Private
 */
router.post('/replace-meal', protect, async (req, res) => {
  try {
    const { day, mealType } = req.body;

    if (!day || !mealType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: day, mealType'
      });
    }

    // Find user's latest assessment
    const assessment = await Assessment.findOne({
      userId: req.user.id
    }).sort({ completedAt: -1 });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'No assessment found. Please complete an assessment first.'
      });
    }

    // Get current diet plan
    const DietPlan = require('../models/DietPlan');
    const currentPlan = await DietPlan.findOne({
      userId: req.user.id,
      status: 'Active'
    }).sort({ createdAt: -1 });

    if (!currentPlan) {
      return res.status(404).json({
        success: false,
        error: 'No active diet plan found.'
      });
    }

    // Get Food model
    const Food = require('../models/Food');
    
    // Find the specific meal in the meals array
    const mealTypeCapitalized = mealType.charAt(0).toUpperCase() + mealType.slice(1).toLowerCase();
    const mealIndex = currentPlan.meals.findIndex(
      m => m.day === parseInt(day) && m.mealType === mealTypeCapitalized
    );
    
    if (mealIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Meal not found for day ${day}, ${mealType}`
      });
    }

    // Get current meal foods to avoid duplicates
    const currentMealFoods = currentPlan.meals[mealIndex].foods || [];
    
    // Fetch suitable foods
    const allFoods = await Food.find({}).limit(200);
    
    // Filter out current meal foods
    const availableFoods = allFoods.filter(food => !currentMealFoods.includes(food.name));
    
    // Randomly select 3-4 foods for the new meal
    const shuffled = availableFoods.sort(() => 0.5 - Math.random());
    const numFoods = Math.floor(Math.random() * 2) + 3; // 3 or 4 foods
    const newMealFoods = shuffled.slice(0, numFoods).map(f => f.name);

    // Update the meal in the meals array
    currentPlan.meals[mealIndex].foods = newMealFoods;
    
    // Mark as modified to ensure Mongoose saves it
    currentPlan.markModified('meals');
    await currentPlan.save();

    res.json({
      success: true,
      message: `${mealType} replaced successfully`,
      data: {
        day,
        mealType,
        newFoods: newMealFoods
      }
    });
  } catch (error) {
    console.error('Error replacing meal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to replace meal'
    });
  }
});

/**
 * @route   GET /api/meal-completions/progress
 * @desc    Get progress summary for current week
 * @access  Private
 */
router.get('/progress', protect, async (req, res) => {
  try {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week

    const completions = await MealCompletion.find({
      userId: req.user.id,
      date: { $gte: weekStart.toISOString().split('T')[0] }
    });

    const totalMeals = 7 * 3; // 7 days × 3 meals
    const completedMeals = completions.reduce(
      (sum, c) => sum + c.completedMeals.length,
      0
    );
    const completedDays = completions.filter(c => c.dayCompleted).length;

    res.json({
      success: true,
      data: {
        totalMeals,
        completedMeals,
        completedDays,
        progress: Math.round((completedMeals / totalMeals) * 100)
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    });
  }
});

module.exports = router;
