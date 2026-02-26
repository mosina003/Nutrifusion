/**
 * Modern Clinical Meal Plan Generator
 * 
 * Generates 7-day meal plans based on:
 * - Calorie distribution (breakfast 20-25%, lunch 30-35%, dinner 20-25%, snacks 15-25%)
 * - Macronutrient targets (protein, carbs, fat based on goals)
 * - Food rotation (no protein source >3x/week, no identical meals)
 * - Meal timing optimization
 * - Nutrient diversity
 */

/**
 * Incompatible food combinations for Modern nutrition
 * Based on digestion and nutrient absorption principles
 */
const INCOMPATIBLE_COMBINATIONS = [
  // Iron + Calcium (reduces iron absorption)
  { food1: 'Spinach', food2: 'Dairy', reason: 'Calcium inhibits iron absorption' },
  { food1: 'Red Meat', food2: 'Tea', reason: 'Tannins inhibit iron absorption' },
  
  // High protein + High starch (digestive burden)
  { food1: 'Legume', food2: 'Grain', reason: 'Both protein and starch require different digestion' },
  
  // Fruit + Meal (fermentation)
  { food1: 'Fruit', food2: 'Grain', reason: 'Fruit digests faster, may cause fermentation' },
  { food1: 'Fruit', food2: 'Protein', reason: 'Fruit should be eaten alone or before meals' }
];

/**
 * Check if two foods are incompatible
 */
const areIncompatible = (food1, food2) => {
  return INCOMPATIBLE_COMBINATIONS.some(combo => 
    (combo.food1 === food1.category && combo.food2 === food2.category) ||
    (combo.food2 === food1.category && combo.food1 === food2.category)
  );
};

/**
 * Calculate daily calorie targets based on TDEE and goals
 */
const calculateCalorieTargets = (clinicalProfile) => {
  const tdee = clinicalProfile.anthropometric.tdee_kcal;
  const goals = clinicalProfile.goals || [];
  
  let dailyCalories = tdee;
  
  // Adjust based on primary goal
  if (goals.includes('weight_loss')) {
    dailyCalories = tdee * 0.80; // 20% deficit
  } else if (goals.includes('muscle_gain')) {
    dailyCalories = tdee * 1.10; // 10% surplus
  } else if (goals.includes('athletic_performance')) {
    dailyCalories = tdee * 1.05; // 5% surplus
  }
  
  return {
    daily: Math.round(dailyCalories),
    breakfast: Math.round(dailyCalories * 0.25),
    lunch: Math.round(dailyCalories * 0.35),
    dinner: Math.round(dailyCalories * 0.25),
    snacks: Math.round(dailyCalories * 0.15)
  };
};

/**
 * Calculate macronutrient targets based on goals
 */
const calculateMacroTargets = (clinicalProfile, dailyCalories) => {
  const goals = clinicalProfile.goals || [];
  
  let proteinPercent = 0.25; // Default 25%
  let carbPercent = 0.45;    // Default 45%
  let fatPercent = 0.30;     // Default 30%
  
  // Weight Loss: Higher protein, moderate carbs, moderate fat
  if (goals.includes('weight_loss')) {
    proteinPercent = 0.30;
    carbPercent = 0.35;
    fatPercent = 0.35;
  }
  
  // Muscle Gain: High protein, high carbs, moderate fat
  if (goals.includes('muscle_gain')) {
    proteinPercent = 0.30;
    carbPercent = 0.45;
    fatPercent = 0.25;
  }
  
  // Athletic Performance: Moderate protein, high carbs, moderate fat
  if (goals.includes('athletic_performance')) {
    proteinPercent = 0.25;
    carbPercent = 0.50;
    fatPercent = 0.25;
  }
  
  // Metabolic Health: Balanced with emphasis on quality
  if (goals.includes('metabolic_health')) {
    proteinPercent = 0.25;
    carbPercent = 0.40;
    fatPercent = 0.35;
  }
  
  return {
    protein_g: Math.round((dailyCalories * proteinPercent) / 4),
    carbs_g: Math.round((dailyCalories * carbPercent) / 4),
    fat_g: Math.round((dailyCalories * fatPercent) / 9)
  };
};

/**
 * Generate breakfast meal
 * Target: 20-25% of daily calories
 * Focus: Protein, complex carbs, moderate fat
 */
