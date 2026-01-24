const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { recommendFoods, recommendForMeal: recommendFoodsForMeal, getPersonalizedRecommendations: getPersonalizedFoodRecommendations } = require('../services/intelligence/recommendation/recommendFoods');
const { recommendRecipes, recommendForMeal: recommendRecipesForMeal, getPersonalizedRecommendations: getPersonalizedRecipeRecommendations } = require('../services/intelligence/recommendation/recommendRecipes');
const { buildExplanation, buildSummaryExplanation } = require('../services/intelligence/explainability/explanationBuilder');
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
router.get('/foods', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, category, minScore = 40 } = req.query;

    // Build complete user profile
    const userProfile = await buildUserProfile(req.user.userId);

    // Get recommendations
    const options = {
      limit: parseInt(limit),
      category,
      minScore: parseInt(minScore)
    };

    const result = await getPersonalizedFoodRecommendations(userProfile, options);

    // Add explanations
    const recommendationsWithExplanations = result.recommendations.map(rec => ({
      ...rec,
      explanation: buildExplanation(rec, rec.name)
    }));

    // Build summary
    const summaryExplanation = buildSummaryExplanation(result.recommendations, result.summary.userProfile);

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
router.get('/recipes', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, category, minScore = 40 } = req.query;

    // Build complete user profile
    const userProfile = await buildUserProfile(req.user.userId);

    // Get recommendations
    const options = {
      limit: parseInt(limit),
      category,
      minScore: parseInt(minScore)
    };

    const result = await getPersonalizedRecipeRecommendations(userProfile, options);

    // Add explanations
    const recommendationsWithExplanations = result.recommendations.map(rec => ({
      ...rec,
      explanation: buildExplanation(rec, rec.name)
    }));

    // Build summary
    const summaryExplanation = buildSummaryExplanation(result.recommendations, result.summary.userProfile);

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
router.get('/meal/:mealTime', authenticateToken, async (req, res) => {
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
    const userProfile = await buildUserProfile(req.user.userId);

    const options = { limit: parseInt(limit) };
    let recommendations = [];

    // Get foods and/or recipes
    if (type === 'foods' || type === 'both') {
      const foods = await recommendFoodsForMeal(userProfile, mealTime, options);
      recommendations.push(...foods.map(f => ({ ...f, type: 'food' })));
    }

    if (type === 'recipes' || type === 'both') {
      const recipes = await recommendRecipesForMeal(userProfile, mealTime, options);
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
router.get('/dailyplan', authenticateToken, async (req, res) => {
  try {
    const userProfile = await buildUserProfile(req.user.userId);

    // Get recommendations for each meal
    const breakfast = await recommendRecipesForMeal(userProfile, 'Breakfast', { limit: 3 });
    const lunch = await recommendRecipesForMeal(userProfile, 'Lunch', { limit: 3 });
    const dinner = await recommendRecipesForMeal(userProfile, 'Dinner', { limit: 3 });
    const snacks = await recommendRecipesForMeal(userProfile, 'Snack', { limit: 5 });

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

module.exports = router;
