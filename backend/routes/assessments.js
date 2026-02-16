const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const AssessmentEngine = require('../services/assessment');
const questionBanks = require('../services/assessment/questionBanks');

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

      // Mark user as having completed assessment
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        {
          hasCompletedAssessment: true,
          preferredMedicalFramework: framework
        },
        { new: true } // Return updated document
      );

      console.log('✅ User assessment status updated:', {
        userId,
        hasCompletedAssessment: updatedUser.hasCompletedAssessment,
        preferredMedicalFramework: updatedUser.preferredMedicalFramework
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

module.exports = router;
