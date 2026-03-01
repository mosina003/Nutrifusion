/**
 * Script to update existing Unani assessments with humor percentages
 */

const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
require('dotenv').config();

const calculatePercentages = (humorScores) => {
  const totalScore = Object.values(humorScores).reduce((sum, score) => sum + score, 0);
  const percentages = {};
  
  if (totalScore > 0) {
    for (const [humor, score] of Object.entries(humorScores)) {
      percentages[humor] = Math.round((score / totalScore) * 100);
    }
  }
  
  return percentages;
};

const updateUnaniPercentages = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nutrifusion');
    console.log('📊 Connected to MongoDB');

    // Find all Unani assessments
    const unaniAssessments = await Assessment.find({
      framework: 'unani',
      isActive: true
    });

    console.log(`\n🔍 Found ${unaniAssessments.length} Unani assessments to update\n`);

    let updatedCount = 0;

    for (const assessment of unaniAssessments) {
      const scores = assessment.scores;
      
      if (!scores || !scores.humor_scores) {
        console.log(`⚠️  Assessment ${assessment._id} has no humor_scores, skipping...`);
        continue;
      }

      // Calculate percentages
      const percentages = calculatePercentages(scores.humor_scores);
      
      // Update the assessment
      scores.humor_percentages = percentages;
      assessment.scores = scores;
      assessment.markModified('scores');
      
      await assessment.save();
      
      updatedCount++;
      
      console.log(`✅ Updated assessment for user ${assessment.userId}`);
      console.log(`   Primary: ${scores.primary_mizaj} (${percentages[scores.primary_mizaj]}%)`);
      if (scores.secondary_mizaj) {
        console.log(`   Secondary: ${scores.secondary_mizaj} (${percentages[scores.secondary_mizaj]}%)`);
      }
      console.log(`   Percentages:`, percentages);
      console.log('');
    }

    console.log(`\n✅ Successfully updated ${updatedCount} assessments`);
    
  } catch (error) {
    console.error('❌ Error updating assessments:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
  }
};

updateUnaniPercentages();
