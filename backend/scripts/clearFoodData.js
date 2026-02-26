/**
 * Clear Food Data Script
 * Removes all food documents from MongoDB database
 * Use this before switching to JSON-based food data system
 */

const mongoose = require('mongoose');
require('dotenv').config();
const Food = require('../models/Food');

const clearFoodData = async () => {
  try {
    console.log('\n🗑️  Starting food data cleanup...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Count existing foods
    const existingCount = await Food.countDocuments();
    console.log(`📊 Found ${existingCount} foods in database`);

    if (existingCount === 0) {
      console.log('✅ Database already clean - no foods to remove');
      await mongoose.connection.close();
      return;
    }

    // Delete all foods
    const result = await Food.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} food documents`);

    // Verify deletion
    const remainingCount = await Food.countDocuments();
    console.log(`📊 Remaining foods: ${remainingCount}`);

    if (remainingCount === 0) {
      console.log('\n✅ SUCCESS: All food data cleared from database');
      console.log('💡 System will now use JSON files for food data\n');
    } else {
      console.log('\n⚠️  WARNING: Some foods may still exist in database\n');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error clearing food data:', error);
    process.exit(1);
  }
};

clearFoodData();