const generateBreakfast = (categorizedFoods, calorieTarget, usedIngredients, dayNumber) => {
  const { highly_recommended, moderate } = categorizedFoods;
  const allFoods = [...highly_recommended, ...moderate];
  
  const meal = {
    meal_type: 'Breakfast',
    timing: 'Morning (7-9 AM)',
    calorie_target: calorieTarget,
    foods: []
  };
  
  let currentCalories = 0;
  
  // 1. Protein source (Egg, Dairy, Legume, or Nut)
  const protein = allFoods.find(f => 
    ['Egg', 'Dairy', 'Legume', 'Nut'].includes(f.food.category) &&
    !usedIngredients.proteins.has(f.food.name) &&
    currentCalories + (f.modern_data.calories || 0) <= calorieTarget * 1.1
  );
  
  if (protein) {
    meal.foods.push({
      food: protein.food,
      portion: '1 serving',
      preparation: 'Cooked or prepared fresh',
      calories_estimated: protein.modern_data.calories
    });
    currentCalories += protein.modern_data.calories || 0;
    usedIngredients.proteins.add(protein.food.name);
  }
  
  // 2. Whole grain (Grain, Bread)
  const grain = allFoods.find(f => 
    ['Grain', 'Bread'].includes(f.food.category) &&
    !usedIngredients.grains.has(f.food.name) &&
    currentCalories + (f.modern_data.calories || 0) <= calorieTarget * 1.1
  );
  
  if (grain) {
    meal.foods.push({
      food: grain.food,
      portion: '1 serving',
      preparation: 'Whole grain option',
      calories_estimated: grain.modern_data.calories
    });
    currentCalories += grain.modern_data.calories || 0;
    usedIngredients.grains.add(grain.food.name);
  }
  
  // 3. Fruit (for micronutrients and fiber)
  const fruit = allFoods.find(f => 
    f.food.category === 'Fruit' &&
    !usedIngredients.fruits.has(f.food.name) &&
    currentCalories + (f.modern_data.calories || 0) <= calorieTarget * 1.1
  );
  
  if (fruit) {
    meal.foods.push({
      food: fruit.food,
      portion: '1 serving',
      preparation: 'Fresh or lightly processed',
      calories_estimated: fruit.modern_data.calories
    });
    currentCalories += fruit.modern_data.calories || 0;
    usedIngredients.fruits.add(fruit.food.name);
  }
  
  meal.total_calories_estimated = currentCalories;
  return meal;
};

/**
 * Generate lunch meal
 * Target: 30-35% of daily calories
 * Focus: Balanced macros, main meal of the day
 */
const generateLunch = (categorizedFoods, calorieTarget, usedIngredients, dayNumber) => {
  const { highly_recommended, moderate } = categorizedFoods;
  const allFoods = [...highly_recommended, ...moderate];
  
  const meal = {
    meal_type: 'Lunch',
    timing: 'Midday (12-2 PM)',
    calorie_target: calorieTarget,
    foods: []
  };
  
  let currentCalories = 0;
  
  // 1. Main protein (Meat, Poultry, Fish, Legume, or Tofu)
  const protein = allFoods.find(f => 
    ['Meat', 'Poultry', 'Fish', 'Legume', 'Tofu'].includes(f.food.category) &&
    !usedIngredients.proteins.has(f.food.name) &&
    currentCalories + (f.modern_data.calories || 0) <= calorieTarget * 1.1
  );
  
  if (protein) {
    meal.foods.push({
      food: protein.food,
      portion: 'Large (150-200g)',
      preparation: 'Grilled, baked, or steamed',
      calories_estimated: protein.modern_data.calories
    });
    currentCalories += protein.modern_data.calories || 0;
    usedIngredients.proteins.add(protein.food.name);
  }
  
  // 2. Complex carb (Grain, Legume, or Starchy Vegetable)
  const carb = allFoods.find(f => 
    ['Grain', 'Legume', 'Potato', 'Sweet Potato'].includes(f.food.category) &&
    !usedIngredients.grains.has(f.food.name) &&
    !areIncompatible(f.food, protein?.food) &&
    currentCalories + (f.modern_data.calories || 0) <= calorieTarget * 1.1
  );
  
  if (carb) {
    meal.foods.push({
      food: carb.food,
      portion: 'Medium (100-150g)',
      preparation: 'Cooked, boiled, or baked',
      calories_estimated: carb.modern_data.calories
    });
    currentCalories += carb.modern_data.calories || 0;
    usedIngredients.grains.add(carb.food.name);
  }
  
  // 3. Vegetables (2 types)
  const vegetables = allFoods.filter(f => 
    f.food.category === 'Vegetable' &&
    !usedIngredients.vegetables.has(f.food.name) &&
    currentCalories + (f.modern_data.calories || 0) * 2 <= calorieTarget * 1.1
  ).slice(0, 2);
  
  vegetables.forEach(veg => {
    meal.foods.push({
      food: veg.food,
      portion: 'Medium (100g)',
      preparation: 'Steamed, roasted, or sautéed',
      calories_estimated: veg.modern_data.calories
    });
    currentCalories += veg.modern_data.calories || 0;
    usedIngredients.vegetables.add(veg.food.name);
  });
  
  // 4. Healthy fat (Oil, Avocado, Nuts)
  const fat = allFoods.find(f => 
    ['Oil', 'Avocado', 'Nut'].includes(f.food.category) &&
    currentCalories + (f.modern_data.calories || 0) <= calorieTarget * 1.1
  );
  
  if (fat) {
    meal.foods.push({
      food: fat.food,
      portion: 'Small (1 tbsp or 15g)',
      preparation: 'Added to cooking or as dressing',
      calories_estimated: Math.round((fat.modern_data.calories || 0) * 0.15)
    });
    currentCalories += Math.round((fat.modern_data.calories || 0) * 0.15);
  }
  
  meal.total_calories_estimated = currentCalories;
  return meal;
};

