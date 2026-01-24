/**
 * Quick Database Check - Layer 3 Troubleshooting
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');

    const Food = require('../models/Food');
    const Recipe = require('../models/Recipe');

    // Check foods
    const totalFoods = await Food.countDocuments();
    const approvedFoods = await Food.countDocuments({ isApproved: true });
    
    console.log('📊 FOODS:');
    console.log(`   Total: ${totalFoods}`);
    console.log(`   Approved: ${approvedFoods}`);
    console.log(`   Unapproved: ${totalFoods - approvedFoods}\n`);

    if (totalFoods > 0 && approvedFoods === 0) {
      console.log('⚠️  ISSUE: All foods are unapproved!');
      console.log('   Fixing: Setting all foods to approved...\n');
      
      await Food.updateMany({}, { isApproved: true });
      
      const updatedApproved = await Food.countDocuments({ isApproved: true });
      console.log(`✅ Updated: ${updatedApproved} foods now approved\n`);
    }

    // Check recipes
    const totalRecipes = await Recipe.countDocuments();
    const approvedRecipes = await Recipe.countDocuments({ isApproved: true });
    
    console.log('📊 RECIPES:');
    console.log(`   Total: ${totalRecipes}`);
    console.log(`   Approved: ${approvedRecipes}`);
    console.log(`   Unapproved: ${totalRecipes - approvedRecipes}\n`);

    if (totalRecipes > 0 && approvedRecipes === 0) {
      console.log('⚠️  ISSUE: All recipes are unapproved!');
      console.log('   Fixing: Setting all recipes to approved...\n');
      
      await Recipe.updateMany({}, { isApproved: true });
      
      const updatedApproved = await Recipe.countDocuments({ isApproved: true });
      console.log(`✅ Updated: ${updatedApproved} recipes now approved\n`);
    }

    // Sample a few foods
    const sampleFoods = await Food.find().limit(3).lean();
    console.log('📋 SAMPLE FOODS:');
    sampleFoods.forEach(food => {
      console.log(`   - ${food.name} (${food.category}) - Approved: ${food.isApproved}`);
    });

    console.log('\n✅ Database check complete!');
    console.log('   Now try the recommendation API again.\n');

    mongoose.connection.close();
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });
