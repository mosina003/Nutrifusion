/**
 * Unani Diet Engine - Comprehensive Scoring System
 * Based on Mizaj (Temperament) and Akhlat (Four Humors)
 * 
 * Scoring Methodology:
 * 1. Humor Correction (Primary Weight)
 * 2. Temperament Balancing (Secondary Weight)
 * 3. Digestive Strength Adjustment
 */

const path = require('path');
const fs = require('fs');

// Load Unani food data from JSON file
const UNANI_FOODS_PATH = path.join(__dirname, '../../../data/unani_food_constitution.json');
let unaniFoodsData = null;

/**
 * Load Unani foods from JSON file
 */
const loadUnaniFoods = () => {
  if (!unaniFoodsData) {
    try {
      const rawData = fs.readFileSync(UNANI_FOODS_PATH, 'utf8');
      unaniFoodsData = JSON.parse(rawData);
      console.log(`✅ Loaded ${unaniFoodsData.length} Unani foods from JSON`);
    } catch (error) {
      console.error('❌ Error loading Unani foods:', error);
      unaniFoodsData = [];
    }
  }
  return unaniFoodsData;
};

/**
 * Transform JSON food format to engine format
 */
const transformJSONFood = (jsonFood) => {
  return {
    _id: jsonFood.food_name,
    name: jsonFood.food_name,
    category: jsonFood.category,
    unani: {
      temperament: jsonFood.temperament || {
        hot_level: 0,
        cold_level: 0,
        dry_level: 0,
        moist_level: 0
      },
      humorEffects: jsonFood.humor_effects || {
        dam: 0,
        safra: 0,
        balgham: 0,
        sauda: 0
      },
      dominant_humor: jsonFood.dominant_humor || 'dam',
      organ_affinity: jsonFood.organ_affinity || [],
      digestibility_level: jsonFood.digestion_ease === 'easy' ? 2 : 
                          jsonFood.digestion_ease === 'moderate' ? 3 : 4,
      flatulence_potential: 'low',
      therapeutic_use: jsonFood.therapeutic_use || ''
    },
    verified: true
  };
};

class UnaniDietEngine {
  constructor() {
    this.humorNames = {
      dam: 'Dam (Hot + Moist)',
      safra: 'Safra (Hot + Dry)',
      balgham: 'Balgham (Cold + Moist)',
      sauda: 'Sauda (Cold + Dry)'
    };
  }

  /**
   * STEP 1 - Validate Food Dataset Entry
   * @param {Object} food - Food item from database
   * @returns {boolean} - Whether food entry is valid
   */
  validateFoodEntry(food) {
    if (!food.unani) return false;

    const { temperament, humorEffects, digestibility_level, flatulence_potential } = food.unani;

    // Validate temperament levels (0-4)
    if (temperament) {
      const levels = [
        temperament.hot_level,
        temperament.cold_level,
        temperament.moist_level,
        temperament.dry_level
      ];
      
      if (levels.some(l => l !== undefined && (l < 0 || l > 4))) {
        return false;
      }
    }

    // Validate humor effects (-1, 0, +1)
    if (humorEffects) {
      const effects = [humorEffects.dam, humorEffects.safra, humorEffects.balgham, humorEffects.sauda];
      if (effects.some(e => e !== undefined && ![-1, 0, 1].includes(e))) {
        return false;
      }
    }

    // Validate digestibility level (1-5)
    if (digestibility_level !== undefined && (digestibility_level < 1 || digestibility_level > 5)) {
      return false;
    }

    // Validate flatulence potential
    if (flatulence_potential && !['low', 'medium', 'high'].includes(flatulence_potential)) {
      return false;
    }

    return true;
  }

