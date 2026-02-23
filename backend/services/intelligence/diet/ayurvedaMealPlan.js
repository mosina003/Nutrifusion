/**
 * Ayurveda 7-Day Meal Plan Generator
 * 
 * Generates balanced meal plans following Ayurvedic principles:
 * - Lunch as main meal (strongest Agni at midday)
 * - Light breakfast and dinner
 * - Avoid Viruddha Ahara (incompatible food combinations)
 * - Seasonal and constitution-appropriate foods
 * - Proper meal timing (breakfast after sunrise, lunch at noon, dinner before sunset)
 */

const { scoreAllFoods } = require('./ayurvedaDietEngine');

/**
 * Incompatible food combinations (Viruddha Ahara)
 * These should NOT be combined in the same meal
 */
const INCOMPATIBLE_COMBINATIONS = [
  { food1: 'Dairy', food2: 'Fruit', reason: 'Milk and fruits create toxins (ama)' },
  { food1: 'Dairy', food2: 'Meat', reason: 'Heavy combination, difficult to digest' },
  { food1: 'Dairy', food2: 'Beverage', reason: 'Milk should not be mixed with caffeinated drinks' },
  { food1: 'Fruit', food2: 'Grain', reason: 'Different digestion rates cause fermentation' },
  { food1: 'Fruit', food2: 'Meat', reason: 'Opposite qualities, creates ama' }
];

/**
 * Check if two food categories are incompatible
 */
const areIncompatible = (category1, category2) => {
  return INCOMPATIBLE_COMBINATIONS.some(combo =>
    (combo.food1 === category1 && combo.food2 === category2) ||
    (combo.food1 === category2 && combo.food2 === category1)
  );
};

/**
 * Generate breakfast meal
 * - Light, easy to digest
 * - Warm, cooked foods preferred
 * - Avoid heavy proteins
 */
const generateBreakfast = (categorizedFoods, agni, usedIngredients, dayNumber) => {
  const { highly_recommended } = categorizedFoods;
  
  // Breakfast categories: Grain, Fruit, Dairy, Beverage
  const breakfastCategories = ['Grain', 'Fruit', 'Dairy', 'Beverage'];
  
  const breakfastFoods = highly_recommended.filter(f => 
    breakfastCategories.includes(f.food.category) &&
    (!f.ayurveda_data.guna || !f.ayurveda_data.guna.includes('Heavy'))
  );
  
  const meal = {
    meal_type: 'Breakfast',
    timing: 'After sunrise (7-8 AM)',
    foods: []
  };
  
  // Select 2-3 light foods
  const grain = breakfastFoods.find(f => 
    f.food.category === 'Grain' && 
    !usedIngredients.grains.has(f.food.name)
  );
  
  const fruit = breakfastFoods.find(f => 
    f.food.category === 'Fruit' && 
    dayNumber % 2 === 0 // Alternate fruit days
  );
  
  const beverage = breakfastFoods.find(f => 
    f.food.category === 'Beverage'
  );
  
  if (grain) {
    meal.foods.push({
      food: grain.food,
      portion: agni === 'Slow' ? 'Small' : 'Medium',
      preparation: 'Cooked, warm'
    });
    usedIngredients.grains.add(grain.food.name);
  }
  
  // Avoid fruit if dairy is present (Viruddha Ahara)
  if (fruit && !meal.foods.some(f => f.food.category === 'Dairy')) {
    meal.foods.push({
      food: fruit.food,
      portion: 'Small',
      preparation: 'Fresh, room temperature'
    });
  }
  
  if (beverage) {
    meal.foods.push({
      food: beverage.food,
      portion: '1 cup',
      preparation: 'Warm'
    });
  }
  
  return meal;
};

/**
 * Generate lunch meal
 * - Main meal of the day (Agni strongest at noon)
 * - Include grain, protein, vegetables
 * - Can be heavier and more substantial
 */
