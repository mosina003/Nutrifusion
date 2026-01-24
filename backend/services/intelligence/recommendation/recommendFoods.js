const Food = require('../../../models/Food');
const { calculateFoodScore } = require('../scoring/scoreEngine');

/**
 * Recommendation Engine for Foods
 */

/**
 * Recommend foods for a user
 * @param {Object} user - User profile with health data
 * @param {Object} options - { limit: 10, category: null, minScore: 40 }
 * @returns {Array} - Ranked food recommendations
 */
const recommendFoods = async (user, options = {}) => {
  const { limit = 10, category = null, minScore = 40 } = options;

  try {
    // Build query - fetch all foods (verified or not for now)
    let query = {};
    if (category) {
      query.category = category;
    }

    // Fetch candidate foods
    const foods = await Food.find(query).lean();

    if (foods.length === 0) {
      return [];
    }

    // Score each food
    const scoredFoods = foods.map(food => {
      const scoreResult = calculateFoodScore(user, food);
      
      return {
        foodId: food._id,
        name: food.name,
        category: food.category,
        finalScore: scoreResult.finalScore,
        reasons: scoreResult.reasons,
        warnings: scoreResult.warnings,
        blocked: scoreResult.block,
        systemScores: scoreResult.systemScores,
        nutritionSummary: {
          calories: food.modernNutrition?.calories || 0,
          protein: food.modernNutrition?.protein || 0,
          carbs: food.modernNutrition?.carbs || 0,
          fat: food.modernNutrition?.fat || 0
        }
      };
    });

    // Filter out blocked foods
    const unblocked = scoredFoods.filter(food => !food.blocked);

    // Filter by minimum score
    const qualified = unblocked.filter(food => food.finalScore >= minScore);

    // Sort by score (descending)
    qualified.sort((a, b) => b.finalScore - a.finalScore);

    // Return top N
    return qualified.slice(0, limit);

  } catch (error) {
    console.error('Error in recommendFoods:', error);
    throw error;
  }
};

/**
 * Recommend foods for specific meal time
 * @param {Object} user - User profile
 * @param {String} mealTime - 'Breakfast', 'Lunch', 'Dinner', 'Snack'
 * @param {Object} options - Additional options
 * @returns {Array} - Ranked recommendations
 */
const recommendForMeal = async (user, mealTime, options = {}) => {
  // Adjust recommendations based on meal time
  const mealConfig = {
    'Breakfast': { minScore: 50, preferredCategories: ['Grain', 'Fruit', 'Dairy'] },
    'Lunch': { minScore: 45, preferredCategories: ['Grain', 'Vegetable', 'Legume', 'Meat'] },
    'Dinner': { minScore: 40, preferredCategories: ['Vegetable', 'Legume', 'Grain'] },
    'Snack': { minScore: 35, preferredCategories: ['Fruit', 'Nut', 'Beverage'] }
  };

  const config = mealConfig[mealTime] || { minScore: 40 };
  const mergedOptions = { ...config, ...options };

  return recommendFoods(user, mergedOptions);
};

/**
 * Get personalized food recommendations with explanations
 * @param {Object} user - User profile
 * @param {Object} options - Options
 * @returns {Object} - {recommendations, summary}
 */
const getPersonalizedRecommendations = async (user, options = {}) => {
  const recommendations = await recommendFoods(user, options);

  // Generate summary
  const summary = {
    totalRecommended: recommendations.length,
    averageScore: recommendations.length > 0 
      ? Math.round(recommendations.reduce((sum, r) => sum + r.finalScore, 0) / recommendations.length)
      : 0,
    topCategory: recommendations.length > 0
      ? recommendations[0].category
      : null,
    userProfile: {
      dominantDosha: getDominantDosha(user.prakriti),
      medicalConditions: user.medicalConditions || [],
      dietaryPreferences: user.dietaryPreferences || []
    }
  };

  return {
    recommendations,
    summary
  };
};

/**
 * Helper to determine dominant dosha
 * @param {Object} prakriti 
 * @returns {String}
 */
const getDominantDosha = (prakriti) => {
  if (!prakriti) return 'Balanced';
  
  const { vata = 33, pitta = 33, kapha = 33 } = prakriti;
  
  if (vata > pitta && vata > kapha) return 'Vata';
  if (pitta > vata && pitta > kapha) return 'Pitta';
  if (kapha > vata && kapha > pitta) return 'Kapha';
  
  return 'Balanced';
};

module.exports = {
  recommendFoods,
  recommendForMeal,
  getPersonalizedRecommendations
};
