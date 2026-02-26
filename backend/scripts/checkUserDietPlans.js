require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const DietPlan = require('../models/DietPlan');

async function checkDietPlans() {
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
    console.log('   Email:', user.email);
    console.log('');

    // Find diet plans for this user
    const dietPlans = await DietPlan.find({ userId: user._id })
      .populate('meals.recipeId', 'name')
      .lean();

    console.log(`📊 Total Diet Plans: ${dietPlans.length}\n`);

    if (dietPlans.length > 0) {
      dietPlans.forEach((plan, index) => {
        console.log(`Diet Plan ${index + 1}:`);
        console.log(`  ID: ${plan._id}`);
        console.log(`  Name: ${plan.planName}`);
        console.log(`  Status: ${plan.status}`);
        console.log(`  Created: ${plan.createdAt}`);
        console.log(`  Meals: ${plan.meals.length}`);
        console.log(`  userId field: ${plan.userId}`);
        console.log('');
      });
    } else {
      console.log('❌ No diet plans found for this user');
    }

    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDietPlans();
