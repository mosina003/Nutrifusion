/**
 * Modern Clinical Diet Engine
 * 
 * Scores foods based on evidence-based nutrition principles:
 * - Goal-based optimization (weight loss, muscle gain, metabolic health)
 * - Metabolic risk factors (diabetes, hypertension, heart disease)
 * - Digestive function (acid reflux, IBS, intolerances)
 * - Lifestyle factors (stress, sleep, activity level)
 * - Base nutrient quality (micronutrient density, fiber, protein)
 * 
 * Follows the same pattern as Ayurveda/Unani/TCM diet engines.
 */

const path = require('path');
const fs = require('fs');
const { evaluateModern } = require('../rules/modern.rules');

// Load Modern food data from JSON file
const MODERN_FOODS_PATH = path.join(__dirname, '../../../data/modern_food_constitution.json');
let modernFoodsData = null;

/**
 * Load Modern foods from JSON file
 */
const loadModernFoods = () => {
  if (!modernFoodsData) {
    try {
      const rawData = fs.readFileSync(MODERN_FOODS_PATH, 'utf8');
      modernFoodsData = JSON.parse(rawData);
      console.log(`✅ Loaded ${modernFoodsData.length} Modern foods from JSON`);
    } catch (error) {
      console.error('❌ Error loading Modern foods:', error);
      modernFoodsData = [];
    }
  }
  return modernFoodsData;
};

/**
 * Transform JSON food format to engine format
 */
const transformJSONFood = (jsonFood) => {
  return {
    _id: jsonFood.food_name,
    name: jsonFood.food_name,
    category: jsonFood.category,
    modernNutrition: {
      perUnit: '100g',
      calories: jsonFood.calories || 0,
      protein: jsonFood.protein || 0,
      carbs: jsonFood.carbs || 0,
      fat: jsonFood.fat || 0,
      fiber: jsonFood.fiber || 0,
      glycemic_index: jsonFood.glycemic_index || 50,
      micronutrients: jsonFood.micronutrients || {}
    },
    health_conditions: jsonFood.health_conditions || {},
    allergen_info: jsonFood.allergen_info || 'none',
    therapeutic_use: jsonFood.therapeutic_use || '',
    verified: true
  };
};

/**
 * Validate if food has sufficient data for Modern scoring
 * @param {Object} food - Food document
 * @returns {boolean}
 */
const validateModernFood = (food) => {
  if (!food || !food.modernNutrition) {
    return false;
  }
  
  const { calories, protein, carbs, fat } = food.modernNutrition;
  
  // Must have basic macronutrients
  if (calories === undefined || protein === undefined || 
      carbs === undefined || fat === undefined) {
    return false;
  }
  
  return true;
};

/**
 * Score a single food item based on clinical profile
 * 
 * @param {Object} clinicalProfile - Output from ClinicalScorer.computeProfile()
 * @param {Object} food - Food document with modernNutrition data
 * @returns {Object} Scored food with breakdown
 */
const scoreFood = (clinicalProfile, food) => {
  if (!validateModernFood(food)) {
    return null;
  }

  const nutrition = food.modernNutrition;
  let totalScore = 0;
  const breakdown = {
    goal_based: 0,
    metabolic_risk: 0,
    digestive: 0,
    lifestyle_load: 0,
    base_quality: 0
  };

  // A) GOAL-BASED SCORING (Weight ×4)
  const goalScore = calculateGoalScore(clinicalProfile, nutrition, food.category);
  breakdown.goal_based = goalScore;
  totalScore += goalScore * 4;

  // B) METABOLIC RISK ADJUSTMENT (Weight ×3)
  const metabolicScore = calculateMetabolicRiskScore(clinicalProfile, nutrition);
  breakdown.metabolic_risk = metabolicScore;
  totalScore += metabolicScore * 3;

  // C) DIGESTIVE ADJUSTMENT (Weight ×2)
  const digestiveScore = calculateDigestiveScore(clinicalProfile, nutrition, food.category);
  breakdown.digestive = digestiveScore;
  totalScore += digestiveScore * 2;

  // D) LIFESTYLE LOAD ADJUSTMENT (Weight ×2)
  const lifestyleScore = calculateLifestyleLoadScore(clinicalProfile, nutrition);
  breakdown.lifestyle_load = lifestyleScore;
  totalScore += lifestyleScore * 2;

  // E) BASE NUTRIENT QUALITY (Weight ×1)
  const qualityScore = calculateBaseQualityScore(nutrition);
  breakdown.base_quality = qualityScore;
  totalScore += qualityScore;

  // Apply Modern Nutrition rules (from modern.rules.js)
  const ruleResult = evaluateModern(clinicalProfile, food);
  totalScore += ruleResult.scoreDelta;

  return {
    food: {
      _id: food._id,
      name: food.name,
      category: food.category
    },
    score: Math.round(totalScore * 10) / 10,
    breakdown,
    modern_data: {
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      fiber: nutrition.fiber || 0
    },
    rule_reasons: ruleResult.reasons,
    rule_warnings: ruleResult.warnings
  };
};

