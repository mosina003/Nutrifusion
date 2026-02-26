require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const DietPlan = require('../models/DietPlan');
const UserActivity = require('../models/UserActivity');

async function testProfileFix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find user
    const user = await User.findOne({ email: 'hyder@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const userId = user._id;
    console.log('✅ User:', user.name, '(', user.email, ')');
    console.log('   User ID:', userId);
    console.log('');

    // Check Assessment with dietPlan
    const assessment = await Assessment.findOne({ 
      userId, 
      isActive: true 
    }).sort({ createdAt: -1 });

    console.log('📋 Assessment Check:');
    if (assessment) {
      console.log('   ✓ Assessment found');
      console.log('   Framework:', assessment.framework);
      console.log('   Has dietPlan:', !!assessment.dietPlan);
      if (assessment.dietPlan && assessment.dietPlan['7_day_plan']) {
        console.log('   Has 7-day plan: YES ✓');
        console.log('   Created:', assessment.createdAt);
      }
    } else {
      console.log('   ✗ No assessment found');
    }
    console.log('');

    // Check DietPlan collection
    const dietPlans = await DietPlan.find({ userId });
    console.log('📊 DietPlan Collection:');
    console.log('   Count:', dietPlans.length);
    console.log('');

    // Calculate what the API should return
    let assessmentDietPlanCount = 0;
    if (assessment && assessment.dietPlan && assessment.dietPlan['7_day_plan']) {
      assessmentDietPlanCount = 1;
    }

    const totalCount = dietPlans.length + assessmentDietPlanCount;

    console.log('🎯 Expected Profile Analytics:');
    console.log('   Practitioner Plans:', dietPlans.length);
    console.log('   Assessment Plans:', assessmentDietPlanCount);
    console.log('   Total dietPlansCount:', totalCount);
    console.log('');

    if (totalCount > 0) {
      console.log('✅ SUCCESS: Profile should now show', totalCount, 'diet plan(s)!');
    } else {
      console.log('⚠️  Still shows 0 diet plans');
    }

    await mongoose.connection.close();
    console.log('\nConnection closed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testProfileFix();