  /**
   * STEP 2 - Score Individual Food
   * @param {Object} food - Food item
   * @param {Object} userAssessment - User's Unani assessment result
   * @returns {Object} - Scored food with breakdown
   */
  scoreFood(food, userAssessment) {
    if (!this.validateFoodEntry(food)) {
      return { food_name: food.name, score: 0, valid: false };
    }

    const { primary_mizaj, dominant_humor, severity, digestive_strength } = userAssessment;
    
    let score = 0;
    const scoreBreakdown = {
      humor_correction: 0,
      temperament_balance: 0,
      digestive_adjustment: 0
    };
    const reasons = [];

    // A) HUMOR CORRECTION (Primary Weight)
    const humorScore = this._calculateHumorCorrection(food, dominant_humor, severity);
    scoreBreakdown.humor_correction = humorScore.score;
    score += humorScore.score;
    reasons.push(...humorScore.reasons);

    // B) TEMPERAMENT BALANCING (Secondary Weight)
    const temperamentScore = this._calculateTemperamentBalance(food, primary_mizaj);
    scoreBreakdown.temperament_balance = temperamentScore.score;
    score += temperamentScore.score;
    reasons.push(...temperamentScore.reasons);

    // C) DIGESTIVE STRENGTH ADJUSTMENT
    const digestiveScore = this._calculateDigestiveAdjustment(food, digestive_strength);
    scoreBreakdown.digestive_adjustment = digestiveScore.score;
    score += digestiveScore.score;
    reasons.push(...digestiveScore.reasons);

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
   * A) Calculate Humor Correction Score
   * @private
   */
  _calculateHumorCorrection(food, dominant_humor, severity) {
    let score = 0;
    const reasons = [];

    const humorEffects = food.unani?.humorEffects;
    if (!humorEffects) {
      return { score: 1 * severity, reasons: ['Neutral humor effect'] };
    }

    const effect = humorEffects[dominant_humor];

    if (effect === -1) {
      // Reduces dominant humor (GOOD)
      score = 4 * severity;
      reasons.push(`Reduces ${this.humorNames[dominant_humor]} (dominant humor) - Highly beneficial`);
    } else if (effect === 0) {
      // Neutral effect
      score = 1 * severity;
      reasons.push(`Neutral effect on ${this.humorNames[dominant_humor]}`);
    } else if (effect === 1) {
      // Increases dominant humor (BAD)
      score = -4 * severity;
      reasons.push(`Increases ${this.humorNames[dominant_humor]} (already dominant) - Avoid`);
    }

    return { score, reasons };
  }

  /**
   * B) Calculate Temperament Balance Score
   * @private
   */
  _calculateTemperamentBalance(food, primary_mizaj) {
    let score = 0;
    const reasons = [];

    const temp = food.unani?.temperament;
    if (!temp) {
      return { score: 0, reasons: [] };
    }

    const { hot_level = 0, cold_level = 0, moist_level = 0, dry_level = 0 } = temp;

    // Apply opposite principle based on Mizaj
    switch (primary_mizaj) {
      case 'balgham': // Cold + Moist → Need Hot + Dry
        if (hot_level >= 2) {
          score += 2;
          reasons.push(`Hot temperament (${hot_level}/4) balances cold nature`);
        }
        if (dry_level >= 2) {
          score += 2;
          reasons.push(`Dry temperament (${dry_level}/4) balances moist nature`);
        }
        if (cold_level >= 2) {
          score -= 2;
          reasons.push(`Cold temperament (${cold_level}/4) aggravates Balgham`);
        }
        if (moist_level >= 2) {
          score -= 2;
          reasons.push(`Moist temperament (${moist_level}/4) aggravates Balgham`);
        }
        break;

      case 'dam': // Hot + Moist → Need Cool + Dry
        if (cold_level >= 2) {
          score += 2;
          reasons.push(`Cool temperament (${cold_level}/4) balances hot nature`);
        }
        if (dry_level >= 2) {
          score += 2;
          reasons.push(`Dry temperament (${dry_level}/4) balances moist nature`);
        }
        if (hot_level >= 2) {
          score -= 2;
          reasons.push(`Hot temperament (${hot_level}/4) aggravates Dam`);
        }
        if (moist_level >= 2) {
          score -= 2;
          reasons.push(`Moist temperament (${moist_level}/4) aggravates Dam`);
        }
        break;

      case 'safra': // Hot + Dry → Need Cool + Moist
        if (cold_level >= 2) {
          score += 2;
          reasons.push(`Cool temperament (${cold_level}/4) balances hot nature`);
        }
        if (moist_level >= 2) {
          score += 2;
          reasons.push(`Moist temperament (${moist_level}/4) balances dry nature`);
        }
        if (hot_level >= 2) {
          score -= 2;
          reasons.push(`Hot temperament (${hot_level}/4) aggravates Safra`);
        }
        if (dry_level >= 2) {
          score -= 2;
          reasons.push(`Dry temperament (${dry_level}/4) aggravates Safra`);
        }
        break;

      case 'sauda': // Cold + Dry → Need Warm + Moist
        if (hot_level >= 2) {
          score += 2;
          reasons.push(`Warm temperament (${hot_level}/4) balances cold nature`);
        }
        if (moist_level >= 2) {
          score += 2;
          reasons.push(`Moist temperament (${moist_level}/4) balances dry nature`);
        }
        if (cold_level >= 2) {
          score -= 2;
          reasons.push(`Cold temperament (${cold_level}/4) aggravates Sauda`);
        }
        if (dry_level >= 2) {
          score -= 2;
          reasons.push(`Dry temperament (${dry_level}/4) aggravates Sauda`);
        }
        break;
    }

    return { score, reasons };
  }