/**
 * A) GOAL-BASED SCORING
 * Rewards foods aligned with user goals
 */
const calculateGoalScore = (clinicalProfile, nutrition, category) => {
  let score = 0;
  const goals = clinicalProfile.goals || [];
  
  const proteinPercent = (nutrition.protein * 4) / nutrition.calories;
  const caloriePerGram = nutrition.calories / 100;
  const carbPercent = (nutrition.carbs * 4) / nutrition.calories;

  // Weight Loss
  if (goals.includes('weight_loss')) {
    // High protein, high fiber, low calorie density
    if (proteinPercent >= 0.20) score += 4;
    if (nutrition.fiber >= 3) score += 3;
    if (caloriePerGram <= 1.5) score += 3;
    if (nutrition.glycemic_index && nutrition.glycemic_index <= 55) score += 3;
    
    // Penalties
    if (caloriePerGram >= 2.5) score -= 4;
    if (nutrition.glycemic_index && nutrition.glycemic_index > 70) score -= 4;
  }

  // Muscle Gain
  if (goals.includes('muscle_gain')) {
    // High protein, moderate-high carbs, adequate calories
    if (nutrition.protein >= 20) score += 4;
    if (caloriePerGram >= 1.8 && caloriePerGram <= 2.5) score += 3;
    if (carbPercent >= 0.40 && carbPercent <= 0.55) score += 2;
    
    // Penalties
    if (nutrition.protein < 10) score -= 3;
  }

  // Metabolic Health / Manage Condition
  if (goals.includes('metabolic_health') || goals.includes('manage_condition')) {
    // Low glycemic load, nutrient-dense, anti-inflammatory
    if (nutrition.glycemic_load && nutrition.glycemic_load < 10) score += 4;
    if (nutrition.micronutrient_density >= 4) score += 3;
    if (nutrition.fiber >= 3) score += 3;
    
    // Penalties
    if (nutrition.inflammatory_score >= 4) score -= 4;
    if (nutrition.saturated_fat > 5) score -= 4;
  }

  // General Health
  if (goals.includes('general_health')) {
    if (nutrition.micronutrient_density >= 3) score += 2;
    if (nutrition.fiber >= 2) score += 1;
  }

  // Athletic Performance
  if (goals.includes('athletic_performance')) {
    if (carbPercent >= 0.45) score += 3;
    if (nutrition.protein >= 15) score += 2;
  }

  return score;
};

/**
 * B) METABOLIC RISK ADJUSTMENT
 * Penalties for foods that worsen metabolic conditions
 */
