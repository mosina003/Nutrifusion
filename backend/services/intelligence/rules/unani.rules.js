const { createRuleResult } = require('./ruleEngine');

/**
 * Unani Medicine Rule Engine
 * Evaluates food based on Mizaj (temperament) balancing
 */

/**
 * Check heat temperament compatibility
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkHeatBalance = (user, food) => {
  if (!food.unani || !food.unani.temperament || !food.unani.temperament.heat) {
    return createRuleResult(0, [], [], false);
  }

  const userHeat = user.mizaj?.heat || 'Neutral';
  const foodHeat = food.unani.temperament.heat;
  
  let scoreDelta = 0;
  const reasons = [];
  const warnings = [];

  // Hot constitution - prefer cooling foods
  if (userHeat === 'Hot') {
    if (foodHeat === 'Cold') {
      scoreDelta += 15;
      reasons.push('Cold temperament balances your hot constitution');
    } else if (foodHeat === 'Hot') {
      scoreDelta -= 15;
      warnings.push('Hot temperament may aggravate heat in body');
    }
  }

  // Cold constitution - prefer warming foods
  if (userHeat === 'Cold') {
    if (foodHeat === 'Hot') {
      scoreDelta += 15;
      reasons.push('Hot temperament balances your cold constitution');
    } else if (foodHeat === 'Cold') {
      scoreDelta -= 10;
      warnings.push('Cold temperament may increase coldness');
    }
  }

  return createRuleResult(scoreDelta, reasons, warnings, false);
};

/**
 * Check moisture temperament compatibility
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkMoistureBalance = (user, food) => {
  if (!food.unani || !food.unani.temperament || !food.unani.temperament.moisture) {
    return createRuleResult(0, [], [], false);
  }

  const userMoisture = user.mizaj?.moisture || 'Neutral';
  const foodMoisture = food.unani.temperament.moisture;
  
  let scoreDelta = 0;
  const reasons = [];
  const warnings = [];

  // Moist constitution - prefer drying foods
  if (userMoisture === 'Moist') {
    if (foodMoisture === 'Dry') {
      scoreDelta += 10;
      reasons.push('Dry nature balances excess moisture');
    } else if (foodMoisture === 'Moist') {
      scoreDelta -= 10;
      warnings.push('Moist nature may increase dampness');
    }
  }

  // Dry constitution - prefer moistening foods
  if (userMoisture === 'Dry') {
    if (foodMoisture === 'Moist') {
      scoreDelta += 10;
      reasons.push('Moist nature balances dryness');
    } else if (foodMoisture === 'Dry') {
      scoreDelta -= 5;
      warnings.push('Dry nature may aggravate dryness');
    }
  }

  return createRuleResult(scoreDelta, reasons, warnings, false);
};

/**
 * Check digestion ease compatibility
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkDigestionEase = (user, food) => {
  if (!food.unani || !food.unani.digestionEase) {
    return createRuleResult(0, [], [], false);
  }

  const { digestionIssues } = user;
  const { digestionEase } = food.unani;
  
  let scoreDelta = 0;
  const reasons = [];
  const warnings = [];

  if (digestionIssues === 'Weak') {
    if (digestionEase === 'Easy') {
      scoreDelta += 20;
      reasons.push('Easy to digest, suitable for weak digestion');
    } else if (digestionEase === 'Heavy') {
      scoreDelta -= 20;
      warnings.push('Heavy digestion may burden weak digestive system');
    } else {
      scoreDelta += 5;
      reasons.push('Moderate digestion suitable');
    }
  } else if (digestionIssues === 'Strong') {
    if (digestionEase === 'Heavy') {
      scoreDelta += 10;
      reasons.push('Strong digestion can handle heavy foods');
    } else {
      scoreDelta += 5;
    }
  }

  return createRuleResult(scoreDelta, reasons, warnings, false);
};

/**
 * Main Unani evaluation function
 * @param {Object} user - User profile
 * @param {Object} food - Food item
 * @returns {RuleResult} - Combined Unani evaluation
 */
const evaluateUnani = (user, food) => {
  const results = [
    checkHeatBalance(user, food),
    checkMoistureBalance(user, food),
    checkDigestionEase(user, food)
  ];

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
  evaluateUnani,
  checkHeatBalance,
  checkMoistureBalance,
  checkDigestionEase
};