  /**
   * C) Calculate Digestive Adjustment Score
   * @private
   */
  _calculateDigestiveAdjustment(food, digestive_strength) {
    let score = 0;
    const reasons = [];

    const digestibility = food.unani?.digestibility_level || 3;
    const flatulence = food.unani?.flatulence_potential || 'low';

    // Map digestive_strength to actionable logic
    const strengthMap = {
      'weak': { needs_light: true, penalty_heavy: true },
      'slow': { needs_light: true, penalty_heavy: false },
      'strong': { needs_light: false, penalty_heavy: false },
      'strong_but_hot': { needs_light: false, penalty_heavy: false },
      'moderate': { needs_light: false, penalty_heavy: false }
    };

    const profile = strengthMap[digestive_strength] || strengthMap.moderate;

    if (profile.penalty_heavy) {
      // Weak digestion
      if (digestibility >= 4) {
        score -= 3;
        reasons.push(`Hard to digest (${digestibility}/5) - unsuitable for weak digestion`);
      }
      if (flatulence === 'high') {
        score -= 2;
        reasons.push('High flatulence potential - avoid with weak digestion');
      }
      if (digestibility <= 2) {
        score += 2;
        reasons.push(`Easy to digest (${digestibility}/5) - good for weak digestion`);
      }
    } else if (profile.needs_light) {
      // Slow digestion
      if (digestibility >= 5) {
        score -= 2;
        reasons.push(`Very heavy (${digestibility}/5) - may burden slow digestion`);
      }
      if (digestibility <= 2) {
        score += 1;
        reasons.push(`Light food (${digestibility}/5) - suitable for slow digestion`);
      }
    }
    // Strong digestion - no major penalties

    return { score, reasons };
  }

  /**
   * STEP 3 - Rank Foods into Categories
   * @param {Array} scoredFoods - Array of scored foods
   * @returns {Object} - Categorized foods
   */
  rankFoods(scoredFoods) {
    // Sort by score descending
    const sorted = scoredFoods
      .filter(f => f.valid)
      .sort((a, b) => b.score - a.score);

    const total = sorted.length;
    const top30Index = Math.ceil(total * 0.3);
    const bottom30Index = Math.floor(total * 0.7);

    return {
      highly_suitable: sorted.slice(0, top30Index),
      moderately_suitable: sorted.slice(top30Index, bottom30Index),
      avoid: sorted.slice(bottom30Index),
      all_ranked: sorted
    };
  }

  /**
   * Score all foods from database or JSON
   * @param {Array} foods - All food items (optional)
   * @param {Object} userAssessment - User assessment result
   * @returns {Object} - Ranked foods
   */
  scoreAllFoods(foods, userAssessment) {
    // If no foods provided, load from JSON
    if (!foods || foods.length === 0) {
      const jsonFoods = loadUnaniFoods();
      foods = jsonFoods.map(transformJSONFood);
    }
    
    const scoredFoods = foods.map(food => this.scoreFood(food, userAssessment));
    return this.rankFoods(scoredFoods);
  }
}

module.exports = new UnaniDietEngine();
