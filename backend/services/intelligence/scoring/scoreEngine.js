const { clampScore } = require('../rules/ruleEngine');
const { evaluateAyurveda } = require('../rules/ayurveda.rules');
const { evaluateUnani } = require('../rules/unani.rules');
const { evaluateTCM } = require('../rules/tcm.rules');
const { evaluateModern } = require('../rules/modern.rules');
const { evaluateSafety } = require('../rules/safety.rules');
const { getRuleWeights, applyWeights } = require('../config/configService');

/**
 * Score Engine - Aggregates scores from all medical systems with configurable weights
 */

/**
 * Calculate final score for a food item
 * @param {Object} user - User profile
 * @param {Object} food - Food item
 * @param {Object} options - { applyWeights: true, weights: {} }
 * @returns {Object} - {finalScore, reasons, warnings, block, systemScores}
 */
const calculateFoodScore = async (user, food, options = {}) => {
  const { applyWeights: shouldApplyWeights = true } = options;
  
  // Base score
  let finalScore = 50;
  
  const allReasons = [];
  const allWarnings = [];
  let blocked = false;

  // Determine which framework to use based on user's assessment
  let userFramework = null;
  if (user.assessmentData || user.prakriti || user.vikriti) {
    userFramework = 'ayurveda';
  } else if (user.unaniAssessment) {
    userFramework = 'unani';
  } else if (user.tcmAssessment) {
    userFramework = 'tcm';
  } else if (user.modernAssessment) {
    userFramework = 'modern';
  }

  // Evaluate only the user's framework + safety (always applied)
  let ayurvedaResult = { scoreDelta: 0, reasons: [], warnings: [], block: false };
  let unaniResult = { scoreDelta: 0, reasons: [], warnings: [], block: false };
  let tcmResult = { scoreDelta: 0, reasons: [], warnings: [], block: false };
  let modernResult = { scoreDelta: 0, reasons: [], warnings: [], block: false };
  
  // Only evaluate the framework that matches the user's assessment
  if (userFramework === 'ayurveda' || !userFramework) {
    ayurvedaResult = evaluateAyurveda(user, food);
  } else if (userFramework === 'unani') {
    unaniResult = evaluateUnani(user, food);
  } else if (userFramework === 'tcm') {
    tcmResult = evaluateTCM(user, food);
  } else if (userFramework === 'modern') {
    modernResult = evaluateModern(user, food);
  }
  
  // Always evaluate safety
  const safetyResult = evaluateSafety(user, food);

  // Track individual system scores (raw deltas)
  const systemScores = {
    ayurveda: ayurvedaResult.scoreDelta,
    unani: unaniResult.scoreDelta,
    tcm: tcmResult.scoreDelta,
    modern: modernResult.scoreDelta,
    safety: safetyResult.scoreDelta
  };

  // Apply weights if enabled
  let weightedScores = systemScores;
  if (shouldApplyWeights) {
    const weights = options.weights || await getRuleWeights();
    weightedScores = applyWeights(systemScores, weights);
  }

  // Apply all score deltas
  finalScore += weightedScores.ayurveda;
  finalScore += weightedScores.unani;
  finalScore += weightedScores.tcm;
  finalScore += weightedScores.modern;
  finalScore += weightedScores.safety;

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
    systemScores,
    weightedScores: shouldApplyWeights ? weightedScores : null
  };
};

/**
 * Calculate final score for a recipe
 * @param {Object} user - User profile
 * @param {Object} recipe - Recipe with aggregated nutrition
 * @param {Object} options - { applyWeights: true, weights: {} }
 * @returns {Object} - {finalScore, reasons, warnings, block, systemScores}
 */
const calculateRecipeScore = async (user, recipe, options = {}) => {
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

  return calculateFoodScore(user, recipeAsFood, options);
};

module.exports = {
  calculateFoodScore,
  calculateRecipeScore
};