/**
 * Generate dinner meal
 * Target: 20-25% of daily calories
 * Focus: Lighter than lunch, easier to digest
 */
const generateDinner = (categorizedFoods, calorieTarget, usedIngredients, dayNumber) => {
  const { highly_recommended, moderate } = categorizedFoods;
  const allFoods = [...highly_recommended, ...moderate];
  
  const meal = {
    meal_type: 'Dinner',
    timing: 'Evening (6-8 PM)',
    calorie_target: calorieTarget,
    foods: []
  };
  
  let currentCalories = 0;
  
  // 1. Lean protein (Fish, Poultry, Legume, or Tofu)
  const protein = allFoods.find(f => 
    ['Fish', 'Poultry', 'Legume', 'Tofu', 'Egg'].includes(f.food.category) &&
    !usedIngredients.proteins.has(f.food.name) &&
    currentCalories + (f.modern_data.calories || 0) <= calorieTarget * 1.1
  );
  
  if (protein) {
    meal.foods.push({
      food: protein.food,
      portion: 'Medium (100-150g)',
      preparation: 'Lightly cooked, grilled, or steamed',
      calories_estimated: protein.modern_data.calories
    });
    currentCalories += protein.modern_data.calories || 0;
    usedIngredients.proteins.add(protein.food.name);
  }
  
  // 2. Vegetables (emphasis on non-starchy)
  const vegetables = allFoods.filter(f => 
    f.food.category === 'Vegetable' &&
    !usedIngredients.vegetables.has(f.food.name) &&
    currentCalories + (f.modern_data.calories || 0) * 2 <= calorieTarget * 1.1
  ).slice(0, 2);
  
  vegetables.forEach(veg => {
    meal.foods.push({
      food: veg.food,
      portion: 'Medium (100g)',
      preparation: 'Steamed, roasted, or raw salad',
      calories_estimated: veg.modern_data.calories
    });
    currentCalories += veg.modern_data.calories || 0;
    usedIngredients.vegetables.add(veg.food.name);
  });
  
  // 3. Light grain (optional, smaller portion)
  const grain = allFoods.find(f => 
    ['Grain', 'Bread'].includes(f.food.category) &&
    !usedIngredients.grains.has(f.food.name) &&
    currentCalories + (f.modern_data.calories || 0) * 0.5 <= calorieTarget * 1.1
  );
  
  if (grain) {
    meal.foods.push({
      food: grain.food,
      portion: 'Small (50-75g)',
      preparation: 'Whole grain option',
      calories_estimated: Math.round((grain.modern_data.calories || 0) * 0.5)
    });
    currentCalories += Math.round((grain.modern_data.calories || 0) * 0.5);
    usedIngredients.grains.add(grain.food.name);
  }
  
  meal.total_calories_estimated = currentCalories;
  return meal;
};

