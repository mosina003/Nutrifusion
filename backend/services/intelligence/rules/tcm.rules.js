const { createRuleResult } = require('./ruleEngine');

/**
 * Traditional Chinese Medicine (TCM) Rule Engine
 * Evaluates food based on Yin-Yang balance and thermal nature
 */

/**
 * Check thermal nature compatibility
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkThermalNature = (user, food) => {
  if (!food.tcm || !food.tcm.thermalNature) {
    return createRuleResult(0, [], [], false);
  }

  const userConstitution = user.tcmConstitution || 'Neutral';
  const { thermalNature } = food.tcm;
  
  let scoreDelta = 0;
  const reasons = [];
  const warnings = [];

  // Cold constitution - prefer warm/hot foods
  if (userConstitution === 'Cold' || userConstitution === 'Yang-Deficient') {
    if (thermalNature === 'Hot' || thermalNature === 'Warm') {
      scoreDelta += 15;
      reasons.push(`${thermalNature} nature tonifies Yang and warms the body`);
    } else if (thermalNature === 'Cold' || thermalNature === 'Cool') {
      scoreDelta -= 15;
      warnings.push('Cold nature may aggravate Yang deficiency');
    }
  }

  // Heat constitution - prefer cool/cold foods
  if (userConstitution === 'Hot' || userConstitution === 'Yin-Deficient') {
    if (thermalNature === 'Cold' || thermalNature === 'Cool') {
      scoreDelta += 15;
      reasons.push(`${thermalNature} nature clears heat and nourishes Yin`);
    } else if (thermalNature === 'Hot' || thermalNature === 'Warm') {
      scoreDelta -= 15;
      warnings.push('Hot nature may aggravate heat symptoms');
    }
  }

  // Neutral for balanced constitution
  if (userConstitution === 'Neutral') {
    if (thermalNature === 'Neutral') {
      scoreDelta += 10;
      reasons.push('Neutral nature maintains balance');
    }
  }

  return createRuleResult(scoreDelta, reasons, warnings, false);
};

/**
 * Check meridian relevance
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkMeridianRelevance = (user, food) => {
  if (!food.tcm || !food.tcm.meridian || food.tcm.meridian.length === 0) {
    return createRuleResult(0, [], [], false);
  }

  const { medicalConditions } = user;
  const { meridian } = food.tcm;
  
  let scoreDelta = 0;
  const reasons = [];

  // Map conditions to relevant meridians
  const conditionMeridianMap = {
    'Diabetes': ['Spleen', 'Kidney', 'Stomach'],
    'Hypertension': ['Liver', 'Heart', 'Kidney'],
    'Digestive Issues': ['Spleen', 'Stomach'],
    'Respiratory Issues': ['Lung', 'Large Intestine'],
    'Joint Pain': ['Kidney', 'Liver']
  };

  if (medicalConditions && medicalConditions.length > 0) {
    medicalConditions.forEach(condition => {
      const relevantMeridians = conditionMeridianMap[condition];
      if (relevantMeridians) {
        const hasMatch = meridian.some(m => relevantMeridians.includes(m));
        if (hasMatch) {
          scoreDelta += 10;
          reasons.push(`Targets ${meridian.join(', ')} meridian(s) relevant for ${condition}`);
        }
      }
    });
  }

  return createRuleResult(scoreDelta, reasons, [], false);
};

/**
 * Check flavor balance
 * @param {Object} user 
 * @param {Object} food 
 * @returns {RuleResult}
 */
const checkFlavorBalance = (user, food) => {
  if (!food.tcm || !food.tcm.flavor || food.tcm.flavor.length === 0) {
    return createRuleResult(0, [], [], false);
  }

  const { medicalConditions } = user;
  const { flavor } = food.tcm;
  
  let scoreDelta = 0;
  const reasons = [];
  const warnings = [];

  // Sweet flavor - tonifies but may aggravate dampness
  if (flavor.includes('Sweet')) {
    if (medicalConditions && medicalConditions.includes('Diabetes')) {
      scoreDelta -= 5;
      warnings.push('Sweet flavor may not be ideal for diabetes');
    } else {
      scoreDelta += 3;
      reasons.push('Sweet flavor tonifies Qi');
    }
  }

  // Pungent flavor - disperses and moves Qi
  if (flavor.includes('Pungent')) {
    if (medicalConditions && medicalConditions.includes('Hypertension')) {
      scoreDelta -= 5;
      warnings.push('Pungent flavor may raise blood pressure');
    } else {
      scoreDelta += 3;
      reasons.push('Pungent flavor moves Qi and blood');
    }
  }

  // Bitter flavor - drains heat and dampness
  if (flavor.includes('Bitter')) {
    scoreDelta += 5;
    reasons.push('Bitter flavor clears heat');
  }

  return createRuleResult(scoreDelta, reasons, warnings, false);
};

/**
 * Main TCM evaluation function
 * @param {Object} user - User profile
 * @param {Object} food - Food item
 * @returns {RuleResult} - Combined TCM evaluation
 */
const evaluateTCM = (user, food) => {
  const results = [
    checkThermalNature(user, food),
    checkMeridianRelevance(user, food),
    checkFlavorBalance(user, food)
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
  evaluateTCM,
  checkThermalNature,
  checkMeridianRelevance,
  checkFlavorBalance
};
