/**
 * Modern Clinical Diet Plan Service
 * 
 * Orchestrates the generation of personalized meal plans based on:
 * - Clinical profile (from assessment/modern.js)
 * - Food scoring (from modernDietEngine)
 * - Meal planning (from modernMealPlan)
 * - User preferences (vegetarian, allergens, etc.)
 * 
 * Main entry point for Modern nutrition recommendations.
 */

const { scoreFood, scoreAllFoods } = require('./modernDietEngine');
const { generateWeeklyPlan } = require('./modernMealPlan');

/**
 * Validate clinical profile has required fields
 * @param {Object} clinicalProfile - Output from assessment/modern.js
 * @private
 */
const _validateProfile = (clinicalProfile) => {
  if (!clinicalProfile) {
    throw new Error('Clinical profile is required');
  }
  
  const requiredSections = [
    'anthropometric',
    'metabolic_risk',
    'dietary_restrictions', 
    'lifestyle_load',
    'digestive_function',
    'goal_strategy'
  ];
  
  const missingSections = requiredSections.filter(section => !clinicalProfile[section]);
  
  if (missingSections.length > 0) {
    throw new Error(`Missing required sections: ${missingSections.join(', ')}`);
  }
  
  return true;
};

/**
 * Apply user preferences to food list
 * @param {Array} foods - Scored foods
 * @param {Object} preferences - User dietary preferences
 * @returns {Array} Filtered foods
 * @private
 */
const _applyPreferences = (foods, preferences = {}) => {
  let filtered = [...foods];
  
  // Vegetarian filter
  if (preferences.vegetarian === true) {
    const meatCategories = ['Meat', 'Poultry', 'Fish', 'Seafood'];
    filtered = filtered.filter(f => !meatCategories.includes(f.food.category));
  }
  
  // Vegan filter
  if (preferences.vegan === true) {
    const animalCategories = ['Meat', 'Poultry', 'Fish', 'Seafood', 'Dairy', 'Egg'];
    filtered = filtered.filter(f => !animalCategories.includes(f.food.category));
  }
  
  // Allergen exclusions
  if (preferences.excludeAllergens && Array.isArray(preferences.excludeAllergens)) {
    const allergenCategories = {
      'dairy': ['Dairy', 'Milk', 'Cheese', 'Yogurt'],
      'nuts': ['Nut', 'Peanut', 'Almond', 'Cashew'],
      'soy': ['Soy', 'Tofu', 'Tempeh'],
      'gluten': ['Grain', 'Wheat', 'Barley', 'Rye'],
      'shellfish': ['Shellfish', 'Shrimp', 'Crab'],
      'eggs': ['Egg']
    };
    
    preferences.excludeAllergens.forEach(allergen => {
      const categoriesToExclude = allergenCategories[allergen.toLowerCase()] || [];
      filtered = filtered.filter(f => !categoriesToExclude.includes(f.food.category));
    });
  }
  
  // Custom exclusions
  if (preferences.excludeFoods && Array.isArray(preferences.excludeFoods)) {
    const excludeIds = preferences.excludeFoods.map(id => id.toString());
    filtered = filtered.filter(f => !excludeIds.includes(f.food._id.toString()));
  }
  
  return filtered;
};

/**
 * Generate reasoning and summary for the diet plan
 * @param {Object} clinicalProfile - Clinical profile
 * @param {Object} categorizedFoods - Categorized scored foods
 * @returns {Object} Reasoning object
 * @private
 */
