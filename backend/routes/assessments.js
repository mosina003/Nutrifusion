const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Assessment = require('../models/Assessment');
const DietPlan = require('../models/DietPlan');
const User = require('../models/User');
const AssessmentEngine = require('../services/assessment');
const questionBanks = require('../services/assessment/questionBanks');
const ayurvedaDietPlanService = require('../services/intelligence/diet/ayurvedaDietPlanService');
const unaniDietPlanService = require('../services/intelligence/diet/unaniDietPlanService');

/**
 * @route   GET /api/assessments/frameworks
 * @desc    Get list of available assessment frameworks
 * @access  Public
 */
router.get('/frameworks', (req, res) => {
  try {
    const frameworks = AssessmentEngine.getAvailableFrameworks();
    res.json({
      success: true,
      frameworks
    });
  } catch (error) {
    console.error('Error fetching frameworks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch frameworks'
    });
  }
});

/**
 * @route   GET /api/assessments/questions/:framework
 * @desc    Get questions for a specific framework
 * @access  Private
 */
router.get('/questions/:framework', protect, (req, res) => {
  try {
    const { framework } = req.params;
    
    // Validate framework
    if (!['ayurveda', 'unani', 'tcm', 'modern'].includes(framework)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid framework'
      });
    }

    const questions = questionBanks[framework];
    
    if (!questions) {
      return res.status(404).json({
        success: false,
        error: 'Questions not found for this framework'
      });
    }

    res.json({
      success: true,
      framework,
      questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
});

/**
 * @route   POST /api/assessments/submit
 * @desc    Submit assessment responses and get health profile
 * @access  Private
 */
router.post('/submit', protect, async (req, res) => {
  try {
    const { framework, responses } = req.body;
    const userId = req.userId;

    // Validate input
    if (!framework || !responses) {
      return res.status(400).json({
        success: false,
        error: 'Framework and responses are required'
      });
    }

    // Validate framework
    if (!['ayurveda', 'unani', 'tcm', 'modern'].includes(framework)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid framework'
      });
    }

    // Process assessment
    try {
      const result = await AssessmentEngine.processAssessment(
        framework,
        responses,
        { userId }
      );

      // Deactivate previous assessments for this framework
      await Assessment.deactivatePreviousAssessments(userId, framework);

      // Save new assessment
      const assessment = new Assessment({
        userId,
        framework,
        responses,
        scores: result.scores,
        healthProfile: result.healthProfile,
        nutritionInputs: result.nutritionInputs,
        completedAt: result.completedAt,
        isActive: true
      });

      await assessment.save();

      // Generate and save diet plan to DietPlan collection
      let dietPlanId = null;
      if (framework === 'ayurveda' && result.scores) {
        try {
          const dietPlanData = await ayurvedaDietPlanService.generateDietPlan(
            result.scores,
            {} // No special preferences
          );
          console.log('✅ Ayurveda diet plan generated successfully');

          // Convert to DietPlan schema
          const meals = convertSevenDayPlanToMeals(dietPlanData['7_day_plan']);
          
          const dietPlan = new DietPlan({
            userId,
            planName: `Ayurveda Auto-Generated Plan`,
            planType: 'ayurveda',
            meals: meals,
            rulesApplied: [{
              framework: 'ayurveda',
              details: {
                reasoning: dietPlanData.reasoning_summary || 'Auto-generated from assessment',
                topFoods: dietPlanData.top_ranked_foods || [],
                avoidFoods: dietPlanData.avoidFoods || [],
                sourceAssessmentId: assessment._id
              }
            }],
            status: 'Active',
            createdBy: userId,
            createdByModel: 'System',
            validFrom: new Date(),
            validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            metadata: {
              sourceAssessmentId: assessment._id,
              generatedAt: new Date()
            }
          });

          await dietPlan.save();
          dietPlanId = dietPlan._id;
          console.log('✅ Ayurveda diet plan saved to DietPlan collection:', dietPlanId);
        } catch (dietPlanError) {
          console.error('⚠️  Ayurveda diet plan generation/save failed:', dietPlanError.message);
          // Continue without diet plan - non-critical error
        }
      } else if (framework === 'unani' && result.scores) {
        try {
          console.log('🔄 Generating Unani diet plan with scores:', JSON.stringify(result.scores, null, 2));
          const dietPlanData = await unaniDietPlanService.generateDietPlan(
            result.scores,
            {} // No special preferences
          );
          console.log('✅ Unani diet plan generated successfully');
          console.log('📊 Diet plan structure keys:', Object.keys(dietPlanData));
          console.log('📊 Has data?', !!dietPlanData.data);
          console.log('📊 Has meal_plan?', !!dietPlanData.data?.meal_plan);
          console.log('📊 Has 7_day_plan?', !!dietPlanData.data?.meal_plan?.['7_day_plan']);

          // Convert to DietPlan schema
          const sevenDayPlan = dietPlanData.data?.meal_plan?.['7_day_plan'];
          console.log('📅 7-day plan type:', typeof sevenDayPlan);
          console.log('📅 7-day plan keys:', Object.keys(sevenDayPlan || {}));
          console.log('📅 Day 1 data:', JSON.stringify(sevenDayPlan?.day_1, null, 2));
          
          const meals = convertSevenDayPlanToMeals(sevenDayPlan);
          console.log('🍽️ Converted meals count:', meals.length);
          if (meals.length > 0) {
            console.log('🍽️ Sample meal:', JSON.stringify(meals[0], null, 2));
          } else {
            console.log('⚠️  NO MEALS CONVERTED - Conversion failed!');
          }
          
          const dietPlan = new DietPlan({
            userId,
            planName: `Unani Auto-Generated Plan`,
            planType: 'unani',
            meals: meals,
            rulesApplied: [{
              framework: 'unani',
              details: {
                reasoning: dietPlanData.data.meal_plan.reasoning_summary || 'Auto-generated from assessment',
                topFoods: dietPlanData.data.meal_plan.top_ranked_foods || [],
                primary_mizaj: result.scores.primary_mizaj,
                dominant_humor: result.scores.dominant_humor,
                sourceAssessmentId: assessment._id
              }
            }],
            status: 'Active',
            createdBy: userId,
            createdByModel: 'System',
            validFrom: new Date(),
            validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            metadata: {
              sourceAssessmentId: assessment._id,
              generatedAt: new Date()
            }
          });

          await dietPlan.save();
          dietPlanId = dietPlan._id;
          console.log('✅ Unani diet plan saved to DietPlan collection:', dietPlanId);
        } catch (dietPlanError) {
          console.error('⚠️  Unani diet plan generation/save failed:', dietPlanError.message);
          console.error('Error details:', dietPlanError);
          // Continue without diet plan - non-critical error
        }
      }

      // Mark user as having completed assessment
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        {
          hasCompletedAssessment: true,
          preferredMedicalFramework: framework,
          // Clear LLM cache so new recommendations are generated for new assessment
          llmCache: null
        },
        { new: true } // Return updated document
      );

      console.log('✅ User assessment status updated:', {
        userId,
        hasCompletedAssessment: updatedUser.hasCompletedAssessment,
        preferredMedicalFramework: updatedUser.preferredMedicalFramework,
        llmCacheCleared: true
      });

      res.json({
        success: true,
        message: 'Assessment completed successfully',
        assessmentId: assessment._id,
        results: {
          framework,
          scores: result.scores,
          healthProfile: result.healthProfile,
          nutritionInputs: result.nutritionInputs
        }
      });
    } catch (validationError) {
      console.error('❌ Assessment validation/processing error:', validationError.message);
      console.error('Error stack:', validationError.stack);
      return res.status(400).json({
        success: false,
        error: validationError.message
      });
    }
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit assessment'
    });
  }
});

