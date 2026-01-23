require('dotenv').config();
const mongoose = require('mongoose');
const Food = require('../models/Food');

const cleanupOldFoods = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const cutoffDate = new Date('2026-01-06');
    
    const oldFoods = await Food.find({ createdAt: { $lt: cutoffDate } });
    console.log(`\nFound ${oldFoods.length} old food items to delete`);
    
    console.log('\nOld foods being deleted:');
    oldFoods.forEach(f => console.log(`  - ${f.name}`));

    await Food.deleteMany({ createdAt: { $lt: cutoffDate } });
    
    const remaining = await Food.countDocuments();
    console.log(`\n✅ Cleanup complete! Remaining foods: ${remaining}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanupOldFoods();
