/**
 * Ayurveda Diet Scoring Engine
 * 
 * Comprehensive food compatibility scoring based on Ayurvedic principles:
 * - Dosha Balance (Vata, Pitta, Kapha)
 * - Agni (Digestive Fire) Compatibility
 * - Virya (Potency: Hot/Cold)
 * - Seasonal Appropriateness
 * - Rasa (Taste) and Guna (Quality) Balance
 * 
 * Scoring Priority:
 * 1. Dosha Correction (highest priority) - ±4 points × severity
 * 2. Agni/Digestive Compatibility - ±3 points
 * 3. Virya & Seasonal Balance - ±2 points
 * 4. Rasa & Guna Enhancement - ±1 point
 */

const Food = require('../../../models/Food');

/**
 * Validate food has Ayurveda data
 */
const validateAyurvedaFood = (food) => {
  if (!food.ayurveda) return false;
  
  const { doshaEffect, virya, guna, rasa } = food.ayurveda;
  
  // Must have dosha effects
  if (!doshaEffect || !doshaEffect.vata || !doshaEffect.pitta || !doshaEffect.kapha) {
    return false;
  }
  
  // Validate dosha effect values
  const validEffects = ['Increase', 'Decrease', 'Neutral'];
  if (!validEffects.includes(doshaEffect.vata) ||
      !validEffects.includes(doshaEffect.pitta) ||
      !validEffects.includes(doshaEffect.kapha)) {
    return false;
  }
  
  return true;
};

/**
 * Score a single food item against Ayurveda assessment
 * 
 * @param {Object} assessmentResult - Ayurveda assessment output
 *   {
 *     prakriti: { vata: 40, pitta: 35, kapha: 25 },
 *     vikriti: { vata: 60, pitta: 20, kapha: 20 },
 *     agni: 'Variable',
 *     dominant_dosha: 'vata',
 *     severity: 2 (1-3 scale based on imbalance)
 *   }
 * @param {Object} food - Food document with ayurveda subdocument
 * @returns {Object} Scored food with breakdown
 */
const scoreFood = (assessmentResult, food) => {
  if (!validateAyurvedaFood(food)) {
    return null;
  }
  
  const { prakriti, vikriti, agni, dominant_dosha, severity } = assessmentResult;
  const { doshaEffect, virya, guna = [], rasa = [] } = food.ayurveda;
  
  let totalScore = 0;
  const breakdown = {
    dosha_correction: 0,
    agni_compatibility: 0,
    virya_seasonal: 0,
    rasa_guna: 0
  };
  
  // ==========================================
  // PRIORITY 1: DOSHA BALANCE CORRECTION
  // ==========================================
  // Goal: Decrease aggravated dosha (from vikriti), maintain others
  
  const doshaScore = calculateDoshaScore(dominant_dosha, severity, doshaEffect, vikriti);
  breakdown.dosha_correction = doshaScore;
  totalScore += doshaScore;
  
  // ==========================================
  // PRIORITY 2: AGNI (DIGESTIVE FIRE) COMPATIBILITY
  // ==========================================
  const agniScore = calculateAgniScore(agni, guna, food.category);
  breakdown.agni_compatibility = agniScore;
  totalScore += agniScore;
  
  // ==========================================
  // PRIORITY 3: VIRYA & SEASONAL BALANCE
  // ==========================================
  const viryaScore = calculateViryaSeasonalScore(virya, dominant_dosha, food.seasonality);
  breakdown.virya_seasonal = viryaScore;
  totalScore += viryaScore;
  
  // ==========================================
  // PRIORITY 4: RASA & GUNA ENHANCEMENT
  // ==========================================
  const rasaGunaScore = calculateRasaGunaScore(rasa, guna, dominant_dosha);
  breakdown.rasa_guna = rasaGunaScore;
  totalScore += rasaGunaScore;
  
  return {
    food: {
      _id: food._id,
      name: food.name,
      category: food.category
    },
    score: totalScore,
    breakdown,
    ayurveda_data: {
      doshaEffect,
      virya,
      guna,
      rasa
    }
  };
};

/**
 * Calculate Dosha Correction Score
 * Priority: Decrease aggravated dosha, don't aggravate others
 */
const calculateDoshaScore = (dominantDosha, severity, doshaEffect, vikriti) => {
  let score = 0;
  const weight = 4; // Maximum impact per severity level
  
  // Primary goal: Reduce dominant/aggravated dosha
  const dominantEffect = doshaEffect[dominantDosha];
  
  if (dominantEffect === 'Decrease') {
    // Excellent - directly balances aggravated dosha
    score += weight * severity; // +4, +8, or +12
  } else if (dominantEffect === 'Neutral') {
    // Acceptable - doesn't worsen condition
    score += 1;
  } else if (dominantEffect === 'Increase') {
    // Bad - aggravates the imbalance
    score -= weight * severity; // -4, -8, or -12
  }
  
  // Secondary consideration: Don't aggravate other doshas
  const doshas = ['vata', 'pitta', 'kapha'];
  doshas.forEach(dosha => {
    if (dosha !== dominantDosha) {
      // Check if this dosha is also elevated
      const doshaLevel = vikriti[dosha] || 33;
      if (doshaLevel > 40) {
        // This dosha is also elevated
        if (doshaEffect[dosha] === 'Increase') {
          score -= 2; // Penalty for aggravating elevated dosha
        } else if (doshaEffect[dosha] === 'Decrease') {
          score += 1; // Bonus for helping balance
        }
      }
    }
  });
  
  return score;
};