/**
 * @route   GET /api/assessments/user/:userId?
 * @desc    Get user's assessment history (defaults to current user)
 * @access  Private
 */
router.get('/user/:userId?', protect, async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;

    // Authorization check: users can only view their own assessments
    // unless they're an admin or practitioner
    if (userId !== req.userId && !req.userRole?.includes('practitioner')) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view these assessments'
      });
    }

    const assessments = await Assessment.find({ userId })
      .sort({ completedAt: -1 })
      .select('-responses'); // Exclude detailed responses for list view

    res.json({
      success: true,
      count: assessments.length,
      assessments
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assessments'
    });
  }
});

/**
 * @route   GET /api/assessments/diet-plan/current
 * @desc    Get current user's diet plan from DietPlan collection (supports all frameworks)
 * @access  Private
 */
router.get('/diet-plan/current', protect, async (req, res) => {
  try {
    const userId = req.userId;

    // Get user to determine preferred framework
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const framework = user.preferredMedicalFramework || 'ayurveda';

    // Find active assessment for user's preferred framework
    const assessment = await Assessment.findOne({ 
      userId, 
      framework: framework,
      isActive: true 
    }).sort({ completedAt: -1 });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: `No active ${framework} assessment found. Please complete an assessment first.`
      });
    }

    // Find active diet plan from DietPlan collection
    const dietPlan = await DietPlan.findOne({
      userId,
      status: 'Active',
      planType: framework,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() }
    }).sort({ createdAt: -1 });

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        error: 'No active diet plan found. Please complete an assessment to generate one.'
      });
    }

    // Convert DietPlan format back to 7_day_plan format for dashboard compatibility
    const sevenDayPlan = convertMealsToSevenDayPlan(dietPlan.meals);
    console.log('✅ Converted diet plan meals to 7-day format');
    console.log('📅 Available days:', Object.keys(sevenDayPlan));
    console.log('📊 Day 1 sample:', JSON.stringify(sevenDayPlan['day_1']));
    console.log('🍽️ Total meals in database:', dietPlan.meals?.length || 0);
    
    const response = {
      '7_day_plan': sevenDayPlan,
      top_ranked_foods: dietPlan.rulesApplied[0]?.details?.topFoods || [],
      reasoning_summary: dietPlan.rulesApplied[0]?.details?.reasoning || 'Auto-generated plan',
      avoidFoods: dietPlan.rulesApplied[0]?.details?.avoidFoods || []
    };

    // Build health profile based on framework
    let healthProfile = {};
    if (framework === 'ayurveda') {
      healthProfile = {
        prakriti: assessment.scores.prakriti,
        vikriti: assessment.scores.vikriti,
        agni: assessment.scores.agni
      };
    } else if (framework === 'unani') {
      healthProfile = {
        primary_mizaj: assessment.scores.primary_mizaj,
        dominant_humor: assessment.scores.dominant_humor,
        digestive_strength: assessment.scores.digestive_strength
      };
    } else if (framework === 'tcm') {
      healthProfile = {
        primary_pattern: assessment.scores.primary_pattern,
        secondary_pattern: assessment.scores.secondary_pattern,
        cold_heat: assessment.scores.cold_heat
      };
    }

    res.json({
      success: true,
      framework: framework,
      dietPlan: response,
      healthProfile: healthProfile,
      metadata: {
        dietPlanId: dietPlan._id,
        validFrom: dietPlan.validFrom,
        validTo: dietPlan.validTo
      }
    });
    
    console.log(`✅ Sent diet plan response for ${framework} framework with ${Object.keys(sevenDayPlan).length} days`);
    
  } catch (error) {
    console.error('Error fetching diet plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch diet plan'
    });
  }
});