const generateLunch = (categorizedFoods, dominantDosha, usedIngredients, dayNumber) => {
  const { highly_recommended, moderate } = categorizedFoods;
  
  const allFoods = [...highly_recommended, ...moderate];
  
  const meal = {
    meal_type: 'Lunch',
    timing: 'Midday (12-1 PM) - Main meal',
    foods: []
  };
  
  // 1. Grain base
  const grain = allFoods.find(f => 
    f.food.category === 'Grain' && 
    !usedIngredients.grains.has(f.food.name)
  );
  
  // 2. Protein (Legume, Dairy, or light Meat based on dosha)
  let protein;
  if (dominantDosha === 'pitta') {
    // Pitta: avoid meat, prefer legumes/dairy
    protein = allFoods.find(f => 
      (f.food.category === 'Legume' || f.food.category === 'Dairy') &&
      !usedIngredients.proteins.has(f.food.name)
    );
  } else if (dominantDosha === 'kapha') {
    // Kapha: prefer legumes, avoid dairy
    protein = allFoods.find(f => 
      f.food.category === 'Legume' &&
      !usedIngredients.proteins.has(f.food.name)
    );
  } else {
    // Vata: can have any protein
    protein = allFoods.find(f => 
      ['Legume', 'Dairy', 'Meat', 'Nut'].includes(f.food.category) &&
      !usedIngredients.proteins.has(f.food.name)
    );
  }
  
  // 3. Vegetables (2 types)
  const vegetables = allFoods.filter(f => 
    f.food.category === 'Vegetable' &&
    !usedIngredients.vegetables.has(f.food.name)
  ).slice(0, 2);
  
  // 4. Oil/Spice for cooking
  const oil = allFoods.find(f => f.food.category === 'Oil');
  const spice = allFoods.find(f => f.food.category === 'Spice');
  
  // Add to meal
  if (grain) {
    meal.foods.push({
      food: grain.food,
      portion: 'Large',
      preparation: 'Cooked, warm'
    });
    usedIngredients.grains.add(grain.food.name);
  }
  
  if (protein) {
    meal.foods.push({
      food: protein.food,
      portion: 'Medium',
      preparation: protein.food.category === 'Legume' ? 'Well-cooked, spiced' : 'Cooked, warm'
    });
    usedIngredients.proteins.add(protein.food.name);
  }
  
  vegetables.forEach(veg => {
    meal.foods.push({
      food: veg.food,
      portion: 'Medium',
      preparation: dominantDosha === 'vata' ? 'Cooked, oiled' : 'Lightly cooked'
    });
    usedIngredients.vegetables.add(veg.food.name);
  });
  
  if (oil) {
    meal.foods.push({
      food: oil.food,
      portion: dominantDosha === 'kapha' ? 'Small' : 'Medium',
      preparation: 'For cooking'
    });
  }
  
  if (spice) {
    meal.foods.push({
      food: spice.food,
      portion: 'Small',
      preparation: 'Added during cooking'
    });
  }
  
  return meal;
};

/**
 * Generate dinner meal
 * - Light, easy to digest
 * - Eaten early (before sunset ideally)
 * - Warm, cooked foods
 * - Avoid heavy proteins and raw foods
 */
const generateDinner = (categorizedFoods, dominantDosha, agni, usedIngredients) => {
  const { highly_recommended } = categorizedFoods;
  
  const meal = {
    meal_type: 'Dinner',
    timing: 'Early evening (6-7 PM) - Light meal',
    foods: []
  };
  
  // Light dinner: Soup, cooked vegetables, light grain
  const lightFoods = highly_recommended.filter(f => 
    ['Vegetable', 'Grain', 'Spice'].includes(f.food.category) &&
    (!f.ayurveda_data.guna || !f.ayurveda_data.guna.includes('Heavy'))
  );
  
  // Light grain or nothing
  const grain = lightFoods.find(f => 
    f.food.category === 'Grain' &&
    !usedIngredients.grains.has(f.food.name)
  );
  
  // Vegetables (1-2 types, cooked)
  const vegetables = lightFoods.filter(f => 
    f.food.category === 'Vegetable' &&
    !usedIngredients.vegetables.has(f.food.name)
  ).slice(0, 2);
  
  if (grain && agni !== 'Slow') {
    meal.foods.push({
      food: grain.food,
      portion: 'Small',
      preparation: 'Cooked, warm'
    });
    usedIngredients.grains.add(grain.food.name);
  }
  
  vegetables.forEach(veg => {
    meal.foods.push({
      food: veg.food,
      portion: 'Medium',
      preparation: 'Well-cooked, warm, soup or steamed'
    });
    usedIngredients.vegetables.add(veg.food.name);
  });
  
  // Add digestive spices
  const spice = lightFoods.find(f => f.food.category === 'Spice');
  if (spice) {
    meal.foods.push({
      food: spice.food,
      portion: 'Small',
      preparation: 'For digestion'
    });
  }
  
  return meal;
};

