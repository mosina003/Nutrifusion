require('dotenv').config();
const mongoose = require('mongoose');
const Food = require('../models/Food');

const checkFoods = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const total = await Food.countDocuments();
    console.log('Total foods:', total);

    const foods = await Food.find().sort({ createdAt: 1 });
    
    console.log('\nAll foods grouped by date:');
    const dateGroups = {};
    foods.forEach(f => {
      const dateKey = f.createdAt ? f.createdAt.toISOString().split('T')[0] : 'no-date';
      if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
      dateGroups[dateKey].push(f.name);
    });

    Object.keys(dateGroups).sort().forEach(date => {
      console.log(`\n${date}: ${dateGroups[date].length} foods`);
      dateGroups[date].forEach(name => console.log(`  - ${name}`));
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkFoods();
