require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Assessment = require('../models/Assessment');

async function checkAssessmentDietPlan() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find user by email
    const user = await User.findOne({ email: 'hyder@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:', user.name);
    console.log('   User ID:', user._id);
    console.log('');

    // Find assessments for this user
    const assessments = await Assessment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📊 Total Assessments: ${assessments.length}\n`);

    if (assessments.length > 0) {
      assessments.forEach((assessment, index) => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Assessment ${index + 1}:`);
        console.log(`  ID: ${assessment._id}`);
        console.log(`  Framework: ${assessment.framework}`);
        console.log(`  Is Active: ${assessment.isActive}`);
        console.log(`  Created: ${assessment.createdAt}`);
        console.log(`  Has dietPlan field: ${assessment.dietPlan ? 'YES ✓' : 'NO ✗'}`);
        
        if (assessment.dietPlan) {
          console.log(`\n  📋 Diet Plan Details:`);
          console.log(`     Type: ${typeof assessment.dietPlan}`);
          
          if (assessment.dietPlan['7_day_plan']) {
            const days = Object.keys(assessment.dietPlan['7_day_plan']);
            console.log(`     Has 7-day plan: YES ✓`);
            console.log(`     Days available: ${days.join(', ')}`);
            console.log(`     Sample day 1:`, JSON.stringify(assessment.dietPlan['7_day_plan'].day_1, null, 2));
          }
          
          if (assessment.dietPlan.top_ranked_foods) {
            console.log(`     Top ranked foods count: ${assessment.dietPlan.top_ranked_foods.length}`);
          }
          
          if (assessment.dietPlan.reasoning_summary) {
            console.log(`     Reasoning summary: ${assessment.dietPlan.reasoning_summary.substring(0, 100)}...`);
          }
          
          console.log(`\n     ⚠️ NOTE: This is stored in Assessment.dietPlan field`);
          console.log(`        NOT in the DietPlan collection!`);
        }
        
        console.log(`${'='.repeat(60)}`);
      });
    } else {
      console.log('❌ No assessments found for this user');
    }

    await mongoose.connection.close();
    console.log('\n\nConnection closed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAssessmentDietPlan();
