/**
 * Unani Diet Plan Service - Integration Module
 * Combines scoring engine and meal plan generator
 */

const unaniDietEngine = require('./unaniDietEngine');
const unaniMealPlan = require('./unaniMealPlan');
const Food = require('../../../models/Food');

class UnaniDietPlanService {
  /**
   * Generate complete Unani diet plan for user
   * @param {Object} userAssessment - User's Unani assessment result
   * @param {Object} options - Optional configuration
   * @returns {Promise<Object>} - Complete diet plan with rankings and 7-day plan
   */
  async generateDietPlan(userAssessment, options = {}) {
    try {
      // Validate user assessment
      if (!this._validateAssessment(userAssessment)) {
        throw new Error('Invalid user assessment data');
      }

      // Fetch all foods from database
      const foods = await Food.find({ verified: true }).lean();

      if (foods.length === 0) {
        throw new Error('No foods available in database');
      }

      console.log(`📊 Scoring ${foods.length} foods for Unani diet plan...`);

      // Score and rank all foods
      const rankedFoods = unaniDietEngine.scoreAllFoods(foods, userAssessment);

      console.log(`✅ Ranked foods: ${rankedFoods.highly_suitable.length} highly suitable, ${rankedFoods.moderately_suitable.length} moderately suitable, ${rankedFoods.avoid.length} to avoid`);

      // Generate 7-day meal plan
      const mealPlan = unaniMealPlan.generateWeeklyPlan(rankedFoods, userAssessment);

      console.log('✅ Generated 7-day meal plan');

      // Return complete response
      return {
        success: true,
        data: {
          user_profile: {
            primary_mizaj: userAssessment.primary_mizaj,
            secondary_mizaj: userAssessment.secondary_mizaj,
            dominant_humor: userAssessment.dominant_humor,
            severity: userAssessment.severity,
            digestive_strength: userAssessment.digestive_strength
          },
          food_rankings: {
            highly_suitable: rankedFoods.highly_suitable.slice(0, 20).map(f => ({
              name: f.food_name,
              category: f.category,
              score: f.score,
              reasons: f.reasons
            })),
            moderately_suitable: rankedFoods.moderately_suitable.slice(0, 15).map(f => ({
              name: f.food_name,
              category: f.category,
              score: f.score
            })),
            avoid: rankedFoods.avoid.slice(0, 15).map(f => ({
              name: f.food_name,
              category: f.category,
              score: f.score,
              reasons: f.reasons
            }))
          },
          meal_plan: mealPlan
        }
      };
    } catch (error) {
      console.error('Error generating Unani diet plan:', error);
      throw error;
    }
  }

  /**
   * Score a single food for a user
   * @param {Object} food - Food item
   * @param {Object} userAssessment - User's assessment
   * @returns {Object} - Scored food
   */
  scoreSingleFood(food, userAssessment) {
    if (!this._validateAssessment(userAssessment)) {
      throw new Error('Invalid user assessment data');
    }

    return unaniDietEngine.scoreFood(food, userAssessment);
  }

  /**
   * Get food recommendations (without full meal plan)
   * @param {Object} userAssessment - User's assessment
   * @param {Number} limit - Number of recommendations
   * @returns {Promise<Array>} - Top recommended foods
   */
  async getFoodRecommendations(userAssessment, limit = 20) {
    const foods = await Food.find({ verified: true }).lean();
    const rankedFoods = unaniDietEngine.scoreAllFoods(foods, userAssessment);

    return rankedFoods.highly_suitable.slice(0, limit).map(f => ({
      name: f.food_name,
      category: f.category,
      score: f.score,
      reasons: f.reasons,
      temperament: f.rawFood.unani?.temperament,
      humorEffects: f.rawFood.unani?.humorEffects
    }));
  }

  /**
   * Validate user assessment structure
   * @private
   */
  _validateAssessment(assessment) {
    const required = ['primary_mizaj', 'dominant_humor', 'severity', 'digestive_strength'];
    
    for (const field of required) {
      if (!assessment[field]) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // Validate values
    if (!['dam', 'safra', 'balgham', 'sauda'].includes(assessment.primary_mizaj)) {
      console.error(`Invalid primary_mizaj: ${assessment.primary_mizaj}`);
      return false;
    }

    if (assessment.severity < 1 || assessment.severity > 3) {
      console.error(`Invalid severity: ${assessment.severity}`);
      return false;
    }

    const validStrengths = ['weak', 'slow', 'moderate', 'strong', 'strong_but_hot'];
    if (!validStrengths.includes(assessment.digestive_strength)) {
      console.error(`Invalid digestive_strength: ${assessment.digestive_strength}`);
      return false;
    }

    return true;
  }
}

module.exports = new UnaniDietPlanService();
