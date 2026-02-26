/**
 * TCM Diet Engine - Pattern-Based Scoring System
 * Based on Traditional Chinese Medicine Principles
 * 
 * Scoring Methodology:
 * 1. Primary Pattern Correction (Weight ×4 × severity)
 * 2. Secondary Pattern Support (Weight ×2)
 * 3. Cold/Heat Balance (Weight ×2)
 */

const path = require('path');
const fs = require('fs');

// Load TCM food data from JSON file
const TCM_FOODS_PATH = path.join(__dirname, '../../../data/tcm_food_constitution.json');
let tcmFoodsData = null;

/**
 * Load TCM foods from JSON file
 */
const loadTCMFoods = () => {
  if (!tcmFoodsData) {
    try {
      const rawData = fs.readFileSync(TCM_FOODS_PATH, 'utf8');
      tcmFoodsData = JSON.parse(rawData);
      console.log(`✅ Loaded ${tcmFoodsData.length} TCM foods from JSON`);
    } catch (error) {
      console.error('❌ Error loading TCM foods:', error);
      tcmFoodsData = [];
    }
  }
  return tcmFoodsData;
};

/**
 * Transform JSON food format to engine format
 */
const transformJSONFood = (jsonFood) => {
  return {
    _id: jsonFood.food_name,
    name: jsonFood.food_name,
    category: jsonFood.category,
    tcm: {
      thermalNature: jsonFood.thermal_nature || 'Neutral',
      flavor: jsonFood.flavor || ['Sweet'],
      meridian: jsonFood.meridian || ['Spleen'],
      element_affinity: jsonFood.element_affinity || 'Earth',
      qi_effect: jsonFood.qi_effect || 'tonifies',
      blood_effect: jsonFood.blood_effect || 'neutral',
      yin_yang_balance: jsonFood.yin_yang_balance || 'neutral',
      // Convert pattern_effects to boolean flags
      tonifies_qi: (jsonFood.pattern_effects?.qi_deficiency || 0) > 0,
      nourishes_blood: (jsonFood.pattern_effects?.blood_deficiency || 0) > 0,
      nourishes_yin: (jsonFood.pattern_effects?.yin_deficiency || 0) > 0,
      warms_yang: (jsonFood.pattern_effects?.yang_deficiency || 0) > 0,
      moves_qi: (jsonFood.pattern_effects?.qi_stagnation || 0) < 0,
      moves_blood: (jsonFood.pattern_effects?.blood_stasis || 0) < 0,
      resolves_dampness: (jsonFood.pattern_effects?.dampness || 0) < 0,
      clears_heat: (jsonFood.pattern_effects?.heat || 0) < 0,
      warms_interior: (jsonFood.pattern_effects?.cold || 0) < 0,
      damp_forming: (jsonFood.pattern_effects?.dampness || 0) > 1,
      therapeutic_use: jsonFood.therapeutic_use || ''
    },
    verified: true
  };
};

class TCMDietEngine {
  constructor() {
    this.patternNames = {
      'Cold Pattern': 'Cold Pattern',
      'Heat Pattern': 'Heat Pattern',
      'Qi Deficiency': 'Qi Deficiency',
      'Dampness': 'Dampness',
      'Dryness': 'Dryness',
      'Liver Qi Stagnation': 'Liver Qi Stagnation',
      'Yin Deficiency': 'Yin Deficiency',
      'Yang Deficiency': 'Yang Deficiency'
    };
  }

  /**
   * STEP 1 - Validate Food Dataset Entry
   * @param {Object} food - Food item from database
   * @returns {boolean} - Whether food entry is valid
   */
  validateFoodEntry(food) {
    if (!food.tcm) return false;

    const { thermalNature, flavor, tonifies_qi, nourishes_yin, warms_yang, clears_heat, resolves_dampness, moves_qi, damp_forming } = food.tcm;

    // Validate thermal nature
    if (thermalNature && !['Hot', 'Warm', 'Neutral', 'Cool', 'Cold'].includes(thermalNature)) {
      return false;
    }

    // Validate flavor array
    if (flavor && Array.isArray(flavor)) {
      const validFlavors = ['Sweet', 'Sour', 'Bitter', 'Pungent', 'Salty'];
      if (flavor.some(f => !validFlavors.includes(f))) {
        return false;
      }
    }

    // Validate boolean properties
    const booleanProps = [tonifies_qi, nourishes_yin, warms_yang, clears_heat, resolves_dampness, moves_qi, damp_forming];
    if (booleanProps.some(prop => prop !== undefined && typeof prop !== 'boolean')) {
      return false;
    }

    return true;
  }

