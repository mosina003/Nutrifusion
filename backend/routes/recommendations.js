const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const recommendFoodService = require('../services/intelligence/recommendation/recommendFoods');
const recommendRecipeService = require('../services/intelligence/recommendation/recommendRecipes');
const { buildExplanation, buildSummaryExplanation, enhanceWithLLM } = require('../services/intelligence/explainability/explanationBuilder');
const { buildDebugInfo, buildConflictAnalysis } = require('../services/intelligence/debug/debugService');
const overrideService = require('../services/intelligence/override/overrideService');
const User = require('../models/User');
const HealthProfile = require('../models/HealthProfile');

/**
 * Helper to build complete user profile
 */
const buildUserProfile = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error('User not found');
  }

  const healthProfile = await HealthProfile.findOne({ userId }).lean();

  return {
    ...user,
    medicalConditions: healthProfile?.medicalConditions || [],
    allergies: healthProfile?.allergies || [],
    dietaryPreferences: healthProfile?.dietaryPreferences || [],
    digestionIssues: healthProfile?.digestiveIssues || 'Normal',
    activityLevel: healthProfile?.lifestyle?.activity || 'Moderate',
    mizaj: healthProfile?.mizaj || {},
    tcmConstitution: healthProfile?.tcmConstitution || 'Neutral'
  };
};

/**
 * @route   GET /api/recommendations/foods
 * @desc    Get personalized food recommendations
 * @access  Private (Patient)
 */
