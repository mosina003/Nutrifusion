require('dotenv').config();
const mongoose = require('mongoose');
const DietPlan = require('../models/DietPlan');
const User = require('../models/User');

async function checkAllDietPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get all diet plans
    const allPlans = await DietPlan.find({}).lean();
    console.log(`📊 Total Diet Plans in Database: ${allPlans.length}\n`);

    if (allPlans.length > 0) {
      for (let i = 0; i < allPlans.length; i++) {
        const plan = allPlans[i];
        console.log(`\nPlan ${i + 1}:`);
        console.log(`  Plan ID: ${plan._id}`);
        console.log(`  userId: ${plan.userId}`);
        
        // Try to find the user
        const user = await User.findById(plan.userId);
        if (user) {
          console.log(`  User: ${user.name} (${user.email})`);
        } else {
          console.log(`  User: NOT FOUND`);
        }
        
        console.log(`  Plan Name: ${plan.planName}`);
        console.log(`  Status: ${plan.status}`);
        console.log(`  Meals: ${plan.meals?.length || 0}`);
        console.log(`  Created: ${plan.createdAt}`);
      }
    } else {
      console.log('❌ No diet plans exist in the database at all');
    }

    // Also check for the specific user
    const targetUser = await User.findOne({ email: 'hyder@gmail.com' });
    if (targetUser) {
      console.log(`\n\n🎯 Target User ID: ${targetUser._id}`);
      console.log(`   Matching this ID in diet plans...`);
    }

    await mongoose.connection.close();
    console.log('\n\nConnection closed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAllDietPlans();
