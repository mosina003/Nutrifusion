require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const { calculateNutritionSnapshot } = require('../services/nutritionCalculator');

const testNutritionCalculation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Vegetable Khichdi recipe
    const recipe = await Recipe.findOne({ name: 'Vegetable Khichdi' }).populate('ingredients.foodId');

    if (!recipe) {
      console.log('❌ Vegetable Khichdi recipe not found');
      process.exit(1);
    }

    console.log('📋 Recipe: ' + recipe.name);
    console.log('\n🥘 Ingredients:');
    recipe.ingredients.forEach(ing => {
      console.log(`  - ${ing.foodId.name}: ${ing.quantity}${ing.unit}`);
    });

    console.log('\n📊 Current Nutrition Snapshot (manually entered):');
    console.log(`  Serving Size: ${recipe.nutrientSnapshot.servingSize}${recipe.nutrientSnapshot.servingUnit}`);
    console.log(`  Calories: ${recipe.nutrientSnapshot.calories}`);
    console.log(`  Protein: ${recipe.nutrientSnapshot.protein}g`);
    console.log(`  Carbs: ${recipe.nutrientSnapshot.carbs}g`);
    console.log(`  Fat: ${recipe.nutrientSnapshot.fat}g`);
    console.log(`  Fiber: ${recipe.nutrientSnapshot.fiber}g`);

    // Calculate nutrition using our service
    console.log('\n🧮 Calculating nutrition from ingredients...');
    const calculatedNutrition = await calculateNutritionSnapshot(recipe.ingredients);

    console.log('\n✨ CALCULATED Nutrition Snapshot:');
    console.log(`  Serving Size: ${calculatedNutrition.servingSize}${calculatedNutrition.servingUnit}`);
    console.log(`  Calories: ${calculatedNutrition.calories}`);
    console.log(`  Protein: ${calculatedNutrition.protein}g`);
    console.log(`  Carbs: ${calculatedNutrition.carbs}g`);
    console.log(`  Fat: ${calculatedNutrition.fat}g`);
    console.log(`  Fiber: ${calculatedNutrition.fiber}g`);

    // Compare
    console.log('\n📈 Comparison:');
    const caloriesDiff = calculatedNutrition.calories - recipe.nutrientSnapshot.calories;
    const proteinDiff = calculatedNutrition.protein - recipe.nutrientSnapshot.protein;
    const carbsDiff = calculatedNutrition.carbs - recipe.nutrientSnapshot.carbs;
    const fatDiff = calculatedNutrition.fat - recipe.nutrientSnapshot.fat;
    const fiberDiff = calculatedNutrition.fiber - recipe.nutrientSnapshot.fiber;

    console.log(`  Calories: ${caloriesDiff > 0 ? '+' : ''}${caloriesDiff}`);
    console.log(`  Protein: ${proteinDiff > 0 ? '+' : ''}${proteinDiff}g`);
    console.log(`  Carbs: ${carbsDiff > 0 ? '+' : ''}${carbsDiff}g`);
    console.log(`  Fat: ${fatDiff > 0 ? '+' : ''}${fatDiff}g`);
    console.log(`  Fiber: ${fiberDiff > 0 ? '+' : ''}${fiberDiff}g`);

    console.log('\n✅ Test complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testNutritionCalculation();
