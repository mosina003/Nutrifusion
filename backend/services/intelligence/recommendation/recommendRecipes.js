const Recipe = require('../../../models/Recipe');
const { calculateRecipeScore } = require('../scoring/scoreEngine');

/**
 * Recommendation Engine for Recipes
 */

/**
 * Recommend recipes for a user
 * @param {Object} user - User profile with health data
 * @param {Object} options - { limit: 10, category: null, minScore: 40 }
 * @returns {Array} - Ranked recipe recommendations
 */
const recommendRecipes = async (user, options = {}) => {
  const { limit = 10, category = null, minScore = 40 } = options;

  try {
    // Build query - fetch all recipes (approved or not for now)
    let query = {};
    if (category) {
      query.category = category;
    }

    // Fetch candidate recipes with populated ingredients
    const recipes = await Recipe.find(query).populate('ingredients.foodId').lean();

    if (recipes.length === 0) {
      return [];
    }

    // Score each recipe
    const scoredRecipes = recipes.map(recipe => {
      const scoreResult = calculateRecipeScore(user, recipe);
      
      return {
        recipeId: recipe._id,
        name: recipe.name,
        category: recipe.category,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        finalScore: scoreResult.finalScore,
        reasons: scoreResult.reasons,
        warnings: scoreResult.warnings,
        blocked: scoreResult.block,
        systemScores: scoreResult.systemScores,
        nutritionSummary: {
          calories: recipe.nutritionSummary?.calories || 0,
          protein: recipe.nutritionSummary?.protein || 0,
          carbs: recipe.nutritionSummary?.carbs || 0,
          fat: recipe.nutritionSummary?.fat || 0
        }
      };
    });

    // Filter out blocked recipes
    const unblocked = scoredRecipes.filter(recipe => !recipe.blocked);

    // Filter by minimum score
    const qualified = unblocked.filter(recipe => recipe.finalScore >= minScore);

    // Sort by score (descending)
    qualified.sort((a, b) => b.finalScore - a.finalScore);

    // Return top N
    return qualified.slice(0, limit);

  } catch (error) {
    console.error('Error in recommendRecipes:', error);
    throw error;
  }
};

/**
 * Recommend recipes for specific meal time
 * @param {Object} user - User profile
 * @param {String} mealTime - 'Breakfast', 'Lunch', 'Dinner', 'Snack'
 * @param {Object} options - Additional options
 * @returns {Array} - Ranked recommendations
 */
const recommendForMeal = async (user, mealTime, options = {}) => {
  // Adjust recommendations based on meal time
  const mealConfig = {
    'Breakfast': { minScore: 50, preferredTime: 'Quick' },
    'Lunch': { minScore: 45 },
    'Dinner': { minScore: 40 },
    'Snack': { minScore: 35, preferredTime: 'Quick' }
  };

  const config = mealConfig[mealTime] || { minScore: 40 };
  const mergedOptions = { ...config, ...options };

  return recommendRecipes(user, mergedOptions);
};

/**
 * Get personalized recipe recommendations with explanations
 * @param {Object} user - User profile
 * @param {Object} options - Options
 * @returns {Object} - {recommendations, summary}
 */
const getPersonalizedRecommendations = async (user, options = {}) => {
  const recommendations = await recommendRecipes(user, options);

  // Generate summary
  const summary = {
    totalRecommended: recommendations.length,
    averageScore: recommendations.length > 0 
      ? Math.round(recommendations.reduce((sum, r) => sum + r.finalScore, 0) / recommendations.length)
      : 0,
    averagePrepTime: recommendations.length > 0
      ? Math.round(recommendations.reduce((sum, r) => sum + r.prepTime, 0) / recommendations.length)
      : 0,
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
  recommendRecipes,
  recommendForMeal,
  getPersonalizedRecommendations
};
