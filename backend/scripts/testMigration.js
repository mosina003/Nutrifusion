require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const DietPlan = require('../models/DietPlan');

async function testMigration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const user = await User.findOne({ email: 'hyder@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('👤 User:', user.name, `(${user.email})`);
    console.log('   User ID:', user._id);
    console.log('');

    // Check Assessment
    const assessment = await Assessment.findOne({ 
      userId: user._id,
      framework: 'ayurveda',
      isActive: true
    });

    console.log('📋 ASSESSMENT CHECK:');
    if (assessment) {
      console.log('   ✅ Active Ayurveda assessment found');
      console.log('   Assessment ID:', assessment._id);
      console.log('   Created:', assessment.createdAt);
      console.log('   Has old dietPlan field:', !!assessment.dietPlan);
    } else {
      console.log('   ❌ No active assessment');
    }
    console.log('');

    // Check DietPlan collection
    const dietPlans = await DietPlan.find({ userId: user._id });
    
    console.log('🍽️  DIET PLAN CHECK:');
    console.log(`   Total diet plans: ${dietPlans.length}`);
    
    if (dietPlans.length > 0) {
      dietPlans.forEach((plan, index) => {
        console.log(`\n   Plan ${index + 1}:`);
        console.log(`     ID: ${plan._id}`);
        console.log(`     Name: ${plan.planName}`);
        console.log(`     Type: ${plan.planType}`);
        console.log(`     Created by: ${plan.createdByModel}`);
        console.log(`     Status: ${plan.status}`);
        console.log(`     Meals: ${plan.meals.length}`);
        console.log(`     Valid: ${plan.validFrom.toDateString()} → ${plan.validTo.toDateString()}`);
        
        if (plan.metadata?.sourceAssessmentId) {
          console.log(`     ✅ Migrated from assessment: ${plan.metadata.sourceAssessmentId}`);
        }
        
        // Show sample meal
        if (plan.meals.length > 0) {
          const sampleMeal = plan.meals[0];
          console.log(`     Sample meal (Day ${sampleMeal.day}, ${sampleMeal.mealType}):`);
          console.log(`       Foods: ${sampleMeal.foods.join(', ')}`);
        }
      });
    } else {
      console.log('   ❌ No diet plans found');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ MIGRATION TEST COMPLETE');
    console.log('='.repeat(70));

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testMigration();
