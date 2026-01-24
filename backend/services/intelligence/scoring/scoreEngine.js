const { clampScore } = require('../rules/ruleEngine');
const { evaluateAyurveda } = require('../rules/ayurveda.rules');
const { evaluateUnani } = require('../rules/unani.rules');
const { evaluateTCM } = require('../rules/tcm.rules');
const { evaluateModern } = require('../rules/modern.rules');
const { evaluateSafety } = require('../rules/safety.rules');

/**
 * Score Engine - Aggregates scores from all medical systems
 */

/**
 * Calculate final score for a food item
 * @param {Object} user - User profile
 * @param {Object} food - Food item
 * @returns {Object} - {finalScore, reasons, warnings, block, systemScores}
 */
const calculateFoodScore = (user, food) => {
  // Base score
  let finalScore = 50;
  
  const allReasons = [];
  const allWarnings = [];
  let blocked = false;

  // Evaluate all systems
  const ayurvedaResult = evaluateAyurveda(user, food);
  const unaniResult = evaluateUnani(user, food);
  const tcmResult = evaluateTCM(user, food);
  const modernResult = evaluateModern(user, food);
  const safetyResult = evaluateSafety(user, food);

  // Track individual system scores for transparency
  const systemScores = {
    ayurveda: ayurvedaResult.scoreDelta,
    unani: unaniResult.scoreDelta,
    tcm: tcmResult.scoreDelta,
    modern: modernResult.scoreDelta,
    safety: safetyResult.scoreDelta
  };

  // Apply all score deltas
  finalScore += ayurvedaResult.scoreDelta;
  finalScore += unaniResult.scoreDelta;
  finalScore += tcmResult.scoreDelta;
  finalScore += modernResult.scoreDelta;
  finalScore += safetyResult.scoreDelta;

  // Clamp score between 0 and 100
  finalScore = clampScore(finalScore, 0, 100);

  // Aggregate reasons
  allReasons.push(...ayurvedaResult.reasons);
  allReasons.push(...unaniResult.reasons);
  allReasons.push(...tcmResult.reasons);
  allReasons.push(...modernResult.reasons);
  allReasons.push(...safetyResult.reasons);

  // Aggregate warnings
  allWarnings.push(...ayurvedaResult.warnings);
  allWarnings.push(...unaniResult.warnings);
  allWarnings.push(...tcmResult.warnings);
  allWarnings.push(...modernResult.warnings);
  allWarnings.push(...safetyResult.warnings);

  // Check if blocked
  blocked = ayurvedaResult.block || unaniResult.block || tcmResult.block || 
            modernResult.block || safetyResult.block;

  // If blocked, set score to 0
  if (blocked) {
    finalScore = 0;
  }

  return {
    finalScore,
    reasons: allReasons,
    warnings: allWarnings,
    block: blocked,
    systemScores
  };
};

/**
 * Calculate final score for a recipe
 * @param {Object} user - User profile
 * @param {Object} recipe - Recipe with aggregated nutrition
 * @returns {Object} - {finalScore, reasons, warnings, block, systemScores}
 */
const calculateRecipeScore = (user, recipe) => {
  // For recipes, we evaluate the aggregated nutrition as if it's a food item
  // Convert recipe to food-like structure
  const recipeAsFood = {
    name: recipe.name,
    category: recipe.category || 'Recipe',
    tags: recipe.tags || [],
    modernNutrition: recipe.nutritionSummary,
    // For multi-system analysis, use dominant characteristics from ingredients
    ayurveda: recipe.ayurveda || {},
    unani: recipe.unani || {},
    tcm: recipe.tcm || {}
  };

  return calculateFoodScore(user, recipeAsFood);
};

module.exports = {
  calculateFoodScore,
  calculateRecipeScore
};
