require('dotenv').config();
const mongoose = require('mongoose');
const Food = require('../models/Food');

const removeDuplicates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const foods = await Food.find().sort({ createdAt: 1 });
    
    const seen = new Set();
    const duplicates = [];
    
    foods.forEach(food => {
      const key = food.name.toLowerCase().trim();
      if (seen.has(key)) {
        duplicates.push(food._id);
        console.log(`  Duplicate found: ${food.name}`);
      } else {
        seen.add(key);
      }
    });

    console.log(`\nFound ${duplicates.length} duplicates to remove`);
    
    if (duplicates.length > 0) {
      await Food.deleteMany({ _id: { $in: duplicates } });
      console.log(`✅ Deleted ${duplicates.length} duplicate foods`);
    }

    const remaining = await Food.countDocuments();
    console.log(`\nRemaining unique foods: ${remaining}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

removeDuplicates();
