const { createRuleResult } = require('./ruleEngine');

/**
 * Safety & Contraindication Rule Engine
 * Hard blocks for unsafe food combinations and contraindications
 */

/**
 * Check allergy contraindications
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkAllergies = (user, food) => {
  const { allergies } = user;
  const { name, category, tags } = food;
  
  if (!allergies || allergies.length === 0) {
    return createRuleResult(0, [], [], false);
  }

  let block = false;
  const warnings = [];

  // Check common allergens
  const allergyMap = {
    'Nuts': ['Nut', 'Almond', 'Cashew', 'Walnut', 'Peanut'],
    'Dairy': ['Dairy', 'Milk', 'Cheese', 'Yogurt', 'Butter'],
    'Gluten': ['Grain', 'Wheat', 'Barley', 'Rye'],
    'Soy': ['Soy', 'Tofu', 'Tempeh'],
    'Shellfish': ['Shrimp', 'Crab', 'Lobster'],
    'Fish': ['Fish', 'Salmon', 'Tuna']
  };

  allergies.forEach(allergy => {
    const allergenKeywords = allergyMap[allergy] || [allergy];
    
    // Check in name, category, and tags
    const hasAllergen = allergenKeywords.some(keyword => 
      name.toLowerCase().includes(keyword.toLowerCase()) ||
      category.toLowerCase().includes(keyword.toLowerCase()) ||
      (tags && tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase())))
    );

    if (hasAllergen) {
      block = true;
      warnings.push(`⛔ BLOCKED: Contains ${allergy} - Known allergen`);
    }
  });

  return createRuleResult(0, [], warnings, block);
};

/**
 * Check diabetes contraindications
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkDiabetesContraindications = (user, food) => {
  const { medicalConditions } = user;
  
  if (!medicalConditions || !medicalConditions.includes('Diabetes')) {
    return createRuleResult(0, [], [], false);
  }

  const { modernNutrition, category, tags } = food;
  
  let block = false;
  const warnings = [];

  // Block high sugar items
  if (modernNutrition && modernNutrition.carbs) {
    const fiber = modernNutrition.fiber || 0;
    const netCarbs = modernNutrition.carbs - fiber;
    
    if (netCarbs > 40) {
      block = true;
      warnings.push('⛔ BLOCKED: Very high carbohydrate content unsuitable for diabetes');
    }
  }

  // Block sugary categories
  const sugaryCat = ['Dessert', 'Sweet', 'Candy', 'Pastry'];
  if (sugaryCat.some(cat => category.toLowerCase().includes(cat.toLowerCase()))) {
    block = true;
    warnings.push('⛔ BLOCKED: Sugary food category not suitable for diabetes');
  }

  // Block foods tagged as high-sugar
  if (tags && tags.some(tag => ['High-Sugar', 'Sweet', 'Sugary'].includes(tag))) {
    block = true;
    warnings.push('⛔ BLOCKED: High sugar content');
  }

  return createRuleResult(0, [], warnings, block);
};

/**
 * Check acid reflux contraindications
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkAcidRefluxContraindications = (user, food) => {
  const { medicalConditions } = user;
  
  if (!medicalConditions || !medicalConditions.includes('Acid Reflux')) {
    return createRuleResult(0, [], [], false);
  }

  const { modernNutrition, category, cookingMethod, tags } = food;
  
  let block = false;
  const warnings = [];

  // Block very high fat foods
  if (modernNutrition && modernNutrition.fat > 25) {
    block = true;
    warnings.push('⛔ BLOCKED: Very high fat content triggers acid reflux');
  }

  // Block fried foods
  if (cookingMethod === 'Fried' || cookingMethod === 'Deep-fried') {
    block = true;
    warnings.push('⛔ BLOCKED: Fried foods aggravate acid reflux');
  }

  // Block spicy category
  if (category === 'Spice' || (tags && tags.includes('Spicy'))) {
    block = true;
    warnings.push('⛔ BLOCKED: Spicy foods worsen acid reflux');
  }

  return createRuleResult(0, [], warnings, block);
};

/**
 * Check hypertension contraindications
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkHypertensionContraindications = (user, food) => {
  const { medicalConditions } = user;
  
  if (!medicalConditions || !medicalConditions.includes('Hypertension')) {
    return createRuleResult(0, [], [], false);
  }

  const { modernNutrition, tags } = food;
  
  let block = false;
  const warnings = [];

  // Block very high sodium foods
  if (modernNutrition && modernNutrition.micronutrients && modernNutrition.micronutrients.sodium) {
    if (modernNutrition.micronutrients.sodium > 40) {
      block = true;
      warnings.push('⛔ BLOCKED: Very high sodium content not suitable for hypertension');
    }
  }

  // Block foods tagged as high-sodium
  if (tags && tags.includes('High-Sodium')) {
    block = true;
    warnings.push('⛔ BLOCKED: High sodium content');
  }

  return createRuleResult(0, [], warnings, block);
};

/**
 * Check kidney disease contraindications
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkKidneyContraindications = (user, food) => {
  const { medicalConditions } = user;
  
  if (!medicalConditions || !medicalConditions.includes('Kidney Disease')) {
    return createRuleResult(0, [], [], false);
  }

  const { modernNutrition } = food;
  
  let block = false;
  const warnings = [];

  // Block very high protein foods
  if (modernNutrition && modernNutrition.protein > 25) {
    block = true;
    warnings.push('⛔ BLOCKED: Very high protein content may strain kidneys');
  }

  // Block high potassium foods
  if (modernNutrition && modernNutrition.micronutrients && modernNutrition.micronutrients.potassium) {
    if (modernNutrition.micronutrients.potassium > 30) {
      block = true;
      warnings.push('⛔ BLOCKED: High potassium content not suitable for kidney disease');
    }
  }

  return createRuleResult(0, [], warnings, block);
};

/**
 * Check dietary preference restrictions
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkDietaryPreferences = (user, food) => {
  const { dietaryPreferences } = user;
  
  if (!dietaryPreferences || dietaryPreferences.length === 0) {
    return createRuleResult(0, [], [], false);
  }

  const { category, tags } = food;
  
  let block = false;
  const warnings = [];

  // Vegetarian check
  if (dietaryPreferences.includes('Vegetarian')) {
    if (category === 'Meat' || category === 'Fish' || category === 'Seafood') {
      block = true;
      warnings.push('⛔ BLOCKED: Non-vegetarian food not aligned with dietary preference');
    }
  }

  // Vegan check
  if (dietaryPreferences.includes('Vegan')) {
    const nonVeganCat = ['Meat', 'Fish', 'Seafood', 'Dairy', 'Egg'];
    if (nonVeganCat.includes(category)) {
      block = true;
      warnings.push('⛔ BLOCKED: Non-vegan food not aligned with dietary preference');
    }
  }

  // Halal check
  if (dietaryPreferences.includes('Halal')) {
    if (tags && tags.includes('Non-Halal')) {
      block = true;
      warnings.push('⛔ BLOCKED: Non-Halal food');
    }
  }

  return createRuleResult(0, [], warnings, block);
};

/**
 * Main Safety evaluation function
 * @param {Object} user - User profile
 * @param {Object} food - Food item
 * @returns {RuleResult} - Combined Safety evaluation
 */
const evaluateSafety = (user, food) => {
  const results = [
    checkAllergies(user, food),
    checkDiabetesContraindications(user, food),
    checkAcidRefluxContraindications(user, food),
    checkHypertensionContraindications(user, food),
    checkKidneyContraindications(user, food),
    checkDietaryPreferences(user, food)
  ];

  const combined = results.reduce((acc, result) => {
    return {
      scoreDelta: acc.scoreDelta + result.scoreDelta,
      reasons: [...acc.reasons, ...result.reasons],
      warnings: [...acc.warnings, ...result.warnings],
      block: acc.block || result.block // OR operation - any block triggers
    };
  }, createRuleResult());

  return combined;
};

module.exports = {
  evaluateSafety,
  checkAllergies,
  checkDiabetesContraindications,
  checkAcidRefluxContraindications,
  checkHypertensionContraindications,
  checkKidneyContraindications,
  checkDietaryPreferences
};
