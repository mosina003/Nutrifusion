const { createRuleResult } = require('./ruleEngine');

/**
 * Ayurveda Rule Engine
 * Evaluates food compatibility based on Ayurvedic principles
 */

/**
 * Check dosha compatibility with food
 * @param {Object} user - User with prakriti/vikriti
 * @param {Object} food - Food with ayurveda data
 * @returns {RuleResult}
 */
const checkDoshaCompatibility = (user, food) => {
  if (!food.ayurveda || !food.ayurveda.doshaEffect) {
    return createRuleResult(0, [], [], false);
  }

  const { prakriti } = user;
  const { doshaEffect } = food.ayurveda;
  
  let scoreDelta = 0;
  const reasons = [];
  const warnings = [];

  // Determine dominant dosha
  let dominantDosha = 'vata';
  let dominantValue = prakriti?.vata || 33;
  
  if ((prakriti?.pitta || 33) > dominantValue) {
    dominantDosha = 'pitta';
    dominantValue = prakriti.pitta;
  }
  if ((prakriti?.kapha || 33) > dominantValue) {
    dominantDosha = 'kapha';
    dominantValue = prakriti.kapha;
  }

  // Check effect on dominant dosha
  const effect = doshaEffect[dominantDosha];
  
  if (effect === 'Decrease') {
    scoreDelta += 15;
    reasons.push(`Balances your dominant ${dominantDosha.charAt(0).toUpperCase() + dominantDosha.slice(1)} dosha`);
  } else if (effect === 'Increase') {
    scoreDelta -= 20;
    warnings.push(`May aggravate your ${dominantDosha.charAt(0).toUpperCase() + dominantDosha.slice(1)} dosha`);
  } else {
    scoreDelta += 5;
    reasons.push(`Neutral effect on ${dominantDosha.charAt(0).toUpperCase() + dominantDosha.slice(1)} dosha`);
  }

  return createRuleResult(scoreDelta, reasons, warnings, false);
};

/**
 * Check virya (potency) compatibility
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkViryaCompatibility = (user, food) => {
  if (!food.ayurveda || !food.ayurveda.virya) {
    return createRuleResult(0, [], [], false);
  }

  const { prakriti } = user;
  const { virya } = food.ayurveda;
  
  let scoreDelta = 0;
  const reasons = [];
  const warnings = [];

  // Pitta dominant - prefer cooling foods
  if ((prakriti?.pitta || 0) > 40) {
    if (virya === 'Cold') {
      scoreDelta += 10;
      reasons.push('Cooling potency suitable for Pitta dominance');
    } else if (virya === 'Hot') {
      scoreDelta -= 15;
      warnings.push('Heating potency may aggravate Pitta');
    }
  }

  // Vata & Kapha - prefer warming foods
  if ((prakriti?.vata || 0) > 40 || (prakriti?.kapha || 0) > 40) {
    if (virya === 'Hot') {
      scoreDelta += 10;
      reasons.push('Warming potency beneficial for Vata/Kapha');
    } else if (virya === 'Cold') {
      scoreDelta -= 5;
      warnings.push('Cooling effect may increase Vata/Kapha');
    }
  }

  return createRuleResult(scoreDelta, reasons, warnings, false);
};

/**
 * Check digestion compatibility
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkDigestionCompatibility = (user, food) => {
  if (!food.ayurveda || !food.ayurveda.guna) {
    return createRuleResult(0, [], [], false);
  }

  const { digestionIssues } = user;
  const { guna } = food.ayurveda;
  
  let scoreDelta = 0;
  const reasons = [];
  const warnings = [];

  if (digestionIssues === 'Weak' || digestionIssues === 'Variable') {
    // Light foods are better
    if (guna.includes('Light')) {
      scoreDelta += 15;
      reasons.push('Light quality aids digestion');
    } else if (guna.includes('Heavy')) {
      scoreDelta -= 15;
      warnings.push('Heavy quality may be difficult to digest');
    }

    // Oily foods in moderation
    if (guna.includes('Oily')) {
      scoreDelta -= 5;
      warnings.push('Oily foods may slow digestion');
    } else if (guna.includes('Dry')) {
      scoreDelta += 5;
      reasons.push('Dry quality easier on weak digestion');
    }
  }

  return createRuleResult(scoreDelta, reasons, warnings, false);
};

/**
 * Check rasa (taste) balance
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkRasaBalance = (user, food) => {
  if (!food.ayurveda || !food.ayurveda.rasa || food.ayurveda.rasa.length === 0) {
    return createRuleResult(0, [], [], false);
  }

  const { prakriti } = user;
  const { rasa } = food.ayurveda;
  
  let scoreDelta = 0;
  const reasons = [];

  // Pitta - prefer sweet, bitter, astringent
  if ((prakriti?.pitta || 0) > 40) {
    if (rasa.includes('Sweet') || rasa.includes('Bitter') || rasa.includes('Astringent')) {
      scoreDelta += 5;
      reasons.push(`${rasa.join(', ')} taste balances Pitta`);
    } else if (rasa.includes('Pungent') || rasa.includes('Sour') || rasa.includes('Salty')) {
      scoreDelta -= 5;
    }
  }

  // Vata - prefer sweet, sour, salty
  if ((prakriti?.vata || 0) > 40) {
    if (rasa.includes('Sweet') || rasa.includes('Sour') || rasa.includes('Salty')) {
      scoreDelta += 5;
      reasons.push(`${rasa.join(', ')} taste balances Vata`);
    }
  }

  // Kapha - prefer pungent, bitter, astringent
  if ((prakriti?.kapha || 0) > 40) {
    if (rasa.includes('Pungent') || rasa.includes('Bitter') || rasa.includes('Astringent')) {
      scoreDelta += 5;
      reasons.push(`${rasa.join(', ')} taste balances Kapha`);
    }
  }

  return createRuleResult(scoreDelta, reasons, [], false);
};

/**
 * Main Ayurveda evaluation function
 * @param {Object} user - User profile
 * @param {Object} food - Food item
 * @returns {RuleResult} - Combined Ayurveda evaluation
 */
const evaluateAyurveda = (user, food) => {
  const results = [
    checkDoshaCompatibility(user, food),
    checkViryaCompatibility(user, food),
    checkDigestionCompatibility(user, food),
    checkRasaBalance(user, food)
  ];

  // Combine all results
  const combined = results.reduce((acc, result) => {
    return {
      scoreDelta: acc.scoreDelta + result.scoreDelta,
      reasons: [...acc.reasons, ...result.reasons],
      warnings: [...acc.warnings, ...result.warnings],
      block: acc.block || result.block
    };
  }, createRuleResult());

  return combined;
};

module.exports = {
  evaluateAyurveda,
  checkDoshaCompatibility,
  checkViryaCompatibility,
  checkDigestionCompatibility,
  checkRasaBalance
};
