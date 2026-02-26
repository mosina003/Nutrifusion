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
 * Normalize assessment result to ensure required fields
 * Calculates missing fields from existing data for backward compatibility
 * 
 * @param {Object} assessmentResult
 * @returns {Object} Normalized assessment with all required fields
 */
const _normalizeAssessment = (assessmentResult) => {
  if (!assessmentResult) {
    throw new Error('Assessment result is required');
  }
  
  const { prakriti, vikriti, agni } = assessmentResult;
  
  if (!prakriti || !vikriti) {
    throw new Error('Assessment must include prakriti and vikriti');
  }
  
  // Calculate dominant_dosha if missing (for backward compatibility)
  let dominant_dosha = assessmentResult.dominant_dosha;
  if (!dominant_dosha && vikriti.dominant) {
    dominant_dosha = vikriti.dominant;
    console.log('ℹ️  Computed dominant_dosha from vikriti:', dominant_dosha);
  }
  
  if (!dominant_dosha || !['vata', 'pitta', 'kapha'].includes(dominant_dosha)) {
    throw new Error('Invalid or missing dominant_dosha. Must be: vata, pitta, or kapha');
  }
  
  // Validate agni (can be object or string)
  let agniType = agni;
  if (typeof agni === 'object' && agni.type) {
    // Convert object format to string
    const agniMap = {
      'vishama': 'Variable',
      'tikshna': 'Sharp',
      'manda': 'Slow',
      'sama': 'Balanced'
    };
    agniType = agniMap[agni.type] || agni.type;
  }
  
  if (!agniType || !['Variable', 'Sharp', 'Slow', 'Balanced'].includes(agniType)) {
    throw new Error('Invalid or missing agni type');
  }
  
  // Calculate severity if missing (for backward compatibility)
  let severity = assessmentResult.severity;
  if (!severity) {
    // Calculate based on imbalance
    if (vikriti.is_balanced) {
      severity = 1;
    } else if (prakriti.primary !== vikriti.dominant) {
      severity = 3; // Different dominant dosha = severe
    } else {
      // Check vikriti score proportion
      const dominantScore = vikriti.scores ? vikriti.scores[dominant_dosha] : 0;
      if (dominantScore >= 5) {
        severity = 3;
      } else if (dominantScore >= 4) {
        severity = 2;
      } else {
        severity = 1;
      }
    }
    console.log('ℹ️  Computed severity:', severity);
  }
  
  if (!severity || severity < 1 || severity > 3) {
    throw new Error('Severity must be between 1-3');
  }
  
  // Return normalized assessment
  return {
    ...assessmentResult,
    dominant_dosha,
    agni: agniType,
    severity
  };
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
    // Normalize and validate assessment (backward compatible)
    const normalizedAssessment = _normalizeAssessment(assessmentResult);
    
    // Step 1: Score all foods
    console.log('Scoring all Ayurveda foods...');
    const categorizedFoods = await scoreAllFoods(normalizedAssessment);
    
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
    const weeklyPlan = generateWeeklyPlan(normalizedAssessment, categorizedFoods);
    
    // Step 4: Generate reasoning and summary
    const reasoning = generateReasoning(normalizedAssessment, categorizedFoods);
    
    // Step 5: Transform weekly plan to expected format
    const transformedWeeklyPlan = {};
    weeklyPlan.forEach((dayPlan, index) => {
      const dayKey = `day_${index + 1}`;
      
      // Extract breakfast, lunch, dinner from meals array
      const breakfast = dayPlan.meals.find(m => m.meal_type === 'Breakfast');
      const lunch = dayPlan.meals.find(m => m.meal_type === 'Lunch');
      const dinner = dayPlan.meals.find(m => m.meal_type === 'Dinner');
      
      transformedWeeklyPlan[dayKey] = {
        breakfast: breakfast ? breakfast.foods.map(f => f.food.name) : [],
        lunch: lunch ? lunch.foods.map(f => f.food.name) : [],
        dinner: dinner ? dinner.foods.map(f => f.food.name) : [],
        guidelines: dayPlan.guidelines || []
      };
    });
    
    // Step 6: Return complete plan in expected format
    return {
      '7_day_plan': transformedWeeklyPlan,
      top_ranked_foods: categorizedFoods.highly_recommended.slice(0, 20).map(f => ({
        food_name: f.food.name,
        score: f.score
      })),
      reasoning_summary: reasoning.constitution_summary || '',
      reasoning: reasoning,
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
    const normalizedAssessment = _normalizeAssessment(assessmentResult);
    
    const categorizedFoods = await scoreAllFoods(normalizedAssessment);
    
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
    const normalizedAssessment = _normalizeAssessment(assessmentResult);
    
    // If food is an ID, fetch it
    if (typeof food === 'string') {
      food = await Food.findById(food);
      if (!food) {
        throw new Error('Food not found');
      }
    }
    
    const scoredFood = scoreFood(normalizedAssessment, food);
    
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
        dosha_analysis: `This food ${food.ayurveda.doshaEffect[normalizedAssessment.dominant_dosha] === 'Decrease' ? 'balances' : food.ayurveda.doshaEffect[normalizedAssessment.dominant_dosha] === 'Increase' ? 'aggravates' : 'is neutral for'} your dominant ${normalizedAssessment.dominant_dosha} dosha`,
        agni_compatibility: normalizedAssessment.agni === 'Variable' 
          ? 'Ensure food is warm and well-cooked for Variable Agni'
          : normalizedAssessment.agni === 'Sharp'
          ? 'Your strong Agni can handle most foods'
          : normalizedAssessment.agni === 'Slow'
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