/**
 * Generate complete 7-day meal plan
 * 
 * @param {Object} assessmentResult - Ayurveda assessment results
 * @param {Object} categorizedFoods - Foods sorted by recommendation tier
 * @returns {Array} 7-day meal plan
 */
const generateWeeklyPlan = (assessmentResult, categorizedFoods) => {
  const { dominant_dosha, agni } = assessmentResult;
  
  const weeklyPlan = [];
  
  // Track ingredient usage to ensure variety
  const weeklyUsage = {
    grains: new Set(),
    proteins: new Set(),
    vegetables: new Set()
  };
  
  for (let day = 1; day <= 7; day++) {
    // Reset daily usage tracking (but keep weekly limits)
    const dayUsage = {
      grains: new Set(weeklyUsage.grains),
      proteins: new Set(weeklyUsage.proteins),
      vegetables: new Set(weeklyUsage.vegetables)
    };
    
    // Clear weekly sets every 3 days for variety
    if (day % 3 === 0) {
      weeklyUsage.grains.clear();
      weeklyUsage.proteins.clear();
    }
    if (day % 2 === 0) {
      weeklyUsage.vegetables.clear();
    }
    
    const dayPlan = {
      day: day,
      day_name: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day % 7],
      meals: []
    };
    
    // Generate meals
    dayPlan.meals.push(generateBreakfast(categorizedFoods, agni, dayUsage, day));
    dayPlan.meals.push(generateLunch(categorizedFoods, dominant_dosha, dayUsage, day));
    dayPlan.meals.push(generateDinner(categorizedFoods, dominant_dosha, agni, dayUsage));
    
    // Add general guidelines
    dayPlan.guidelines = [
      'Eat in a calm environment',
      'Main meal at midday when Agni is strongest',
      'Avoid cold drinks with meals',
      'Leave 3-4 hours between meals'
    ];
    
    // Dosha-specific guidelines
    if (dominant_dosha === 'vata') {
      dayPlan.guidelines.push('Favor warm, oily, grounding foods');
      dayPlan.guidelines.push('Eat at regular times');
    } else if (dominant_dosha === 'pitta') {
      dayPlan.guidelines.push('Favor cooling, non-spicy foods');
      dayPlan.guidelines.push('Avoid skipping meals');
    } else if (dominant_dosha === 'kapha') {
      dayPlan.guidelines.push('Favor light, dry, warm foods');
      dayPlan.guidelines.push('Can skip breakfast if not hungry');
    }
    
    weeklyPlan.push(dayPlan);
  }
  
  return weeklyPlan;
};

/**
 * Generate meal plan reasoning/summary
 */
const generateReasoning = (assessmentResult, categorizedFoods) => {
  const { dominant_dosha, severity, agni, prakriti, vikriti } = assessmentResult;
  
  return {
    constitution_summary: `Dominant Dosha: ${dominant_dosha.charAt(0).toUpperCase() + dominant_dosha.slice(1)} (${severity === 3 ? 'Severe' : severity === 2 ? 'Moderate' : 'Mild'} imbalance)`,
    agni_type: `Digestive Fire: ${agni}`,
    
    primary_goal: `Balance ${dominant_dosha.charAt(0).toUpperCase() + dominant_dosha.slice(1)} dosha through foods that decrease ${dominant_dosha} qualities`,
    
    dietary_approach: severity >= 2 
      ? `Strict ${dominant_dosha}-pacifying diet with strong emphasis on balancing foods`
      : `Gentle ${dominant_dosha}-balancing diet with moderate restrictions`,
    
    meal_timing: agni === 'Variable' 
      ? 'Regular meal times crucial; avoid skipping meals'
      : agni === 'Sharp'
      ? 'Never skip meals; eat on time to prevent aggravation'
      : agni === 'Slow'
      ? 'Light meals; can skip breakfast if not hungry; avoid overeating'
      : 'Flexible timing; maintain consistency',
    
    key_principles: [
      `Favor foods that DECREASE ${dominant_dosha}`,
      'Lunch as main meal (strongest Agni at midday)',
      'Light, warm breakfast and dinner',
      'Avoid incompatible food combinations (Viruddha Ahara)',
      'Eat seasonally appropriate foods'
    ],
    
    foods_to_emphasize: categorizedFoods.highly_recommended.slice(0, 10).map(f => f.food.name),
    foods_to_avoid: categorizedFoods.avoid.slice(0, 10).map(f => f.food.name)
  };
};

module.exports = {
  generateWeeklyPlan,
  generateReasoning
};