/**
 * Calculate Agni (Digestive Fire) Compatibility Score
 */
const calculateAgniScore = (agni, guna, category) => {
  let score = 0;
  
  const isLight = guna.includes('Light');
  const isHeavy = guna.includes('Heavy');
  const isOily = guna.includes('Oily');
  const isDry = guna.includes('Dry');
  
  switch (agni) {
    case 'Variable': // Vata-type - needs regularity, warmth, easy digestion
      if (isLight) score += 3;
      if (isHeavy) score -= 3;
      if (isOily) score += 1; // Moderate oil helps Vata
      if (isDry && category === 'Vegetable') score -= 1; // Raw, dry veggies hard on Variable Agni
      break;
      
    case 'Sharp': // Pitta-type - strong but can overheat
      if (isLight || isHeavy) score += 1; // Can handle both
      if (isOily) score -= 2; // Too much oil aggravates Pitta
      if (isDry) score += 1; // Dry foods cool Pitta
      break;
      
    case 'Slow': // Kapha-type - sluggish, needs light foods
      if (isLight) score += 3;
      if (isHeavy) score -= 3;
      if (isOily) score -= 2; // Oily foods worsen Kapha
      if (isDry) score += 2; // Dry foods stimulate Kapha
      break;
      
    case 'Balanced': // Sama Agni - can handle most foods
      score += 1; // Everything is okay
      break;
      
    default:
      score = 0;
  }
  
  return score;
};

/**
 * Calculate Virya (Potency) and Seasonal Appropriateness Score
 */
const calculateViryaSeasonalScore = (virya, dominantDosha, seasonality = []) => {
  let score = 0;
  
  // Virya-Dosha compatibility
  if (virya === 'Hot') {
    if (dominantDosha === 'vata' || dominantDosha === 'kapha') {
      score += 2; // Heating foods good for Vata/Kapha
    } else if (dominantDosha === 'pitta') {
      score -= 2; // Heating foods aggravate Pitta
    }
  } else if (virya === 'Cold') {
    if (dominantDosha === 'pitta') {
      score += 2; // Cooling foods good for Pitta
    } else if (dominantDosha === 'vata' || dominantDosha === 'kapha') {
      score -= 1; // Cooling foods can aggravate Vata/Kapha
    }
  }
  
  // Seasonal appropriateness (current season)
  const currentMonth = new Date().getMonth(); // 0-11
  const currentSeason = getSeason(currentMonth);
  
  if (seasonality.includes(currentSeason) || seasonality.includes('All Seasons')) {
    score += 1; // In-season bonus
  }
  
  return score;
};

/**
 * Calculate Rasa (Taste) and Guna (Quality) Enhancement Score
 */
const calculateRasaGunaScore = (rasa, guna, dominantDosha) => {
  let score = 0;
  
  // Taste recommendations by dosha
  const rasaBenefit = {
    vata: ['Sweet', 'Sour', 'Salty'],
    pitta: ['Sweet', 'Bitter', 'Astringent'],
    kapha: ['Pungent', 'Bitter', 'Astringent']
  };
  
  const beneficialTastes = rasaBenefit[dominantDosha] || [];
  
  rasa.forEach(taste => {
    if (beneficialTastes.includes(taste)) {
      score += 1; // Each beneficial taste adds point
    } else {
      score -= 0.5; // Mild penalty for non-beneficial tastes
    }
  });
  
  // Guna quality checks
  if (dominantDosha === 'vata') {
    if (guna.includes('Stable')) score += 0.5;
    if (guna.includes('Mobile')) score -= 0.5;
  } else if (dominantDosha === 'kapha') {
    if (guna.includes('Mobile')) score += 0.5;
    if (guna.includes('Stable')) score -= 0.5;
  }
  
  return score;
};

/**
 * Get current season based on month
 */
const getSeason = (month) => {
  // Northern hemisphere seasons (adjust for location if needed)
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
};

/**
 * Score multiple foods and rank them
 * 
 * @param {Object} assessmentResult - Ayurveda assessment results
 * @param {Array} foods - Array of food documents
 * @returns {Object} Categorized food recommendations
 */
const scoreAllFoods = async (assessmentResult, foods = null) => {
  // If no foods provided, fetch all Ayurveda-enabled foods
  if (!foods) {
    foods = await Food.find({ 
      'ayurveda.doshaEffect.vata': { $exists: true },
      verified: true 
    });
  }
  
  // Score all foods
  const scoredFoods = foods
    .map(food => scoreFood(assessmentResult, food))
    .filter(result => result !== null)
    .sort((a, b) => b.score - a.score);
  
  if (scoredFoods.length === 0) {
    return {
      highly_recommended: [],
      moderate: [],
      avoid: []
    };
  }
  
  // Categorize into tiers
  const topCutoff = Math.ceil(scoredFoods.length * 0.3);
  const midCutoff = Math.ceil(scoredFoods.length * 0.7);
  
  return {
    highly_recommended: scoredFoods.slice(0, topCutoff),
    moderate: scoredFoods.slice(topCutoff, midCutoff),
    avoid: scoredFoods.slice(midCutoff)
  };
};

module.exports = {
  scoreFood,
  scoreAllFoods,
  validateAyurvedaFood
};
