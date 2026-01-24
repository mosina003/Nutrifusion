const { createRuleResult } = require('./ruleEngine');

/**
 * Modern Nutrition Rule Engine
 * Evaluates food based on scientific nutrition principles
 */

/**
 * Check BMI and calorie compatibility
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkBMICalories = (user, food) => {
  if (!food.modernNutrition || !food.modernNutrition.calories) {
    return createRuleResult(0, [], [], false);
  }

  const { BMI } = user;
  const { calories } = food.modernNutrition;
  
  let scoreDelta = 0;
  const reasons = [];
  const warnings = [];

  if (BMI) {
    if (BMI < 18.5) {
      // Underweight - prefer calorie-dense foods
      if (calories > 150) {
        scoreDelta += 15;
        reasons.push('Calorie-dense food suitable for weight gain');
      } else {
        scoreDelta -= 5;
      }
    } else if (BMI > 25) {
      // Overweight - prefer low-calorie foods
      if (calories < 100) {
        scoreDelta += 15;
        reasons.push('Low-calorie food suitable for weight management');
      } else if (calories > 200) {
        scoreDelta -= 10;
        warnings.push('High-calorie food may hinder weight loss');
      }
    } else {
      // Normal BMI
      scoreDelta += 5;
      reasons.push('Balanced calorie content');
    }
  }

  return createRuleResult(scoreDelta, reasons, warnings, false);
};

/**
 * Check diabetes and carbohydrate limits
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkDiabetes = (user, food) => {
  if (!food.modernNutrition || !food.modernNutrition.carbs) {
    return createRuleResult(0, [], [], false);
  }

  const { medicalConditions } = user;
  const { carbs, fiber } = food.modernNutrition;
  
  let scoreDelta = 0;
  const reasons = [];
  const warnings = [];

  if (medicalConditions && medicalConditions.includes('Diabetes')) {
    const netCarbs = carbs - (fiber || 0);
    
    if (netCarbs < 10) {
      scoreDelta += 20;
      reasons.push('Low net carbs suitable for diabetes management');
    } else if (netCarbs < 20) {
      scoreDelta += 10;
      reasons.push('Moderate carbs with fiber content');
    } else if (netCarbs > 30) {
      scoreDelta -= 25;
      warnings.push('High carbohydrate content may spike blood sugar');
    }

    // High fiber is beneficial
    if (fiber && fiber > 3) {
      scoreDelta += 10;
      reasons.push('High fiber helps regulate blood sugar');
    }
  }

  return createRuleResult(scoreDelta, reasons, warnings, false);
};

/**
 * Check acid reflux and fat/spice compatibility
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkAcidReflux = (user, food) => {
  if (!food.modernNutrition || !food.modernNutrition.fat) {
    return createRuleResult(0, [], [], false);
  }

  const { medicalConditions, cookingMethod } = user;
  const { fat } = food.modernNutrition;
  const category = food.category;
  
  let scoreDelta = 0;
  const reasons = [];
  const warnings = [];

  if (medicalConditions && medicalConditions.includes('Acid Reflux')) {
    // Avoid high-fat foods
    if (fat > 15) {
      scoreDelta -= 20;
      warnings.push('High fat content may trigger acid reflux');
    } else if (fat < 5) {
      scoreDelta += 15;
      reasons.push('Low fat content suitable for acid reflux');
    }

    // Avoid fried foods
    if (cookingMethod === 'Fried' || cookingMethod === 'Deep-fried') {
      scoreDelta -= 25;
      warnings.push('Fried foods aggravate acid reflux');
    }

    // Avoid spicy foods
    if (category === 'Spice') {
      scoreDelta -= 15;
      warnings.push('Spicy foods may worsen acid reflux');
    }
  }

  return createRuleResult(scoreDelta, reasons, warnings, false);
};

/**
 * Check protein adequacy
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkProtein = (user, food) => {
  if (!food.modernNutrition || !food.modernNutrition.protein) {
    return createRuleResult(0, [], [], false);
  }

  const { age, activityLevel } = user;
  const { protein } = food.modernNutrition;
  
  let scoreDelta = 0;
  const reasons = [];

  // High protein is generally beneficial
  if (protein > 10) {
    scoreDelta += 10;
    reasons.push('Good protein content for muscle maintenance');
  }

  // Athletes/active individuals need more protein
  if (activityLevel === 'High' || activityLevel === 'Very High') {
    if (protein > 15) {
      scoreDelta += 15;
      reasons.push('High protein suitable for active lifestyle');
    }
  }

  // Elderly need adequate protein
  if (age && age > 60) {
    if (protein > 8) {
      scoreDelta += 10;
      reasons.push('Adequate protein for seniors');
    }
  }

  return createRuleResult(scoreDelta, reasons, [], false);
};

/**
 * Check micronutrient density
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkMicronutrients = (user, food) => {
  if (!food.modernNutrition || !food.modernNutrition.micronutrients) {
    return createRuleResult(0, [], [], false);
  }

  const { micronutrients } = food.modernNutrition;
  
  let scoreDelta = 0;
  const reasons = [];

  // Count significant micronutrients (> 10% DV)
  const significantNutrients = Object.entries(micronutrients).filter(([key, value]) => value > 10);
  
  if (significantNutrients.length >= 3) {
    scoreDelta += 15;
    const nutrients = significantNutrients.map(([key]) => key).join(', ');
    reasons.push(`Rich in ${nutrients}`);
  } else if (significantNutrients.length > 0) {
    scoreDelta += 5;
    reasons.push('Contains beneficial micronutrients');
  }

  return createRuleResult(scoreDelta, reasons, [], false);
};

/**
 * Main Modern Nutrition evaluation function
 * @param {Object} user - User profile
 * @param {Object} food - Food item
 * @returns {RuleResult} - Combined Modern Nutrition evaluation
 */
const evaluateModern = (user, food) => {
  const results = [
    checkBMICalories(user, food),
    checkDiabetes(user, food),
    checkAcidReflux(user, food),
    checkProtein(user, food),
    checkMicronutrients(user, food)
  ];

  const combined = results.reduce((acc, result) => {
    return {
      scoreDelta: acc.scoreDelta + result.scoreDelta,
      reasons: [...acc.reasons, ...result.reasons],
      warnings: [...acc.warnings, ...result.warnings],
      block: acc.block || result.block
    };
  }, createRuleResult());

  return combined;
};

module.exports = {
  evaluateModern,
  checkBMICalories,
  checkDiabetes,
  checkAcidReflux,
  checkProtein,
  checkMicronutrients
};
