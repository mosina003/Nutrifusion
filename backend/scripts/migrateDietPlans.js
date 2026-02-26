require('dotenv').config();
const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const DietPlan = require('../models/DietPlan');
const User = require('../models/User');

/**
 * Migration Script: Move diet plans from Assessment.dietPlan to DietPlan collection
 * 
 * This ensures:
 * 1. All diet plans are in one collection
 * 2. Practitioners can edit auto-generated plans
 * 3. Unified tracking and management
 */

async function migrateDietPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all assessments with dietPlan field
    const assessmentsWithPlans = await Assessment.find({
      dietPlan: { $exists: true, $ne: null }
    }).lean();

    console.log(`📊 Found ${assessmentsWithPlans.length} assessments with diet plans\n`);

    if (assessmentsWithPlans.length === 0) {
      console.log('✨ No assessments to migrate. Exiting...');
      await mongoose.connection.close();
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const assessment of assessmentsWithPlans) {
      try {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`Processing Assessment: ${assessment._id}`);
        console.log(`  User ID: ${assessment.userId}`);
        console.log(`  Framework: ${assessment.framework}`);
        
        // Check if already migrated (look for existing DietPlan created from this assessment)
        const existingPlan = await DietPlan.findOne({
          userId: assessment.userId,
          'metadata.sourceAssessmentId': assessment._id
        });

        if (existingPlan) {
          console.log(`  ⏭️  SKIPPED - Already migrated (DietPlan ID: ${existingPlan._id})`);
          skippedCount++;
          continue;
        }

        // Get user info
        const user = await User.findById(assessment.userId);
        if (!user) {
          console.log(`  ❌ ERROR - User not found`);
          errorCount++;
          continue;
        }

        console.log(`  User: ${user.name} (${user.email})`);

        // Convert 7_day_plan to meals array
        const meals = convertToMealsArray(assessment.dietPlan['7_day_plan']);
        
        console.log(`  📋 Converted ${meals.length} meals from 7-day plan`);

        // Create DietPlan document
        const dietPlan = new DietPlan({
          userId: assessment.userId,
          planName: `${capitalizeFirst(assessment.framework)} Auto-Generated Plan`,
          planType: assessment.framework,
          meals: meals,
          rulesApplied: [{
            framework: assessment.framework,
            details: {
              reasoning: assessment.dietPlan.reasoning_summary || 'Auto-generated from assessment',
              topFoods: assessment.dietPlan.top_ranked_foods || [],
              avoidFoods: assessment.dietPlan.avoidFoods || [],
              sourceAssessmentId: assessment._id
            }
          }],
          status: 'Active',
          createdBy: assessment.userId,
          createdByModel: 'System',
          validFrom: assessment.completedAt || assessment.createdAt,
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          metadata: {
            sourceAssessmentId: assessment._id,
            migratedAt: new Date(),
            originalDietPlan: assessment.dietPlan // Keep backup
          }
        });

        await dietPlan.save();
        console.log(`  ✅ MIGRATED - New DietPlan ID: ${dietPlan._id}`);
        console.log(`     Status: ${dietPlan.status}`);
        console.log(`     Meals: ${dietPlan.meals.length}`);
        
        migratedCount++;

        // Optional: Clear dietPlan from assessment (or keep as backup)
        // await Assessment.findByIdAndUpdate(assessment._id, {
        //   $set: { 'metadata.dietPlanId': dietPlan._id },
        //   $unset: { dietPlan: 1 }
        // });

      } catch (error) {
        console.log(`  ❌ ERROR - ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log('\n📊 MIGRATION SUMMARY:');
    console.log(`   ✅ Migrated: ${migratedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${assessmentsWithPlans.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Migration complete. Database connection closed.\n');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Convert 7_day_plan format to meals array
 */
function convertToMealsArray(sevenDayPlan) {
  const meals = [];
  
  if (!sevenDayPlan) {
    return meals;
  }

  for (let day = 1; day <= 7; day++) {
    const dayKey = `day_${day}`;
    const dayData = sevenDayPlan[dayKey];
    
    if (!dayData) continue;

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

  return meals;
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Run migration
migrateDietPlans();