const _generateReasoning = (clinicalProfile, categorizedFoods) => {
  const reasoning = {
    primary_focus: [],
    metabolic_considerations: [],
    dietary_adjustments: [],
    lifestyle_recommendations: []
  };
  
  // Primary focus based on goals
  const goals = clinicalProfile.goals || [];
  if (goals.includes('weight_loss')) {
    reasoning.primary_focus.push('Calorie-controlled, high-protein, high-fiber foods for sustainable weight loss');
  }
  if (goals.includes('muscle_gain')) {
    reasoning.primary_focus.push('Protein-rich foods with adequate carbohydrates for muscle synthesis and recovery');
  }
  if (goals.includes('metabolic_health')) {
    reasoning.primary_focus.push('Low glycemic index, nutrient-dense foods to optimize metabolic function');
  }
  
  // Metabolic considerations
  const riskLevel = clinicalProfile.metabolic_risk_level;
  if (riskLevel === 'high' || riskLevel === 'very_high') {
    reasoning.metabolic_considerations.push('Minimizing refined carbohydrates and saturated fats due to elevated metabolic risk');
  }
  
  const riskFlags = clinicalProfile.risk_flags || [];
  if (riskFlags.includes('diabetes')) {
    reasoning.metabolic_considerations.push('Prioritizing low glycemic load foods to manage blood sugar');
  }
  if (riskFlags.includes('hypertension')) {
    reasoning.metabolic_considerations.push('Limiting sodium intake to support blood pressure management');
  }
  
  // Dietary adjustments
  const digestiveIssues = clinicalProfile.digestive_issues || [];
  if (digestiveIssues.includes('acid_reflux')) {
    reasoning.dietary_adjustments.push('Avoiding high-fat and spicy foods to prevent acid reflux symptoms');
  }
  if (digestiveIssues.includes('ibs')) {
    reasoning.dietary_adjustments.push('Selecting low FODMAP options to minimize IBS symptoms');
  }
  
  const intolerances = clinicalProfile.food_intolerances || [];
  if (intolerances.length > 0) {
    reasoning.dietary_adjustments.push(`Excluding ${intolerances.join(', ')} due to food intolerances`);
  }
  
  // Lifestyle recommendations
  const stressLevel = clinicalProfile.stress_level;
  if (stressLevel === 'high' || stressLevel === 'very_high') {
    reasoning.lifestyle_recommendations.push('Including magnesium and B-vitamin rich foods to support stress management');
  }
  
  const sleepQuality = clinicalProfile.sleep_quality;
  if (sleepQuality === 'poor' || sleepQuality === 'very_poor') {
    reasoning.lifestyle_recommendations.push('Incorporating tryptophan-rich foods to support sleep quality');
  }
  
  const activityLevel = clinicalProfile.physical_activity_level;
  if (activityLevel === 'high' || activityLevel === 'very_high') {
    reasoning.lifestyle_recommendations.push('Ensuring adequate carbohydrate and protein intake to fuel activity');
  }
  
  return reasoning;
};

/**
 * Generate complete Modern diet plan
 * 
 * @param {Object} clinicalProfile - Output from assessment/modern.js score()
 * @param {Object} preferences - User dietary preferences
 * @returns {Object} Complete diet plan with weekly meals and recommendations
 */
const generateDietPlan = async (clinicalProfile, preferences = {}) => {
  try {
    // Step 1: Validate clinical profile
    _validateProfile(clinicalProfile);
    console.log('✓ Clinical profile validated');
    
    // Step 2: Score all foods
    console.log('Scoring all foods based on clinical profile...');
    const categorizedFoods = await scoreAllFoods(clinicalProfile);
    console.log(`✓ Scored ${categorizedFoods.highly_recommended.length + categorizedFoods.moderate.length + categorizedFoods.avoid.length} foods`);
    
    // Step 3: Apply user preferences
    if (preferences.vegetarian || preferences.vegan || preferences.excludeAllergens) {
      console.log('Applying dietary preferences...');
      categorizedFoods.highly_recommended = _applyPreferences(categorizedFoods.highly_recommended, preferences);
      categorizedFoods.moderate = _applyPreferences(categorizedFoods.moderate, preferences);
      categorizedFoods.avoid = _applyPreferences(categorizedFoods.avoid, preferences);
      console.log('✓ Preferences applied');
    }
    
    // Step 4: Generate 7-day meal plan
    console.log('Generating 7-day Modern meal plan...');
    const weeklyPlan = generateWeeklyPlan(clinicalProfile, categorizedFoods);
    console.log('✓ Weekly plan generated');
    
    // Step 5: Generate reasoning and summary
    const reasoning = _generateReasoning(clinicalProfile, categorizedFoods);
    
    // Step 6: Return complete plan
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
        avoid_count: categorizedFoods.avoid.length,
        bmi: clinicalProfile.anthropometric.bmi,
        bmr: clinicalProfile.anthropometric.bmr_kcal,
        tdee: clinicalProfile.anthropometric.tdee_kcal,
        metabolic_risk_level: clinicalProfile.metabolic_risk_level
      }
    };
    
  } catch (error) {
    console.error('Modern diet plan generation error:', error);
    throw error;
  }
};

