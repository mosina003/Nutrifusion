const { createRuleResult } = require('./ruleEngine');
const tcmDietEngine = require('../diet/tcmDietEngine');

/**
 * Traditional Chinese Medicine (TCM) Rule Engine
 * CONSOLIDATED: Delegates to comprehensive TCM Diet Engine
 * Evaluates food based on pattern diagnosis and thermal nature
 */

/**
 * Transform user object to TCM assessment format expected by diet engine
 * @param {Object} user - User profile
 * @returns {Object} - TCM assessment object
 */
const _transformUserToAssessment = (user) => {
  // Priority 1: Use tcmAssessment if available (from dashboard/recent assessment)
  if (user.tcmAssessment && user.tcmAssessment.primary_pattern) {
    return {
      primary_pattern: user.tcmAssessment.primary_pattern,
      secondary_pattern: user.tcmAssessment.secondary_pattern || null,
      cold_heat: user.tcmAssessment.cold_heat || 'Balanced',
      severity: user.tcmAssessment.severity || 2
    };
  }
  
  // Priority 2: Extract from healthProfile TCM data
  const tcmProfile = user.healthProfile?.tcm || {};
  
  // Priority 3: Fallback to user-level TCM properties or defaults
  return {
    primary_pattern: tcmProfile.primary_pattern || user.tcmPattern || 'Balanced',
    secondary_pattern: tcmProfile.secondary_pattern || null,
    cold_heat: tcmProfile.cold_heat || user.tcmConstitution || 'Balanced',
    severity: tcmProfile.severity || 2
  };
};

/**
 * Main TCM evaluation function
 * @param {Object} user - User profile
 * @param {Object} food - Food item
 * @returns {RuleResult} - TCM evaluation with scoring
 */
const evaluateTCM = (user, food) => {
  // Transform user profile to assessment format
  const assessment = _transformUserToAssessment(user);

  // Debug: Log assessment transformation for sample foods
  // if (food.name === 'Pizza' || Math.random() < 0.05) {
  //   console.log(`🔄 [TCM Transform] ${food.name}: assessment=`, JSON.stringify(assessment));
  // }

  // Delegate to comprehensive TCM Diet Engine
  const scored = tcmDietEngine.scoreFood(food, assessment);

  if (!scored.valid) {
    return createRuleResult(0, [], [], false);
  }

  // Convert diet engine score to rule result format
  // Diet engine scores range from -20 to +20, normalize to -15 to +15 for compatibility
  const normalizedScore = Math.round(scored.score * 0.75);
  
  // Debug: Log scoring results for sample foods
  // if (food.name === 'Pizza' || Math.random() < 0.05) {
  //   console.log(`⚖️ [TCM Score] ${food.name}: raw=${scored.score}, normalized=${normalizedScore}, valid=${scored.valid}`);
  // }

  return createRuleResult(
    normalizedScore,
    scored.reasons,
    scored.score < 0 ? [`Low compatibility score (${scored.score})`] : [],
    false
  );
};

module.exports = {
  evaluateTCM
};