  /**
   * STEP 2 - Score Individual Food
   * @param {Object} food - Food item
   * @param {Object} userAssessment - User's TCM assessment result
   * @returns {Object} - Scored food with breakdown
   */
  scoreFood(food, userAssessment) {
    if (!this.validateFoodEntry(food)) {
      return { food_name: food.name, score: 0, valid: false };
    }

    const { primary_pattern, secondary_pattern, cold_heat, severity } = userAssessment;
    
    let score = 0;
    const scoreBreakdown = {
      primary_pattern_correction: 0,
      secondary_pattern_support: 0,
      cold_heat_balance: 0
    };
    const reasons = [];

    // A) PRIMARY PATTERN CORRECTION (Weight ×4 × severity)
    const primaryScore = this._calculatePrimaryPatternCorrection(food, primary_pattern, severity);
    scoreBreakdown.primary_pattern_correction = primaryScore.score;
    score += primaryScore.score;
    reasons.push(...primaryScore.reasons);

    // B) SECONDARY PATTERN SUPPORT (Weight ×2)
    if (secondary_pattern) {
      const secondaryScore = this._calculateSecondaryPatternSupport(food, secondary_pattern);
      scoreBreakdown.secondary_pattern_support = secondaryScore.score;
      score += secondaryScore.score;
      reasons.push(...secondaryScore.reasons);
    }

    // C) COLD/HEAT BALANCE (Weight ×2)
    const balanceScore = this._calculateColdHeatBalance(food, cold_heat);
    scoreBreakdown.cold_heat_balance = balanceScore.score;
    score += balanceScore.score;
    reasons.push(...balanceScore.reasons);

    return {
      food_name: food.name,
      category: food.category,
      score: Math.round(score),
      scoreBreakdown,
      reasons,
      valid: true,
      rawFood: food
    };
  }

  /**
   * A) Calculate Primary Pattern Correction Score
   * @private
   */
  _calculatePrimaryPatternCorrection(food, primary_pattern, severity) {
    let score = 0;
    const reasons = [];
    const tcm = food.tcm;

    if (!tcm) {
      return { score: 0, reasons: [] };
    }

    // Dampness Pattern
    if (primary_pattern === 'Dampness') {
      if (tcm.resolves_dampness === true) {
        score += 4 * severity;
        reasons.push(`Resolves dampness (primary pattern) - Highly beneficial`);
      }
      
      // Sweet + heavy damp-forming foods penalize
      if (tcm.flavor && tcm.flavor.includes('Sweet') && tcm.damp_forming === true) {
        score -= 3 * severity;
        reasons.push(`Sweet and damp-forming - Aggravates dampness`);
      }
    }

    // Qi Deficiency Pattern
    if (primary_pattern === 'Qi Deficiency') {
      if (tcm.tonifies_qi === true) {
        score += 4 * severity;
        reasons.push(`Tonifies Qi (primary pattern) - Strengthens vital energy`);
      }
    }

    // Yin Deficiency Pattern
    if (primary_pattern === 'Yin Deficiency') {
      if (tcm.nourishes_yin === true) {
        score += 4 * severity;
        reasons.push(`Nourishes Yin (primary pattern) - Restores cooling essence`);
      }
    }

    // Yang Deficiency Pattern
    if (primary_pattern === 'Yang Deficiency') {
      if (tcm.warms_yang === true) {
        score += 4 * severity;
        reasons.push(`Warms Yang (primary pattern) - Tonifies warming energy`);
      }
    }

    // Heat Pattern
    if (primary_pattern === 'Heat Pattern') {
      if (tcm.clears_heat === true) {
        score += 4 * severity;
        reasons.push(`Clears heat (primary pattern) - Cools excessive heat`);
      }
      
      if (tcm.thermalNature === 'Hot') {
        score -= 3 * severity;
        reasons.push(`Hot thermal nature - Aggravates heat pattern`);
      }
    }

    // Cold Pattern
    if (primary_pattern === 'Cold Pattern') {
      if (tcm.thermalNature === 'Warm' || tcm.thermalNature === 'Hot') {
        score += 3 * severity;
        reasons.push(`${tcm.thermalNature} nature - Warms cold pattern`);
      }
      
      if (tcm.thermalNature === 'Cold') {
        score -= 3 * severity;
        reasons.push(`Cold nature - Aggravates cold pattern`);
      }
    }

    // Liver Qi Stagnation
    if (primary_pattern === 'Liver Qi Stagnation') {
      if (tcm.moves_qi === true) {
        score += 4 * severity;
        reasons.push(`Moves Qi (primary pattern) - Resolves stagnation`);
      }
    }

    return { score, reasons };
  }