/**
 * Get scored food recommendations (without meal plan)
 * 
 * @param {Object} clinicalProfile - Output from assessment/modern.js score()
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Object} Categorized food recommendations
 */
const getFoodRecommendations = async (clinicalProfile, limit = 50) => {
  try {
    _validateProfile(clinicalProfile);
    
    const categorizedFoods = await scoreAllFoods(clinicalProfile);
    
    return {
      highly_recommended: categorizedFoods.highly_recommended.slice(0, Math.ceil(limit * 0.4)),
      moderate: categorizedFoods.moderate.slice(0, Math.ceil(limit * 0.4)),
      avoid: categorizedFoods.avoid.slice(0, Math.ceil(limit * 0.2)),
      summary: {
        total_foods_scored: 
          categorizedFoods.highly_recommended.length + 
          categorizedFoods.moderate.length + 
          categorizedFoods.avoid.length,
        bmi: clinicalProfile.anthropometric.bmi,
        metabolic_risk_level: clinicalProfile.metabolic_risk_level
      }
    };
  } catch (error) {
    console.error('Modern food recommendations error:', error);
    throw error;
  }
};

/**
 * Score a single food item
 * 
 * @param {Object} clinicalProfile - Output from assessment/modern.js score()
 * @param {Object} food - Food document or ID
 * @returns {Object} Scored food with detailed breakdown
 */
const scoreSingleFood = async (clinicalProfile, food) => {
  try {
    _validateProfile(clinicalProfile);
    
    // If food is an ID, fetch it
    if (typeof food === 'string') {
      const Food = require('../../../models/Food');
      food = await Food.findById(food);
      if (!food) {
        throw new Error('Food not found');
      }
    }
    
    const scoredFood = scoreFood(clinicalProfile, food);
    
    if (!scoredFood) {
      throw new Error('Food does not have Modern nutrition data or is invalid');
    }
    
    // Determine recommendation tier
    let recommendation;
    if (scoredFood.score >= 10) {
      recommendation = 'Highly Recommended';
    } else if (scoredFood.score >= 0) {
      recommendation = 'Moderate - Consume in moderation';
    } else {
      recommendation = 'Avoid or minimize';
    }
    
    return {
      ...scoredFood,
      recommendation,
      details: {
        caloric_alignment: scoredFood.breakdown.goal_based > 0 
          ? 'Well-aligned with your nutrition goals' 
          : 'Not optimally aligned with your goals',
        metabolic_safety: scoredFood.breakdown.metabolic_risk >= 0 
          ? 'Safe for your metabolic profile' 
          : 'May worsen metabolic risk factors',
        digestive_compatibility: scoredFood.breakdown.digestive >= 0 
          ? 'Compatible with your digestive health' 
          : 'May trigger digestive discomfort',
        reason_summary: scoredFood.rule_reasons.join('; ')
      }
    };
  } catch (error) {
    console.error('Error scoring single food:', error);
    throw error;
  }
};

module.exports = {
  generateDietPlan,
  getFoodRecommendations,
  scoreSingleFood
};
