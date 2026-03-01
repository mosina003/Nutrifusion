/**
 * Regenerate Unani Diet Plan for Existing Assessment
 * Fixes missing meals in diet plans
 */

require('dotenv').config();
const mongoose = require('mongoose');
const DietPlan = require('../models/DietPlan');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const unaniDietPlanService = require('../services/intelligence/diet/unaniDietPlanService');

/**
 * Helper function: Convert 7_day_plan format to meals array for DietPlan schema
 */
function convertSevenDayPlanToMeals(sevenDayPlan) {
  const meals = [];
  
  if (!sevenDayPlan) {
    console.log('⚠️  sevenDayPlan is null or undefined');
    return meals;
  }

  console.log('🔍 Converting with keys:', Object.keys(sevenDayPlan));

  for (let day = 1; day <= 7; day++) {
    const dayKey = `day_${day}`;
    const dayData = sevenDayPlan[dayKey];
    
    if (!dayData) {
      console.log(`⚠️  No data for ${dayKey}`);
      continue;
    }

    console.log(`✅ Processing ${dayKey}:`, {
      breakfast: dayData.breakfast?.length || 0,
      lunch: dayData.lunch?.length || 0,
      dinner: dayData.dinner?.length || 0
    });

    // Breakfast
    if (dayData.breakfast && dayData.breakfast.length > 0) {
      meals.push({
        day: day,
        mealType: 'Breakfast',
        foods: dayData.breakfast,
        timing: '7:00 AM - 8:00 AM',
        notes: 'Light, easy to digest'
      });
    }

    // Lunch
    if (dayData.lunch && dayData.lunch.length > 0) {
      meals.push({
        day: day,
        mealType: 'Lunch',
        foods: dayData.lunch,
        timing: '12:00 PM - 1:00 PM',
        notes: 'Main meal of the day'
      });
    }

    // Dinner
    if (dayData.dinner && dayData.dinner.length > 0) {
      meals.push({
        day: day,
        mealType: 'Dinner',
        foods: dayData.dinner,
        timing: '6:00 PM - 7:00 PM',
        notes: 'Light, early meal'
      });
    }
  }

  console.log(`✅ Total meals converted: ${meals.length}`);
  return meals;
}

async function regenerateUnaniDietPlans() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all Unani assessments
    const assessments = await Assessment.find({
      framework: 'unani',
      isActive: true
    }).populate('userId');

    console.log(`📊 Found ${assessments.length} active Unani assessments\n`);

    for (const assessment of assessments) {
      console.log(`${'='.repeat(80)}`);
      console.log(`👤 Processing: ${assessment.userId.email}`);
      console.log(`   Assessment ID: ${assessment._id}`);
      console.log(`   Primary Mizaj: ${assessment.scores?.primary_mizaj}`);
      console.log(`   Dominant Humor: ${assessment.scores?.dominant_humor}\n`);

      try {
        // Generate new diet plan
        console.log('🔄 Generating diet plan...');
        const dietPlanData = await unaniDietPlanService.generateDietPlan(
          assessment.scores,
          {}
        );

        console.log('✅ Diet plan generated');
        console.log('📊 Structure:', {
          hasData: !!dietPlanData.data,
          hasMealPlan: !!dietPlanData.data?.meal_plan,
          has7DayPlan: !!dietPlanData.data?.meal_plan?.['7_day_plan']
        });

        // Extract 7-day plan
        const sevenDayPlan = dietPlanData.data?.meal_plan?.['7_day_plan'];
        
        if (!sevenDayPlan) {
          console.error('❌ No 7_day_plan in generated data');
          continue;
        }

        console.log('📅 7-day plan keys:', Object.keys(sevenDayPlan));

        // Convert to meals
        const meals = convertSevenDayPlanToMeals(sevenDayPlan);

        if (meals.length === 0) {
          console.error('❌ Conversion resulted in 0 meals');
          continue;
        }

        // Delete old diet plans
        await DietPlan.deleteMany({
          userId: assessment.userId._id,
          planType: 'unani'
        });

        console.log('🗑️  Deleted old diet plans');

        // Create new diet plan
        const dietPlan = new DietPlan({
          userId: assessment.userId._id,
          planName: `Unani Auto-Generated Plan`,
          planType: 'unani',
          meals: meals,
          rulesApplied: [{
            framework: 'unani',
            details: {
              reasoning: dietPlanData.data.meal_plan.reasoning_summary || 'Auto-generated from assessment',
              topFoods: dietPlanData.data.meal_plan.top_ranked_foods || [],
              primary_mizaj: assessment.scores.primary_mizaj,
              dominant_humor: assessment.scores.dominant_humor,
              sourceAssessmentId: assessment._id
            }
          }],
          status: 'Active',
          createdBy: assessment.userId._id,
          createdByModel: 'System',
          validFrom: new Date(),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          metadata: {
            sourceAssessmentId: assessment._id,
            generatedAt: new Date(),
            regenerated: true
          }
        });

        await dietPlan.save();
        console.log(`✅ Diet plan saved with ${meals.length} meals`);
        console.log(`   Diet Plan ID: ${dietPlan._id}\n`);

      } catch (error) {
        console.error(`❌ Error processing ${assessment.userId.email}:`, error.message);
        console.error(error.stack);
      }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('✅ Regeneration complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

// Run the regeneration
regenerateUnaniDietPlans();
