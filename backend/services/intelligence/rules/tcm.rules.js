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
  // Extract TCM assessment from healthProfile or construct from user data
  const tcmProfile = user.healthProfile?.tcm || {};
  
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

  // Delegate to comprehensive TCM Diet Engine
  const scored = tcmDietEngine.scoreFood(food, assessment);

  if (!scored.valid) {
    return createRuleResult(0, [], [], false);
  }

  // Convert diet engine score to rule result format
  // Diet engine scores range from -20 to +20, normalize to -15 to +15 for compatibility
  const normalizedScore = Math.round(scored.score * 0.75);

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