router.get('/foods', protect, async (req, res) => {
  try {
    const { limit = 10, category, minScore = 40, llm = 'false' } = req.query;
    const useLLM = llm === 'true';

    // Build complete user profile
    const userProfile = await buildUserProfile(req.user._id);

    // Get recommendations
    const options = {
      limit: parseInt(limit),
      category,
      minScore: parseInt(minScore)
    };

    const result = await recommendFoodService.getPersonalizedRecommendations(userProfile, options);

    // Apply practitioner overrides if they exist
    const recommendationsWithOverrides = await Promise.all(
      result.recommendations.map(async (rec) => {
        const override = await overrideService.getOverride(req.user._id, rec._id.toString());
        return override ? overrideService.applyOverride(rec, override) : rec;
      })
    );

    // Add explanations (with optional LLM enhancement)
    const recommendationsWithExplanations = await Promise.all(
      recommendationsWithOverrides.map(async (rec) => {
        const baseExplanation = buildExplanation(rec, rec.name);
        const explanation = useLLM ? await enhanceWithLLM(baseExplanation, rec) : baseExplanation;
        return { ...rec, explanation };
      })
    );

    // Build summary
    const summaryExplanation = buildSummaryExplanation(recommendationsWithOverrides, result.summary.userProfile);

    res.json({
      success: true,
      data: {
        recommendations: recommendationsWithExplanations,
        summary: {
          ...result.summary,
          explanation: summaryExplanation
        }
      }
    });

  } catch (error) {
    console.error('Error getting food recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recommendations/recipes
 * @desc    Get personalized recipe recommendations
 * @access  Private (Patient)
 */
router.get('/recipes', protect, async (req, res) => {
  try {
    const { limit = 10, category, minScore = 40 } = req.query;

    // Build complete user profile
    const userProfile = await buildUserProfile(req.user._id);

    // Get recommendations
    const options = {
      limit: parseInt(limit),
      category,
      minScore: parseInt(minScore)
    };

    const result = await recommendRecipeService.getPersonalizedRecommendations(userProfile, options);

    // Apply practitioner overrides if they exist
    const recommendationsWithOverrides = await Promise.all(
      result.recommendations.map(async (rec) => {
        const override = await overrideService.getOverride(req.user._id, rec._id.toString());
        return override ? overrideService.applyOverride(rec, override) : rec;
      })
    );

    // Add explanations
    const recommendationsWithExplanations = recommendationsWithOverrides.map(rec => ({
      ...rec,
      explanation: buildExplanation(rec, rec.name)
    }));

    // Build summary
    const summaryExplanation = buildSummaryExplanation(recommendationsWithOverrides, result.summary.userProfile);

    res.json({
      success: true,
      data: {
        recommendations: recommendationsWithExplanations,
        summary: {
          ...result.summary,
          explanation: summaryExplanation
        }
      }
    });

  } catch (error) {
    console.error('Error getting recipe recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recommendations/meal/:mealTime
 * @desc    Get recommendations for specific meal time
 * @access  Private (Patient)
 */
router.get('/meal/:mealTime', protect, async (req, res) => {
  try {
    const { mealTime } = req.params;
    const { type = 'both', limit = 10 } = req.query;

    // Validate meal time
    const validMealTimes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    if (!validMealTimes.includes(mealTime)) {
      return res.status(400).json({
        success: false,
        message: `Invalid meal time. Must be one of: ${validMealTimes.join(', ')}`
      });
    }

    // Build complete user profile
    const userProfile = await buildUserProfile(req.user._id);

    const options = { limit: parseInt(limit) };
    let recommendations = [];

    // Get foods and/or recipes
    if (type === 'foods' || type === 'both') {
      const foods = await recommendFoodService.recommendForMeal(userProfile, mealTime, options);
      recommendations.push(...foods.map(f => ({ ...f, type: 'food' })));
    }

    if (type === 'recipes' || type === 'both') {
      const recipes = await recommendRecipeService.recommendForMeal(userProfile, mealTime, options);
      recommendations.push(...recipes.map(r => ({ ...r, type: 'recipe' })));
    }

    // Sort combined results by score
    recommendations.sort((a, b) => b.finalScore - a.finalScore);

    // Limit results
    recommendations = recommendations.slice(0, parseInt(limit));

    // Add explanations
    const recommendationsWithExplanations = recommendations.map(rec => ({
      ...rec,
      explanation: buildExplanation(rec, rec.name)
    }));

    res.json({
      success: true,
      data: {
        mealTime,
        recommendations: recommendationsWithExplanations,
        summary: {
          totalRecommended: recommendations.length,
          averageScore: recommendations.length > 0
            ? Math.round(recommendations.reduce((sum, r) => sum + r.finalScore, 0) / recommendations.length)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Error getting meal recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating meal recommendations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recommendations/dailyplan
 * @desc    Get complete daily meal plan with recommendations
 * @access  Private (Patient)
 */
router.get('/dailyplan', protect, async (req, res) => {
  try {
    const userProfile = await buildUserProfile(req.user._id);

    // Get recommendations for each meal
    const breakfast = await recommendRecipeService.recommendForMeal(userProfile, 'Breakfast', { limit: 3 });
    const lunch = await recommendRecipeService.recommendForMeal(userProfile, 'Lunch', { limit: 3 });
    const dinner = await recommendRecipeService.recommendForMeal(userProfile, 'Dinner', { limit: 3 });
    const snacks = await recommendRecipeService.recommendForMeal(userProfile, 'Snack', { limit: 5 });

    const dailyPlan = {
      breakfast: breakfast.map(r => ({
        ...r,
        explanation: buildExplanation(r, r.name)
      })),
      lunch: lunch.map(r => ({
        ...r,
        explanation: buildExplanation(r, r.name)
      })),
      dinner: dinner.map(r => ({
        ...r,
        explanation: buildExplanation(r, r.name)
      })),
      snacks: snacks.map(r => ({
        ...r,
        explanation: buildExplanation(r, r.name)
      }))
    };

    // Calculate total nutrition if top options are selected
    const totalNutrition = {
      calories: (breakfast[0]?.nutritionSummary.calories || 0) +
                (lunch[0]?.nutritionSummary.calories || 0) +
                (dinner[0]?.nutritionSummary.calories || 0),
      protein: (breakfast[0]?.nutritionSummary.protein || 0) +
               (lunch[0]?.nutritionSummary.protein || 0) +
               (dinner[0]?.nutritionSummary.protein || 0),
      carbs: (breakfast[0]?.nutritionSummary.carbs || 0) +
             (lunch[0]?.nutritionSummary.carbs || 0) +
             (dinner[0]?.nutritionSummary.carbs || 0),
      fat: (breakfast[0]?.nutritionSummary.fat || 0) +
           (lunch[0]?.nutritionSummary.fat || 0) +
           (dinner[0]?.nutritionSummary.fat || 0)
    };

    res.json({
      success: true,
      data: {
        dailyPlan,
        totalNutrition,
        summary: {
          userProfile: {
            dominantDosha: dailyPlan.breakfast[0]?.reasons?.find(r => r.includes('dosha')) || 'Balanced',
            medicalConditions: userProfile.medicalConditions,
            dietaryPreferences: userProfile.dietaryPreferences
          }
        }
      }
    });

  } catch (error) {
    console.error('Error generating daily plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating daily meal plan',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recommendations/debug/:foodId
 * @desc    Get detailed debug information for a specific food recommendation
 * @access  Private (Practitioner/Admin only)
 */
router.get('/debug/:foodId', protect, authorize('practitioner', 'admin'), async (req, res) => {
  try {
    const { foodId } = req.params;
    const Food = require('../models/Food');
    const { calculateFoodScore } = require('../services/intelligence/scoring/scoreEngine');

    // Build user profile
    const userProfile = await buildUserProfile(req.user._id);

    // Get food
    const food = await Food.findById(foodId).lean();
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }

    // Calculate score
    const scoreResult = await calculateFoodScore(userProfile, food);

    // Build debug info
    const debugInfo = buildDebugInfo(userProfile, food, scoreResult);
    const conflicts = buildConflictAnalysis(scoreResult);

    res.json({
      success: true,
      data: {
        ...debugInfo,
        conflicts
      }
    });

  } catch (error) {
    console.error('Error generating debug info:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating debug information',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/recommendations/override
 * @desc    Create a practitioner override for a specific food/recipe recommendation
 * @access  Private (Practitioner only)
 */
router.post('/override', protect, authorize('practitioner'), async (req, res) => {
  try {
    const { foodId, recipeId, userId, action, reason, originalScore, newScore } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    if (!foodId && !recipeId) {
      return res.status(400).json({
        success: false,
        message: 'Either foodId or recipeId is required'
      });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'action must be either "approve" or "reject"'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'reason is required'
      });
    }

    // Create override
    const override = await overrideService.createOverride({
      foodId,
      recipeId,
      userId,
      practitionerId: req.user._id,
      action,
      reason,
      originalScore,
      newScore
    });

    res.status(201).json({
      success: true,
      message: 'Override created successfully',
      data: override
    });

  } catch (error) {
    console.error('Error creating override:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating override',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recommendations/overrides/:userId
 * @desc    Get all practitioner overrides for a specific user
 * @access  Private (Practitioner/Admin only)
 */
router.get('/overrides/:userId', protect, authorize('practitioner', 'admin'), async (req, res) => {
  try {
    const { userId } = req.params;

    // Get overrides
    const overrides = await overrideService.getUserOverrides(userId);

    res.json({
      success: true,
      count: overrides.length,
      data: overrides
    });

  } catch (error) {
    console.error('Error fetching overrides:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overrides',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recommendations/override/:userId/:itemId
 * @desc    Check if an override exists for a specific user and item
 * @access  Private (Practitioner/Admin only)
 */
router.get('/override/:userId/:itemId', protect, authorize('practitioner', 'admin'), async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    // Check for override
    const override = await overrideService.getOverride(userId, itemId);

    res.json({
      success: true,
      exists: !!override,
      data: override
    });

  } catch (error) {
    console.error('Error checking override:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking override',
      error: error.message
    });
  }
});

module.exports = router;
