/**
 * Script to fix the licenseNumber index issue
 * Drops the non-sparse licenseNumber_1 index and recreates it as sparse
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutrifusion';

async function fixPractitionerIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('practitioners');

    // Get existing indexes
    const indexes = await collection.indexes();
    console.log('\nCurrent indexes:');
    indexes.forEach(idx => console.log(`  - ${JSON.stringify(idx)}`));

    // Drop the non-sparse licenseNumber_1 index
    try {
      await collection.dropIndex('licenseNumber_1');
      console.log('\n✅ Dropped licenseNumber_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠️  licenseNumber_1 index does not exist (already dropped)');
      } else {
        throw error;
      }
    }

    // Create a sparse unique index for licenseNumber
    await collection.createIndex(
      { licenseNumber: 1 },
      { unique: true, sparse: true }
    );
    console.log('✅ Created sparse unique index for licenseNumber');

    // Verify new indexes
    const newIndexes = await collection.indexes();
    console.log('\nUpdated indexes:');
    newIndexes.forEach(idx => console.log(`  - ${JSON.stringify(idx)}`));

    console.log('\n✅ Index fix completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing index:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

fixPractitionerIndex();
