const { createRuleResult } = require('./ruleEngine');
const { scoreFood } = require('../diet/ayurvedaDietEngine');

/**
 * Ayurveda Rule Engine - Consolidated Version
 * 
 * This file now delegates to the comprehensive ayurvedaDietEngine for scoring,
 * but maintains backward compatibility with the old interface used by scoreEngine.js
 */

/**
 * Transform user profile to assessment format
 * Maps legacy user profile fields to the new assessment structure
 */
const _transformUserToAssessment = (user) => {
  const prakriti = user.prakriti || { vata: 33, pitta: 33, kapha: 33 };
  const vikriti = user.vikriti || prakriti;
  
  // Determine dominant dosha
  let dominantDosha = 'vata';
  let maxValue = vikriti.vata || 33;
  
  if ((vikriti.pitta || 33) > maxValue) {
    dominantDosha = 'pitta';
    maxValue = vikriti.pitta;
  }
  if ((vikriti.kapha || 33) > maxValue) {
    dominantDosha = 'kapha';
    maxValue = vikriti.kapha;
  }
  
  // Calculate severity based on imbalance
  // Severity 1 (mild): 40-50, Severity 2 (moderate): 50-60, Severity 3 (severe): 60+
  let severity = 1;
  if (maxValue > 60) severity = 3;
  else if (maxValue > 50) severity = 2;
  
  // Map digestionIssues to Agni type
  let agni = 'Balanced';
  if (user.digestionIssues === 'Variable' || user.digestionIssues === 'Weak') {
    agni = 'Variable';
  } else if (user.digestionIssues === 'Strong') {
    agni = 'Sharp';
  } else if (user.digestionIssues === 'Slow') {
    agni = 'Slow';
  }
  
  // Use user.agni if available (preferred)
  if (user.agni) {
    agni = user.agni;
  }
  
  return {
    prakriti,
    vikriti,
    agni,
    dominant_dosha: dominantDosha,
    severity
  };
};

/**
 * Generate user-friendly reasons from score breakdown
 */
const _generateReasonsFromBreakdown = (breakdown, assessmentResult, food) => {
  const reasons = [];
  const warnings = [];
  
  const { dominant_dosha } = assessmentResult;
  const doshaName = dominant_dosha.charAt(0).toUpperCase() + dominant_dosha.slice(1);
  
  // Dosha correction reasoning
  if (breakdown.dosha_correction > 5) {
    reasons.push(`Balances your dominant ${doshaName} dosha effectively`);
  } else if (breakdown.dosha_correction < -5) {
    warnings.push(`May aggravate your ${doshaName} dosha - consume with caution`);
  } else if (breakdown.dosha_correction > 0) {
    reasons.push(`Neutral to beneficial effect on ${doshaName} dosha`);
  }
  
  // Agni compatibility reasoning
  if (breakdown.agni_compatibility > 2) {
    reasons.push(`Well-suited for your ${assessmentResult.agni} Agni (digestive fire)`);
  } else if (breakdown.agni_compatibility < -2) {
    warnings.push(`May be difficult to digest with ${assessmentResult.agni} Agni`);
  }
  
  // Virya/Seasonal reasoning
  if (breakdown.virya_seasonal > 1) {
    reasons.push('Potency and seasonal qualities are favorable');
  } else if (breakdown.virya_seasonal < -1) {
    warnings.push('Potency may not be ideal for your constitution');
  }
  
  // Rasa/Guna reasoning
  if (breakdown.rasa_guna > 0.5) {
    reasons.push('Taste and quality profile supports balance');
  }
  
  return { reasons, warnings };
};

/**
 * Main Ayurveda evaluation function
 * Now uses the comprehensive ayurvedaDietEngine for consistent scoring
 * 
 * @param {Object} user - User profile (legacy format)
 * @param {Object} food - Food item
 * @returns {RuleResult} - Combined Ayurveda evaluation (compatible with scoreEngine)
 */
const evaluateAyurveda = (user, food) => {
  // If no Ayurveda data, return neutral
  if (!food.ayurveda || !food.ayurveda.doshaEffect) {
    return createRuleResult(0, [], [], false);
  }
  
  try {
    // Transform legacy user profile to assessment format
    const assessment = _transformUserToAssessment(user);
    
    // Use comprehensive diet engine for scoring
    const result = scoreFood(assessment, food);
    
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
    console.error('Ayurveda evaluation error:', error);
    // Fallback to neutral score on error
    return createRuleResult(0, [], [], false);
  }
};

/**
 * Legacy helper functions - maintained for backward compatibility
 * These now delegate to the main evaluateAyurveda function
 */
const checkDoshaCompatibility = (user, food) => {
  return evaluateAyurveda(user, food);
};

const checkViryaCompatibility = (user, food) => {
  return evaluateAyurveda(user, food);
};

const checkDigestionCompatibility = (user, food) => {
  return evaluateAyurveda(user, food);
};

const checkRasaBalance = (user, food) => {
  return evaluateAyurveda(user, food);
};

module.exports = {
  evaluateAyurveda,
  checkDoshaCompatibility,
  checkViryaCompatibility,
  checkDigestionCompatibility,
  checkRasaBalance
};