const calculateMetabolicRiskScore = (clinicalProfile, nutrition) => {
  let score = 0;
  const riskLevel = clinicalProfile.metabolic_risk_level || 'low';
  const riskFlags = clinicalProfile.risk_flags || [];

  let penalties = 0;

  // Diabetes / Prediabetes
  if (riskFlags.includes('diabetes') || riskFlags.includes('prediabetes')) {
    if (nutrition.glycemic_index && nutrition.glycemic_index > 60) penalties += 5;
    if (nutrition.glycemic_load && nutrition.glycemic_load > 15) penalties += 5;
    
    // Reward low GI/GL foods
    if (nutrition.glycemic_index && nutrition.glycemic_index < 55) score += 3;
  }

  // Hypertension
  if (riskFlags.includes('hypertension')) {
    const sodium = nutrition.sodium_mg || (nutrition.sodium * 1000) || 0;
    if (sodium > 400) penalties += 4;
    if (sodium > 800) penalties += 3; // Extra penalty for very high sodium
  }

  // Heart Disease
  if (riskFlags.includes('heart_disease')) {
    if (nutrition.saturated_fat > 5) penalties += 5;
    if (nutrition.trans_fat && nutrition.trans_fat > 0) penalties += 8;
    
    // Reward heart-healthy foods
    if (nutrition.omega3 && nutrition.omega3 > 0.5) score += 3;
  }

  // Kidney Disease
  if (riskFlags.includes('kidney_disease')) {
    if (nutrition.protein > 20) penalties += 4;
    const sodium = nutrition.sodium_mg || (nutrition.sodium * 1000) || 0;
    if (sodium > 300) penalties += 3;
  }

  // Metabolic Syndrome (High Risk)
  if (riskLevel === 'high' || riskLevel === 'very_high') {
    // Extra penalties for processed/refined foods
    if (nutrition.sugar && nutrition.sugar > 10) penalties += 3;
    if (nutrition.fiber < 2) penalties += 2;
  }

  score -= penalties;
  return score;
};

/**
 * C) DIGESTIVE ADJUSTMENT
 * Account for digestive conditions and tolerances
 */
const calculateDigestiveScore = (clinicalProfile, nutrition, category) => {
  let score = 0;
  const digestiveIssues = clinicalProfile.digestive_issues || [];
  const intolerances = clinicalProfile.food_intolerances || [];

  // Acid Reflux / GERD
  if (digestiveIssues.includes('acid_reflux') || digestiveIssues.includes('gerd')) {
    // Avoid high-fat, spicy, acidic foods
    if (nutrition.fat > 15) score -= 4;
    if (category === 'Spice') score -= 3;
    if (category === 'Citrus') score -= 2;
    
    // Reward low-fat, bland foods
    if (nutrition.fat < 5) score += 3;
  }

  // IBS
  if (digestiveIssues.includes('ibs')) {
    // Avoid high FODMAP foods (simplified)
    const highFODMAP = ['Legume', 'Dairy', 'Onion', 'Garlic'];
    if (highFODMAP.includes(category)) score -= 3;
    
    // Reward soluble fiber
    if (nutrition.soluble_fiber && nutrition.soluble_fiber > 2) score += 2;
  }

  // Lactose Intolerance
  if (intolerances.includes('lactose')) {
    if (category === 'Dairy') score -= 10; // Strong penalty
  }

  // Gluten Intolerance / Celiac
  if (intolerances.includes('gluten')) {
    const glutenCategories = ['Grain', 'Bread', 'Pasta'];
    if (glutenCategories.includes(category)) score -= 10; // Strong penalty
  }

  // General Digestive Health
  if (nutrition.fiber >= 3) score += 2; // Fiber supports digestion
  if (nutrition.probiotics && nutrition.probiotics > 0) score += 3; // Probiotic-rich foods

  return score;
};

/**
 * D) LIFESTYLE LOAD ADJUSTMENT
 * Factor in stress, sleep, and activity level
 */
