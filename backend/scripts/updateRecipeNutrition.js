require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const nutritionCalculator = require('../services/nutritionCalculator');

const updateRecipeNutrition = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all recipes
    const recipes = await Recipe.find().populate('ingredients.foodId');
    console.log(`\n📊 Found ${recipes.length} recipes to update`);

    let updated = 0;
    let errors = 0;

    for (const recipe of recipes) {
      try {
        console.log(`\n🍽️  Processing: ${recipe.name}`);
        
        // Display current nutrition
        if (recipe.nutrientSnapshot) {
          console.log(`   Current: ${recipe.nutrientSnapshot.calories} cal, ${recipe.nutrientSnapshot.protein}g protein`);
        }

        // Calculate new nutrition
        const calculatedNutrition = await nutritionCalculator.calculateNutritionSnapshot(recipe.ingredients);
        
        console.log(`   Calculated: ${calculatedNutrition.calories} cal, ${calculatedNutrition.protein}g protein`);

        // Update recipe
        recipe.nutrientSnapshot = {
          servingSize: calculatedNutrition.servingSize,
          servingUnit: calculatedNutrition.servingUnit,
          calories: calculatedNutrition.calories,
          protein: calculatedNutrition.protein,
          carbs: calculatedNutrition.carbs,
          fat: calculatedNutrition.fat,
          fiber: calculatedNutrition.fiber
        };

        await recipe.save();
        console.log(`   ✅ Updated!`);
        updated++;
      } catch (error) {
        console.error(`   ❌ Error updating ${recipe.name}:`, error.message);
        errors++;
      }
    }

    console.log(`\n✨ Update complete!`);
    console.log(`   Updated: ${updated} recipes`);
    console.log(`   Errors: ${errors} recipes`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateRecipeNutrition();
