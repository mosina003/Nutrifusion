/**
 * Ayurveda Diet Plan Service
 * 
 * High-level service that orchestrates:
 * 1. Food scoring via ayurvedaDietEngine
 * 2. 7-day meal plan generation via ayurvedaMealPlan
 * 3. Validation and error handling
 * 4. Formatting for API responses
 */

const { scoreFood, scoreAllFoods } = require('./ayurvedaDietEngine');
const { generateWeeklyPlan, generateReasoning } = require('./ayurvedaMealPlan');
const Food = require('../../../models/Food');

/**
 * Validate Ayurveda assessment result structure
 * 
 * @param {Object} assessmentResult
 * @returns {boolean}
 */
const _validateAssessment = (assessmentResult) => {
  if (!assessmentResult) {
    throw new Error('Assessment result is required');
  }
  
  const { prakriti, vikriti, agni, dominant_dosha, severity } = assessmentResult;
  
  if (!prakriti || !vikriti) {
    throw new Error('Assessment must include prakriti and vikriti');
  }
  
  if (!dominant_dosha || !['vata', 'pitta', 'kapha'].includes(dominant_dosha)) {
    throw new Error('Invalid or missing dominant_dosha. Must be: vata, pitta, or kapha');
  }
  
  if (!agni || !['Variable', 'Sharp', 'Slow', 'Balanced'].includes(agni)) {
    throw new Error('Invalid or missing agni type');
  }
  
  if (!severity || severity < 1 || severity > 3) {
    throw new Error('Severity must be between 1-3');
  }
  
  return true;
};

/**
 * Generate comprehensive Ayurveda diet plan
 * 
 * @param {Object} assessmentResult - Ayurveda assessment output
 *   {
 *     prakriti: { vata: 40, pitta: 35, kapha: 25 },
 *     vikriti: { vata: 60, pitta: 20, kapha: 20 },
 *     agni: 'Variable',
 *     dominant_dosha: 'vata',
 *     severity: 2
 *   }
 * @param {Object} preferences - User preferences (optional)
 *   {
 *     excludeIngredients: ['shellfish', 'beef'],
 *     vegetarianOnly: true,
 *     cuisinePreference: 'Indian'
 *   }
 * @returns {Object} Complete diet plan with meals and reasoning
 */
const generateDietPlan = async (assessmentResult, preferences = {}) => {
  try {
    // Validate assessment
    _validateAssessment(assessmentResult);
    
    // Step 1: Score all foods
    console.log('Scoring all Ayurveda foods...');
    const categorizedFoods = await scoreAllFoods(assessmentResult);
    
    if (categorizedFoods.highly_recommended.length === 0) {
      throw new Error('No compatible foods found. Please check food database.');
    }
    
    // Step 2: Apply user preferences (exclude foods)
    if (preferences.excludeIngredients && preferences.excludeIngredients.length > 0) {
      const filterByPreferences = (foods) => {
        return foods.filter(f => 
          !preferences.excludeIngredients.some(excluded => 
            f.food.name.toLowerCase().includes(excluded.toLowerCase())
          )
        );
      };
      
      categorizedFoods.highly_recommended = filterByPreferences(categorizedFoods.highly_recommended);
      categorizedFoods.moderate = filterByPreferences(categorizedFoods.moderate);
      categorizedFoods.avoid = filterByPreferences(categorizedFoods.avoid);
    }
    
    // Filter for vegetarian if requested
    if (preferences.vegetarianOnly) {
      const filterVegetarian = (foods) => {
        return foods.filter(f => f.food.category !== 'Meat');
      };
      
      categorizedFoods.highly_recommended = filterVegetarian(categorizedFoods.highly_recommended);
      categorizedFoods.moderate = filterVegetarian(categorizedFoods.moderate);
      categorizedFoods.avoid = filterVegetarian(categorizedFoods.avoid);
    }
    
    // Step 3: Generate 7-day meal plan
    console.log('Generating 7-day Ayurveda meal plan...');
    const weeklyPlan = generateWeeklyPlan(assessmentResult, categorizedFoods);
    
    // Step 4: Generate reasoning and summary
    const reasoning = generateReasoning(assessmentResult, categorizedFoods);
    
    // Step 5: Return complete plan
    return {
      weeklyPlan,
      reasoning,
      topRecommendations: categorizedFoods.highly_recommended.slice(0, 20),
      avoidFoods: categorizedFoods.avoid.slice(0, 15),
      summary: {
        total_foods_scored: 
          categorizedFoods.highly_recommended.length + 
          categorizedFoods.moderate.length + 
          categorizedFoods.avoid.length,
        highly_recommended_count: categorizedFoods.highly_recommended.length,
        moderate_count: categorizedFoods.moderate.length,
        avoid_count: categorizedFoods.avoid.length
      }
    };
    
  } catch (error) {
    console.error('Ayurveda diet plan generation error:', error);
    throw error;
  }
};

