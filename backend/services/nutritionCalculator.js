const Food = require('../models/Food');

/**
 * Calculate nutrition for a recipe based on its ingredients
 * @param {Array} ingredients - Array of { foodId, quantity, unit }
 * @returns {Object} Nutrition snapshot with calories, protein, carbs, fat, fiber
 */
const calculateRecipeNutrition = async (ingredients) => {
  if (!ingredients || ingredients.length === 0) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };
  }

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  for (const ingredient of ingredients) {
    // Fetch food data
    const food = await Food.findById(ingredient.foodId);
    
    if (!food || !food.modernNutrition) {
      console.warn(`Food not found or missing nutrition data: ${ingredient.foodId}`);
      continue;
    }

    // Convert quantity to grams/ml (base unit for calculation)
    const quantityInGrams = convertToGrams(ingredient.quantity, ingredient.unit);
    
    // Food nutrition is per 100g, so calculate proportionally
    const multiplier = quantityInGrams / 100;

    // Calculate nutrients
    totalCalories += (food.modernNutrition.calories || 0) * multiplier;
    totalProtein += (food.modernNutrition.protein || 0) * multiplier;
    totalCarbs += (food.modernNutrition.carbs || 0) * multiplier;
    totalFat += (food.modernNutrition.fat || 0) * multiplier;
    totalFiber += (food.modernNutrition.fiber || 0) * multiplier;
  }

  // Round to 1 decimal place
  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10
  };
};

/**
 * Convert various units to grams for calculation
 * @param {Number} quantity 
 * @param {String} unit - 'g', 'ml', 'piece', 'cup', 'tbsp', 'tsp'
 * @returns {Number} Quantity in grams
 */
const convertToGrams = (quantity, unit) => {
  switch (unit) {
    case 'g':
      return quantity;
    
    case 'ml':
      // For liquids, 1 ml ≈ 1 g (approximation)
      return quantity;
    
    case 'piece':
      // Average piece weight (can be customized per food)
      return quantity * 100; // Assume 1 piece = 100g
    
    case 'cup':
      // 1 cup ≈ 240 ml ≈ 240g
      return quantity * 240;
    
    case 'tbsp':
      // 1 tablespoon ≈ 15 ml ≈ 15g
      return quantity * 15;
    
    case 'tsp':
      // 1 teaspoon ≈ 5 ml ≈ 5g
      return quantity * 5;
    
    default:
      console.warn(`Unknown unit: ${unit}, defaulting to grams`);
      return quantity;
  }
};

/**
 * Calculate total serving size for a recipe
 * @param {Array} ingredients - Array of { foodId, quantity, unit }
 * @returns {Object} { servingSize: Number, servingUnit: String }
 */
const calculateServingSize = (ingredients) => {
  let totalGrams = 0;

  for (const ingredient of ingredients) {
    totalGrams += convertToGrams(ingredient.quantity, ingredient.unit);
  }

  return {
    servingSize: Math.round(totalGrams),
    servingUnit: 'g'
  };
};

/**
 * Calculate nutrition snapshot for a recipe (includes serving size)
 * @param {Array} ingredients - Array of { foodId, quantity, unit }
 * @returns {Object} Complete nutrition snapshot
 */
const calculateNutritionSnapshot = async (ingredients) => {
  const nutrition = await calculateRecipeNutrition(ingredients);
  const serving = calculateServingSize(ingredients);

  return {
    perServing: true,
    servingSize: serving.servingSize,
    servingUnit: serving.servingUnit,
    ...nutrition
  };
};

module.exports = {
  calculateRecipeNutrition,
  calculateServingSize,
  calculateNutritionSnapshot,
  convertToGrams
};