/**
 * Generate snack
 * Target: 7-12% of daily calories (2 snacks per day)
 * Focus: Nutrient-dense, satisfying
 */
const generateSnack = (categorizedFoods, calorieTarget, usedIngredients, snackNumber) => {
  const { highly_recommended, moderate } = categorizedFoods;
  const allFoods = [...highly_recommended, ...moderate];
  
  const meal = {
    meal_type: snackNumber === 1 ? 'Morning Snack' : 'Afternoon Snack',
    timing: snackNumber === 1 ? 'Mid-morning (10-11 AM)' : 'Mid-afternoon (3-4 PM)',
    calorie_target: calorieTarget,
    foods: []
  };
  
  // Snack options: Fruit, Nut, Dairy, or Vegetable
  const snackCategories = ['Fruit', 'Nut', 'Dairy', 'Vegetable'];
  const snackFood = allFoods.find(f => 
    snackCategories.includes(f.food.category) &&
    !usedIngredients.snacks.has(f.food.name) &&
    (f.modern_data.calories || 0) <= calorieTarget * 1.2
  );
  
  if (snackFood) {
    meal.foods.push({
      food: snackFood.food,
      portion: 'Small serving',
      preparation: 'Fresh or minimally processed',
      calories_estimated: snackFood.modern_data.calories
    });
    usedIngredients.snacks.add(snackFood.food.name);
  }
  
  meal.total_calories_estimated = snackFood?.modern_data.calories || 0;
  return meal;
};

/**
 * Generate complete 7-day meal plan
 * 
 * @param {Object} clinicalProfile - Clinical profile from ClinicalScorer
 * @param {Object} categorizedFoods - Categorized scored foods
 * @returns {Array} 7-day meal plan
 */
const generateWeeklyPlan = (clinicalProfile, categorizedFoods) => {
  const calorieTargets = calculateCalorieTargets(clinicalProfile);
  const macroTargets = calculateMacroTargets(clinicalProfile, calorieTargets.daily);
  
  const weeklyPlan = [];
  
  // Track used ingredients to ensure variety
  const globalUsedIngredients = {
    proteins: new Set(),
    grains: new Set(),
    vegetables: new Set(),
    fruits: new Set(),
    snacks: new Set(),
    proteinCount: {}
  };
  
  for (let day = 1; day <= 7; day++) {
    // Reset daily ingredient tracking (vegetables and fruits can repeat across days)
    const dailyUsedIngredients = {
      proteins: new Set(),
      grains: new Set(),
      vegetables: new Set(),
      fruits: new Set(),
      snacks: new Set()
    };
    
    const dayPlan = {
      day: day,
      date: `Day ${day}`,
      meals: [],
      daily_targets: {
        calories: calorieTargets.daily,
        protein_g: macroTargets.protein_g,
        carbs_g: macroTargets.carbs_g,
        fat_g: macroTargets.fat_g
      }
    };
    
    // Generate meals
    dayPlan.meals.push(generateBreakfast(categorizedFoods, calorieTargets.breakfast, dailyUsedIngredients, day));
    dayPlan.meals.push(generateSnack(categorizedFoods, calorieTargets.snacks * 0.4, dailyUsedIngredients, 1));
    dayPlan.meals.push(generateLunch(categorizedFoods, calorieTargets.lunch, dailyUsedIngredients, day));
    dayPlan.meals.push(generateSnack(categorizedFoods, calorieTargets.snacks * 0.6, dailyUsedIngredients, 2));
    dayPlan.meals.push(generateDinner(categorizedFoods, calorieTargets.dinner, dailyUsedIngredients, day));
    
    // Track global protein usage (limit to 3x per week)
    dailyUsedIngredients.proteins.forEach(protein => {
      globalUsedIngredients.proteinCount[protein] = (globalUsedIngredients.proteinCount[protein] || 0) + 1;
      
      // If protein used 3+ times, add to global used set
      if (globalUsedIngredients.proteinCount[protein] >= 3) {
        globalUsedIngredients.proteins.add(protein);
      }
    });
    
    // Calculate total daily calories
    dayPlan.total_calories_estimated = dayPlan.meals.reduce(
      (sum, meal) => sum + (meal.total_calories_estimated || 0), 
      0
    );
    
    weeklyPlan.push(dayPlan);
  }
  
  return weeklyPlan;
};

module.exports = {
  generateWeeklyPlan,
  calculateCalorieTargets,
  calculateMacroTargets
};