/**
 * Get scored food recommendations (without meal plan)
 * 
 * @param {Object} assessmentResult - Ayurveda assessment output
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Object} Categorized food recommendations
 */
const getFoodRecommendations = async (assessmentResult, limit = 50) => {
  try {
    _validateAssessment(assessmentResult);
    
    const categorizedFoods = await scoreAllFoods(assessmentResult);
    
    return {
      highly_recommended: categorizedFoods.highly_recommended.slice(0, Math.ceil(limit * 0.4)),
      moderate: categorizedFoods.moderate.slice(0, Math.ceil(limit * 0.4)),
      avoid: categorizedFoods.avoid.slice(0, Math.ceil(limit * 0.2)),
      summary: {
        total_foods_scored: 
          categorizedFoods.highly_recommended.length + 
          categorizedFoods.moderate.length + 
          categorizedFoods.avoid.length
      }
    };
  } catch (error) {
    console.error('Ayurveda recommendations error:', error);
    throw error;
  }
};

/**
 * Score a single food item
 * 
 * @param {Object} assessmentResult - Ayurveda assessment output
 * @param {Object} food - Food document or ID
 * @returns {Object} Scored food with detailed breakdown
 */
const scoreSingleFood = async (assessmentResult, food) => {
  try {
    _validateAssessment(assessmentResult);
    
    // If food is an ID, fetch it
    if (typeof food === 'string') {
      food = await Food.findById(food);
      if (!food) {
        throw new Error('Food not found');
      }
    }
    
    const scoredFood = scoreFood(assessmentResult, food);
    
    if (!scoredFood) {
      throw new Error('Food does not have Ayurveda data or is invalid');
    }
    
    return {
      ...scoredFood,
      recommendation: scoredFood.score >= 5 
        ? 'Highly Recommended' 
        : scoredFood.score >= 0 
        ? 'Moderate - Consume in moderation' 
        : 'Avoid or minimize',
      details: {
        dosha_analysis: `This food ${food.ayurveda.doshaEffect[assessmentResult.dominant_dosha] === 'Decrease' ? 'balances' : food.ayurveda.doshaEffect[assessmentResult.dominant_dosha] === 'Increase' ? 'aggravates' : 'is neutral for'} your dominant ${assessmentResult.dominant_dosha} dosha`,
        agni_compatibility: assessmentResult.agni === 'Variable' 
          ? 'Ensure food is warm and well-cooked for Variable Agni'
          : assessmentResult.agni === 'Sharp'
          ? 'Your strong Agni can handle most foods'
          : assessmentResult.agni === 'Slow'
          ? 'Keep portions light for Slow Agni'
          : 'Balanced Agni - no special restrictions'
      }
    };
  } catch (error) {
    console.error('Ayurveda food scoring error:', error);
    throw error;
  }
};

module.exports = {
  generateDietPlan,
  getFoodRecommendations,
  scoreSingleFood
};
