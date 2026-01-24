/**
 * Standard Rule Result Format
 * Every medical system rule must return this structure
 */

/**
 * @typedef {Object} RuleResult
 * @property {number} scoreDelta - Change in score (-100 to +100)
 * @property {string[]} reasons - Human-readable reasons for the score
 * @property {string[]} warnings - Cautionary notes
 * @property {boolean} block - If true, item must be excluded
 */

/**
 * Create a standard rule result
 * @param {number} scoreDelta - Score change
 * @param {string[]} reasons - Reasons array
 * @param {string[]} warnings - Warnings array
 * @param {boolean} block - Block flag
 * @returns {RuleResult}
 */
const createRuleResult = (scoreDelta = 0, reasons = [], warnings = [], block = false) => {
  return {
    scoreDelta,
    reasons,
    warnings,
    block
  };
};

/**
 * Merge multiple rule results
 * @param {RuleResult[]} results - Array of rule results
 * @returns {RuleResult} - Combined result
 */
const mergeRuleResults = (results) => {
  return results.reduce((acc, result) => {
    return {
      scoreDelta: acc.scoreDelta + result.scoreDelta,
      reasons: [...acc.reasons, ...result.reasons],
      warnings: [...acc.warnings, ...result.warnings],
      block: acc.block || result.block
    };
  }, createRuleResult());
};

/**
 * Clamp score between min and max
 * @param {number} score 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
const clampScore = (score, min = 0, max = 100) => {
  return Math.max(min, Math.min(max, score));
};

module.exports = {
  createRuleResult,
  mergeRuleResults,
  clampScore
};
