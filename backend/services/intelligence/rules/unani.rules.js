const { createRuleResult } = require('./ruleEngine');
const unaniDietEngine = require('../diet/unaniDietEngine');

/**
 * Unani Medicine Rule Engine - Consolidated Version
 * 
 * This file now delegates to the comprehensive unaniDietEngine for scoring,
 * but maintains backward compatibility with the old interface used by scoreEngine.js
 */

/**
 * Transform user profile to assessment format
 * Maps legacy user profile fields to the new assessment structure
 */
const _transformUserToAssessment = (user) => {
  // Extract from user.unaniAssessment if available, otherwise use legacy fields
  const assessment = {
    primary_mizaj: user.unaniAssessment?.primary_mizaj || user.mizaj?.type || 'balanced',
    secondary_mizaj: user.unaniAssessment?.secondary_mizaj || user.mizaj?.secondary || 'balanced',
    dominant_humor: user.unaniAssessment?.dominant_humor || user.mizaj?.type || 'balanced',
    severity: user.unaniAssessment?.severity || 1,
    digestive_strength: user.unaniAssessment?.digestive_strength || user.digestiveStrength || 'moderate'
  };
  
  // If no explicit severity, calculate from mizaj levels
  if (!user.unaniAssessment?.severity && user.mizaj) {
    // Check if there's a clear imbalance
    const mizajLevels = {
      dam: user.mizaj.dam || 25,
      safra: user.mizaj.safra || 25,
      balgham: user.mizaj.balgham || 25,
      sauda: user.mizaj.sauda || 25
    };
    
    const maxLevel = Math.max(...Object.values(mizajLevels));
    const minLevel = Math.min(...Object.values(mizajLevels));
    const difference = maxLevel - minLevel;
    
    // Severity based on imbalance magnitude
    if (difference > 30) assessment.severity = 3;
    else if (difference > 20) assessment.severity = 2;
    else assessment.severity = 1;
  }
  
  return assessment;
};

/**
 * Generate user-friendly reasons from score breakdown
 */
const _generateReasonsFromBreakdown = (breakdown, assessmentResult, food) => {
  const reasons = [];
  const warnings = [];
  
  const { dominant_humor, primary_mizaj } = assessmentResult;
  
  const humorNames = {
    dam: 'Dam (Blood)',
    safra: 'Safra (Yellow Bile)',
    balgham: 'Balgham (Phlegm)',
    sauda: 'Sauda (Black Bile)'
  };
  
  const mizajNames = {
    hot_dry: 'Hot & Dry',
    hot_moist: 'Hot & Moist',
    cold_dry: 'Cold & Dry',
    cold_moist: 'Cold & Moist',
    balanced: 'Balanced'
  };
  
  // Humor correction reasoning
  if (breakdown.humor_correction > 5) {
    reasons.push(`Helps balance ${humorNames[dominant_humor] || dominant_humor} (dominant humor)`);
  } else if (breakdown.humor_correction < -5) {
    warnings.push(`May aggravate ${humorNames[dominant_humor] || dominant_humor} - use with caution`);
  } else if (breakdown.humor_correction > 0) {
    reasons.push(`Neutral to beneficial effect on humor balance`);
  }
  
  // Temperament balance reasoning
  if (breakdown.temperament_balance > 2) {
    reasons.push(`Temperament balances your ${mizajNames[primary_mizaj] || primary_mizaj} constitution`);
  } else if (breakdown.temperament_balance < -2) {
    warnings.push(`Temperament may not suit ${mizajNames[primary_mizaj] || primary_mizaj} constitution`);
  }
  
  // Digestive adjustment reasoning
  if (breakdown.digestive_adjustment > 2) {
    reasons.push('Well-suited for your digestive strength');
  } else if (breakdown.digestive_adjustment < -2) {
    warnings.push('May be difficult to digest - consume in moderation');
  }
  
  return { reasons, warnings };
};

/**
 * Main Unani evaluation function using comprehensive scoring
 * Now delegates to unaniDietEngine for consistent scoring
 * 
 * @param {Object} user - User profile with Unani assessment
 * @param {Object} food - Food item with Unani properties
 * @returns {RuleResult} - Combined Unani evaluation (compatible with scoreEngine)
 */
const evaluateUnani = (user, food) => {
  // If no Unani data, return neutral
  if (!user.unaniAssessment && !user.mizaj) {
    return createRuleResult(0, [], [], false);
  }
  
  if (!food.unani) {
    return createRuleResult(0, [], [], false);
  }
  
  try {
    // Transform legacy user profile to assessment format
    const assessment = _transformUserToAssessment(user);
    
    // Use comprehensive diet engine for scoring
    const result = unaniDietEngine.scoreFood(food, assessment);
    
    // If engine returns null (invalid food), return neutral
    if (!result) {
      return createRuleResult(0, [], [], false);
    }
    
    // Generate user-friendly reasons from breakdown
    const { reasons, warnings } = _generateReasonsFromBreakdown(
      result.breakdown,
      assessment,
      food
    );
    
    // Return in old format for backward compatibility
    return createRuleResult(result.score, reasons, warnings, false);
    
  } catch (error) {
    console.error('Unani evaluation error:', error);
    // Fallback to neutral score on error
    return createRuleResult(0, [], [], false);
  }
};

/**
 * Legacy helper functions - maintained for backward compatibility
 * These now delegate to the main evaluateUnani function
 */
const checkHeatBalance = (user, food) => {
  return evaluateUnani(user, food);
};

const checkMoistureBalance = (user, food) => {
  return evaluateUnani(user, food);
};

const checkDigestionEase = (user, food) => {
  return evaluateUnani(user, food);
};

// Export legacy individual evaluation functions (kept for backward compatibility)
const evaluateHumorCorrection = (user, food) => {
  return evaluateUnani(user, food);
};

const evaluateTemperamentBalance = (user, food) => {
  return evaluateUnani(user, food);
};

const evaluateDigestiveAdjustment = (user, food) => {
  return evaluateUnani(user, food);
};

module.exports = {
  evaluateUnani,
  evaluateHumorCorrection,
  evaluateTemperamentBalance,
  evaluateDigestiveAdjustment,
  // Legacy exports for backward compatibility
  checkHeatBalance,
  checkMoistureBalance,
  checkDigestionEase
};