/**
 * @route   GET /api/assessments/active/:framework?
 * @desc    Get active assessment for user (optionally filtered by framework)
 * @access  Private
 */
router.get('/active/:framework?', protect, async (req, res) => {
  try {
    const { framework } = req.params;
    const userId = req.userId;

    const query = { userId, isActive: true };
    if (framework) {
      query.framework = framework;
    }

    const assessment = await Assessment.findOne(query).sort({ completedAt: -1 });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'No active assessment found'
      });
    }

    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    console.error('Error fetching active assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active assessment'
    });
  }
});

/**
 * @route   GET /api/assessments/:assessmentId
 * @desc    Get detailed assessment by ID
 * @access  Private
 */
router.get('/:assessmentId', protect, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    // Authorization check
    if (assessment.userId.toString() !== req.userId && !req.userRole?.includes('practitioner')) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this assessment'
      });
    }

    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assessment'
    });
  }
});

/**
 * @route   DELETE /api/assessments/:assessmentId
 * @desc    Delete an assessment
 * @access  Private
 */
router.delete('/:assessmentId', protect, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    // Authorization check
    if (assessment.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this assessment'
      });
    }

    await assessment.deleteOne();

    res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete assessment'
    });
  }
});

/**
 * @route   POST /api/assessments/validate
 * @desc    Validate assessment responses before submission
 * @access  Private
 */
router.post('/validate', protect, async (req, res) => {
  try {
    const { framework, responses } = req.body;

    if (!framework || !responses) {
      return res.status(400).json({
        success: false,
        error: 'Framework and responses are required'
      });
    }

    const engine = AssessmentEngine.getEngine(framework);
    const questionBank = questionBanks[framework];
    const requiredQuestions = questionBank.questions.map(q => q.id);

    const validation = engine.validateResponses(responses, requiredQuestions);

    res.json({
      success: true,
      validation
    });
  } catch (error) {
    console.error('Error validating responses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate responses'
    });
  }
});

/**
 * @route   GET /api/assessments/stats/summary
 * @desc    Get assessment statistics for the current user
 * @access  Private
 */
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const userId = req.userId;

    const stats = await Assessment.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$framework',
          count: { $sum: 1 },
          lastCompleted: { $max: '$completedAt' }
        }
      }
    ]);

    const totalAssessments = await Assessment.countDocuments({ userId });
    const activeAssessments = await Assessment.countDocuments({ userId, isActive: true });

    res.json({
      success: true,
      stats: {
        total: totalAssessments,
        active: activeAssessments,
        byFramework: stats
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

/**
 * Helper function: Convert 7_day_plan format to meals array for DietPlan schema
 */
function convertSevenDayPlanToMeals(sevenDayPlan) {
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

/**
 * Helper function: Convert meals array back to 7_day_plan format for dashboard
 */
function convertMealsToSevenDayPlan(meals) {
  const sevenDayPlan = {};
  
  if (!meals || meals.length === 0) {
    return sevenDayPlan;
  }

  // Initialize all 7 days
  for (let day = 1; day <= 7; day++) {
    sevenDayPlan[`day_${day}`] = {
      breakfast: [],
      lunch: [],
      dinner: []
    };
  }

  // Fill in meals
  meals.forEach(meal => {
    const dayKey = `day_${meal.day}`;
    const mealType = meal.mealType.toLowerCase();
    
    if (sevenDayPlan[dayKey] && meal.foods) {
      sevenDayPlan[dayKey][mealType] = meal.foods;
    }
  });

  return sevenDayPlan;
}

module.exports = router;