const calculateLifestyleLoadScore = (clinicalProfile, nutrition) => {
  let score = 0;
  const stressLevel = clinicalProfile.stress_level || 'moderate';
  const sleepQuality = clinicalProfile.sleep_quality || 'fair';
  const activityLevel = clinicalProfile.physical_activity_level || 'moderate';

  // High Stress
  if (stressLevel === 'high' || stressLevel === 'very_high') {
    // Reward foods with magnesium, B-vitamins, omega-3
    if (nutrition.magnesium && nutrition.magnesium > 50) score += 2;
    if (nutrition.b_vitamins && nutrition.b_vitamins > 0.2) score += 2;
    if (nutrition.omega3 && nutrition.omega3 > 0.3) score += 2;
    
    // Avoid stimulants (simplified)
    if (nutrition.caffeine && nutrition.caffeine > 50) score -= 3;
  }

  // Poor Sleep
  if (sleepQuality === 'poor' || sleepQuality === 'very_poor') {
    // Reward foods with tryptophan, magnesium
    if (nutrition.tryptophan && nutrition.tryptophan > 0.2) score += 2;
    if (nutrition.magnesium && nutrition.magnesium > 40) score += 2;
    
    // Avoid caffeine
    if (nutrition.caffeine && nutrition.caffeine > 20) score -= 4;
  }

  // High Activity Level
  if (activityLevel === 'high' || activityLevel === 'very_high') {
    // Reward higher calories, protein, carbs
    if (nutrition.carbs >= 15) score += 2;
    if (nutrition.protein >= 15) score += 2;
    if (nutrition.calories >= 150) score += 1;
  }

  // Sedentary
  if (activityLevel === 'sedentary' || activityLevel === 'light') {
    // Reward lower calorie density
    const caloriePerGram = nutrition.calories / 100;
    if (caloriePerGram <= 1.0) score += 2;
  }

  return score;
};

/**
 * E) BASE NUTRIENT QUALITY
 * Intrinsic nutritional value of the food
 */
const calculateBaseQualityScore = (nutrition) => {
  let score = 0;

  // Micronutrient density
  if (nutrition.micronutrient_density >= 5) score += 4;
  else if (nutrition.micronutrient_density >= 4) score += 3;
  else if (nutrition.micronutrient_density >= 3) score += 2;
  else if (nutrition.micronutrient_density >= 2) score += 1;

  // Fiber content
  if (nutrition.fiber >= 5) score += 3;
  else if (nutrition.fiber >= 3) score += 2;
  else if (nutrition.fiber >= 2) score += 1;

  // Protein quality
  if (nutrition.protein >= 20) score += 3;
  else if (nutrition.protein >= 15) score += 2;
  else if (nutrition.protein >= 10) score += 1;

  // Anti-inflammatory score
  if (nutrition.anti_inflammatory_score >= 4) score += 3;
  else if (nutrition.anti_inflammatory_score >= 3) score += 2;

  // Penalties for processed indicators
  if (nutrition.added_sugar && nutrition.added_sugar > 10) score -= 3;
  if (nutrition.preservatives && nutrition.preservatives > 0) score -= 2;
  if (nutrition.artificial_additives && nutrition.artificial_additives > 0) score -= 2;

  return score;
};

/**
 * Score all foods in database or JSON for a clinical profile
 * 
 * @param {Object} clinicalProfile - Output from ClinicalScorer.computeProfile()
 * @returns {Object} Categorized scored foods
 */
const scoreAllFoods = async (clinicalProfile) => {
  try {
    // Load foods from JSON file
    const jsonFoods = loadModernFoods();
    const allFoods = jsonFoods.map(transformJSONFood);
    
    const scoredFoods = [];
    
    allFoods.forEach(food => {
      const scored = scoreFood(clinicalProfile, food);
      if (scored) {
        scoredFoods.push(scored);
      }
    });
    
    // Sort by score descending
    scoredFoods.sort((a, b) => b.score - a.score);
    
    // Categorize foods
    const categorized = {
      highly_recommended: scoredFoods.filter(f => f.score >= 10),
      moderate: scoredFoods.filter(f => f.score >= 0 && f.score < 10),
      avoid: scoredFoods.filter(f => f.score < 0)
    };
    
    return categorized;
    
  } catch (error) {
    console.error('Error scoring foods:', error);
    throw error;
  }
};

module.exports = {
  validateModernFood,
  scoreFood,
  scoreAllFoods,
  loadModernFoods,
  transformJSONFood
};
