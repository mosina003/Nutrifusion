/**
 * TCM Diet Plan Service - Integration Module
 * Combines scoring engine and meal plan generator
 */

const tcmDietEngine = require('./tcmDietEngine');
const tcmMealPlan = require('./tcmMealPlan');

class TCMDietPlanService {
  /**
   * Generate complete TCM diet plan for user
   * @param {Object} userAssessment - User's TCM assessment result
   * @param {Object} options - Optional configuration
   * @returns {Promise<Object>} - Complete diet plan with rankings and 7-day plan
   */
  async generateDietPlan(userAssessment, options = {}) {
    try {
      // Validate user assessment
      if (!this._validateAssessment(userAssessment)) {
        throw new Error('Invalid user assessment data');
      }

      console.log('📊 Loading TCM foods from JSON file...');

      // Load all foods from JSON
      const foods = tcmDietEngine.getAllFoods();

      console.log(`📊 Scoring ${foods.length} foods for TCM diet plan...`);

      // Score all foods
      const scoredFoods = foods.map(food => 
        tcmDietEngine.scoreFood(food, userAssessment)
      );

      // Rank foods
      const rankedFoods = tcmDietEngine.rankFoods(scoredFoods);

      console.log(`✅ Ranked foods: ${rankedFoods.recommendation_count} recommended, ${rankedFoods.avoid_count} to avoid`);

      // Generate 7-day meal plan
      const mealPlan = tcmMealPlan.generateWeeklyPlan(rankedFoods, userAssessment);

      console.log('✅ Generated 7-day TCM meal plan');

      // Return complete response
      return {
        success: true,
        data: {
          user_profile: {
            primary_pattern: userAssessment.primary_pattern,
            secondary_pattern: userAssessment.secondary_pattern,
            cold_heat: userAssessment.cold_heat,
            severity: userAssessment.severity
          },
          food_rankings: {
            highly_recommended: rankedFoods.top_ranked_foods.slice(0, 20).map(f => ({
              name: f.food_name,
              category: f.category,
              score: f.score,
              reasons: f.reasons
            })),
            moderately_recommended: rankedFoods.top_ranked_foods.slice(20, 40).map(f => ({
              name: f.food_name,
              category: f.category,
              score: f.score
            })),
            avoid: rankedFoods.avoid_foods.slice(0, 15).map(f => ({
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
      console.error('Error generating TCM diet plan:', error);
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

    return tcmDietEngine.scoreFood(food, userAssessment);
  }

  /**
   * Get food recommendations (without full meal plan)
   * @param {Object} userAssessment - User's assessment
   * @param {Number} limit - Number of recommendations
   * @returns {Promise<Array>} - Top recommended foods
   */
  async getFoodRecommendations(userAssessment, limit = 20) {
    const foods = await Food.find({ verified: true }).lean();
    
    const scoredFoods = foods.map(food => 
      tcmDietEngine.scoreFood(food, userAssessment)
    );

    const rankedFoods = tcmDietEngine.rankFoods(scoredFoods);

    return rankedFoods.top_ranked_foods.slice(0, limit).map(f => ({
      name: f.food_name,
      category: f.category,
      score: f.score,
      reasons: f.reasons,
      thermalNature: f.rawFood.tcm?.thermalNature,
      flavor: f.rawFood.tcm?.flavor,
      properties: {
        tonifies_qi: f.rawFood.tcm?.tonifies_qi,
        nourishes_yin: f.rawFood.tcm?.nourishes_yin,
        warms_yang: f.rawFood.tcm?.warms_yang,
        clears_heat: f.rawFood.tcm?.clears_heat,
        resolves_dampness: f.rawFood.tcm?.resolves_dampness,
        moves_qi: f.rawFood.tcm?.moves_qi
      }
    }));
  }

  /**
   * Validate user assessment structure
   * @private
   */
  _validateAssessment(assessment) {
    const required = ['primary_pattern', 'cold_heat', 'severity'];
    
    for (const field of required) {
      if (!assessment[field]) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // Validate values
    const validPatterns = [
      'Cold Pattern', 'Heat Pattern', 'Qi Deficiency', 'Qi Excess',
      'Dampness', 'Dryness', 'Liver Qi Stagnation', 'Liver Heat',
      'Yin Deficiency', 'Yang Deficiency', 'Balanced'
    ];

    if (!validPatterns.includes(assessment.primary_pattern)) {
      console.error(`Invalid primary_pattern: ${assessment.primary_pattern}`);
      return false;
    }

    if (!['Cold', 'Heat', 'Balanced'].includes(assessment.cold_heat)) {
      console.error(`Invalid cold_heat: ${assessment.cold_heat}`);
      return false;
    }

    if (assessment.severity < 1 || assessment.severity > 3) {
      console.error(`Invalid severity: ${assessment.severity}`);
      return false;
    }

    return true;
  }
}

module.exports = new TCMDietPlanService();