  /**
   * B) Calculate Secondary Pattern Support Score
   * @private
   */
  _calculateSecondaryPatternSupport(food, secondary_pattern) {
    let score = 0;
    const reasons = [];
    const tcm = food.tcm;

    if (!tcm) {
      return { score: 0, reasons: [] };
    }

    const weight = 2; // Secondary pattern has half weight of primary

    // Apply same logic as primary but with reduced weight
    if (secondary_pattern === 'Dampness' && tcm.resolves_dampness === true) {
      score += weight;
      reasons.push(`Resolves dampness (secondary pattern)`);
    }

    if (secondary_pattern === 'Qi Deficiency' && tcm.tonifies_qi === true) {
      score += weight;
      reasons.push(`Tonifies Qi (secondary pattern)`);
    }

    if (secondary_pattern === 'Yin Deficiency' && tcm.nourishes_yin === true) {
      score += weight;
      reasons.push(`Nourishes Yin (secondary pattern)`);
    }

    if (secondary_pattern === 'Yang Deficiency' && tcm.warms_yang === true) {
      score += weight;
      reasons.push(`Warms Yang (secondary pattern)`);
    }

    if (secondary_pattern === 'Heat Pattern' && tcm.clears_heat === true) {
      score += weight;
      reasons.push(`Clears heat (secondary pattern)`);
    }

    if (secondary_pattern === 'Liver Qi Stagnation' && tcm.moves_qi === true) {
      score += weight;
      reasons.push(`Moves Qi (secondary pattern)`);
    }

    return { score, reasons };
  }

  /**
   * C) Calculate Cold/Heat Balance Score
   * @private
   */
  _calculateColdHeatBalance(food, cold_heat) {
    let score = 0;
    const reasons = [];
    const tcm = food.tcm;

    if (!tcm || !tcm.thermalNature) {
      return { score: 0, reasons: [] };
    }

    const weight = 2;

    if (cold_heat === 'Cold') {
      // Reward warm/hot foods
      if (tcm.thermalNature === 'Warm') {
        score += weight;
        reasons.push(`Warm nature balances cold tendency`);
      } else if (tcm.thermalNature === 'Hot') {
        score += weight;
        reasons.push(`Hot nature balances cold tendency`);
      }
      
      // Penalize cold foods
      if (tcm.thermalNature === 'Cold') {
        score -= weight;
        reasons.push(`Cold nature aggravates cold tendency`);
      }
    }

    if (cold_heat === 'Heat') {
      // Reward cool/cold foods
      if (tcm.thermalNature === 'Cool') {
        score += weight;
        reasons.push(`Cool nature balances heat tendency`);
      } else if (tcm.thermalNature === 'Cold') {
        score += weight;
        reasons.push(`Cold nature balances heat tendency`);
      }
      
      // Penalize hot foods
      if (tcm.thermalNature === 'Hot') {
        score -= weight;
        reasons.push(`Hot nature aggravates heat tendency`);
      }
    }

    return { score, reasons };
  }

  /**
   * STEP 3 - Rank Foods by Score
   * @param {Array} scoredFoods - Array of scored food objects
   * @returns {Object} - Ranked foods with categories
   */
  rankFoods(scoredFoods) {
    // Sort descending by score
    const sorted = scoredFoods
      .filter(f => f.valid)
      .sort((a, b) => b.score - a.score);

    // Calculate threshold for bottom 30%
    const bottomThreshold = Math.floor(sorted.length * 0.3);
    const cutoffIndex = sorted.length - bottomThreshold;

    const recommended = sorted.slice(0, cutoffIndex);
    const avoid = sorted.slice(cutoffIndex);

    return {
      top_ranked_foods: recommended.slice(0, 50), // Top 50 for practical use
      avoid_foods: avoid,
      total_scored: sorted.length,
      recommendation_count: recommended.length,
      avoid_count: avoid.length
    };
  }

  /**
   * Get Foods by Category for Balanced Meal Planning
   * @param {Array} rankedFoods - Ranked food array
   * @returns {Object} - Foods grouped by category
   */
  getFoodsByCategory(rankedFoods) {
    const categories = {
      Grain: [],
      Vegetable: [],
      Fruit: [],
      Protein: [],
      Legume: [],
      Spice: [],
      Beverage: [],
      Other: []
    };

    rankedFoods.forEach(food => {
      const category = food.category || 'Other';
      
      // Map 'Meat' to 'Protein'
      const mappedCategory = category === 'Meat' ? 'Protein' : category;
      
      if (categories[mappedCategory]) {
        categories[mappedCategory].push(food);
      } else {
        categories.Other.push(food);
      }
    });

    return categories;
  }

  /**
   * Load and get all TCM foods from JSON
   * @returns {Array} - Transformed food objects
   */
  getAllFoods() {
    const jsonFoods = loadTCMFoods();
    return jsonFoods.map(transformJSONFood);
  }
}

module.exports = new TCMDietEngine();
