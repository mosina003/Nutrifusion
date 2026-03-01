/**
 * Check Unani Diet Plan in Database
 * Verifies the diet plan structure for a Unani user
 */

require('dotenv').config();
const mongoose = require('mongoose');
const DietPlan = require('../models/DietPlan');
const User = require('../models/User');
const Assessment = require('../models/Assessment');

async function checkUnaniDietPlan() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find Unani users
    const unaniUsers = await User.find({ preferredMedicalFramework: 'unani' });
    console.log(`\n📊 Found ${unaniUsers.length} Unani users`);

    if (unaniUsers.length === 0) {
      console.log('⚠️  No Unani users found');
      process.exit(0);
    }

    // Check each user's diet plan
    for (const user of unaniUsers) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`👤 User: ${user.email}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Has Completed Assessment: ${user.hasCompletedAssessment}`);

      // Find assessment
      const assessment = await Assessment.findOne({
        userId: user._id,
        framework: 'unani',
        isActive: true
      }).sort({ completedAt: -1 });

      if (!assessment) {
        console.log('   ❌ No active Unani assessment found');
        continue;
      }

      console.log(`   ✅ Assessment found: ${assessment._id}`);
      console.log(`      Primary Mizaj: ${assessment.scores?.primary_mizaj}`);
      console.log(`      Dominant Humor: ${assessment.scores?.dominant_humor}`);

      // Find diet plan
      const dietPlan = await DietPlan.findOne({
        userId: user._id,
        planType: 'unani',
        status: 'Active'
      }).sort({ createdAt: -1 });

      if (!dietPlan) {
        console.log('   ❌ No active Unani diet plan found');
        console.log('   🔧 Attempting to regenerate...');
        
        // This would need the unani service to regenerate
        console.log('   ℹ️  User should complete assessment again or we need to trigger regeneration');
        continue;
      }

      console.log(`   ✅ Diet Plan found: ${dietPlan._id}`);
      console.log(`      Plan Type: ${dietPlan.planType}`);
      console.log(`      Status: ${dietPlan.status}`);
      console.log(`      Created: ${dietPlan.createdAt}`);
      console.log(`      Valid From: ${dietPlan.validFrom}`);
      console.log(`      Valid To: ${dietPlan.validTo}`);
      console.log(`      Total Meals: ${dietPlan.meals?.length || 0}`);

      if (dietPlan.meals && dietPlan.meals.length > 0) {
        console.log(`\n   📅 Meals by Day:`);
        
        // Group meals by day
        const mealsByDay = {};
        dietPlan.meals.forEach(meal => {
          if (!mealsByDay[meal.day]) {
            mealsByDay[meal.day] = { breakfast: 0, lunch: 0, dinner: 0 };
          }
          const mealType = meal.mealType.toLowerCase();
          if (mealsByDay[meal.day][mealType] !== undefined) {
            mealsByDay[meal.day][mealType] = meal.foods?.length || 0;
          }
        });

        for (let day = 1; day <= 7; day++) {
          const dayMeals = mealsByDay[day];
          if (dayMeals) {
            console.log(`      Day ${day}: Breakfast (${dayMeals.breakfast} foods), Lunch (${dayMeals.lunch} foods), Dinner (${dayMeals.dinner} foods)`);
          } else {
            console.log(`      Day ${day}: ❌ NO MEALS`);
          }
        }

        // Show sample meal
        console.log(`\n   🍽️  Sample Meal (first meal):`);
        const sampleMeal = dietPlan.meals[0];
        console.log(`      Day: ${sampleMeal.day}`);
        console.log(`      Type: ${sampleMeal.mealType}`);
        console.log(`      Foods: ${JSON.stringify(sampleMeal.foods?.slice(0, 3) || [], null, 2)}`);
      } else {
        console.log(`   ⚠️  Diet plan has NO MEALS - This is the problem!`);
      }

      // Check rules applied
      if (dietPlan.rulesApplied && dietPlan.rulesApplied.length > 0) {
        console.log(`\n   📋 Rules Applied:`);
        dietPlan.rulesApplied.forEach((rule, idx) => {
          console.log(`      ${idx + 1}. Framework: ${rule.framework}`);
          console.log(`         Top Foods: ${rule.details?.topFoods?.length || 0} foods`);
          console.log(`         Reasoning: ${rule.details?.reasoning?.substring(0, 100)}...`);
        });
      }
    }

    console.log(`\n${'='.repeat(80)}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

// Run the check
checkUnaniDietPlan();
