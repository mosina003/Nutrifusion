/**
 * Debug Service - Rule Transparency for Practitioners and Admins
 * Provides detailed breakdown of scoring logic
 */

/**
 * Build detailed debug information
 * @param {Object} user - User profile
 * @param {Object} item - Food or recipe
 * @param {Object} scoreResult - Score result with system breakdown
 * @returns {Object} - Detailed debug information
 */
const buildDebugInfo = (user, item, scoreResult) => {
  const debugInfo = {
    item: {
      id: item._id,
      name: item.name,
      category: item.category
    },
    userProfile: {
      dominantDosha: getDominantDosha(user.prakriti),
      age: user.age,
      BMI: user.BMI,
      medicalConditions: user.medicalConditions || [],
      allergies: user.allergies || [],
      dietaryPreferences: user.dietaryPreferences || []
    },
    scoring: {
      baseScore: 50,
      finalScore: scoreResult.finalScore,
      blocked: scoreResult.block
    },
    ruleBreakdown: {
      ayurveda: {
        delta: scoreResult.systemScores.ayurveda,
        contributions: extractAyurvedaReasons(scoreResult.reasons)
      },
      unani: {
        delta: scoreResult.systemScores.unani,
        contributions: extractUnaniReasons(scoreResult.reasons)
      },
      tcm: {
        delta: scoreResult.systemScores.tcm,
        contributions: extractTCMReasons(scoreResult.reasons)
      },
      modern: {
        delta: scoreResult.systemScores.modern,
        contributions: extractModernReasons(scoreResult.reasons)
      },
      safety: {
        delta: scoreResult.systemScores.safety,
        contributions: extractSafetyReasons(scoreResult.warnings)
      }
    },
    calculations: {
      formula: 'finalScore = baseScore (50) + ayurveda + unani + tcm + modern + safety',
      breakdown: `50 + ${scoreResult.systemScores.ayurveda} + ${scoreResult.systemScores.unani} + ${scoreResult.systemScores.tcm} + ${scoreResult.systemScores.modern} + ${scoreResult.systemScores.safety} = ${scoreResult.finalScore}`,
      clamped: scoreResult.finalScore < 50 || scoreResult.finalScore > 100
    },
    dataCompleteness: {
      hasAyurvedaData: !!item.ayurveda && Object.keys(item.ayurveda).length > 0,
      hasUnaniData: !!item.unani && Object.keys(item.unani).length > 0,
      hasTCMData: !!item.tcm && Object.keys(item.tcm).length > 0,
      hasModernData: !!item.modernNutrition && Object.keys(item.modernNutrition).length > 0,
      completenessScore: calculateCompletenessScore(item)
    },
    allReasons: scoreResult.reasons,
    allWarnings: scoreResult.warnings
  };

  return debugInfo;
};

/**
 * Helper to determine dominant dosha
 */
const getDominantDosha = (prakriti) => {
  if (!prakriti) return 'Balanced';
  const { vata = 33, pitta = 33, kapha = 33 } = prakriti;
  if (vata > pitta && vata > kapha) return 'Vata';
  if (pitta > vata && pitta > kapha) return 'Pitta';
  if (kapha > vata && kapha > pitta) return 'Kapha';
  return 'Balanced';
};

/**
 * Extract Ayurveda-specific reasons
 */
const extractAyurvedaReasons = (reasons) => {
  const ayurvedaKeywords = ['dosha', 'virya', 'rasa', 'guna', 'vata', 'pitta', 'kapha', 'potency', 'taste'];
  return reasons.filter(r => 
    ayurvedaKeywords.some(keyword => r.toLowerCase().includes(keyword))
  );
};

/**
 * Extract Unani-specific reasons
 */
const extractUnaniReasons = (reasons) => {
  const unaniKeywords = ['temperament', 'mizaj', 'heat', 'cold', 'moist', 'dry', 'digestion'];
  return reasons.filter(r => 
    unaniKeywords.some(keyword => r.toLowerCase().includes(keyword)) &&
    !r.toLowerCase().includes('dosha')
  );
};

/**
 * Extract TCM-specific reasons
 */
const extractTCMReasons = (reasons) => {
  const tcmKeywords = ['yin', 'yang', 'thermal', 'meridian', 'qi', 'flavor', 'warming', 'cooling'];
  return reasons.filter(r => 
    tcmKeywords.some(keyword => r.toLowerCase().includes(keyword))
  );
};

/**
 * Extract Modern nutrition reasons
 */
const extractModernReasons = (reasons) => {
  const modernKeywords = ['calorie', 'protein', 'carb', 'fat', 'fiber', 'bmi', 'diabetes', 'nutrient'];
  return reasons.filter(r => 
    modernKeywords.some(keyword => r.toLowerCase().includes(keyword))
  );
};

/**
 * Extract safety warnings
 */
const extractSafetyReasons = (warnings) => {
  return warnings.filter(w => w.includes('⛔') || w.toLowerCase().includes('block'));
};

/**
 * Calculate data completeness score
 */
const calculateCompletenessScore = (item) => {
  let score = 0;
  const maxScore = 4;

  if (item.ayurveda && Object.keys(item.ayurveda).length > 0) score++;
  if (item.unani && Object.keys(item.unani).length > 0) score++;
  if (item.tcm && Object.keys(item.tcm).length > 0) score++;
  if (item.modernNutrition && Object.keys(item.modernNutrition).length > 0) score++;

  return Math.round((score / maxScore) * 100);
};

/**
 * Build conflict analysis
 */
const buildConflictAnalysis = (scoreResult) => {
  const systems = scoreResult.systemScores;
  const conflicts = [];

  // Check for opposing deltas
  const positives = [];
  const negatives = [];

  Object.entries(systems).forEach(([system, delta]) => {
    if (delta > 0) positives.push({ system, delta });
    if (delta < 0) negatives.push({ system, delta });
  });

  if (positives.length > 0 && negatives.length > 0) {
    conflicts.push({
      type: 'System Disagreement',
      description: `${positives.map(s => s.system).join(', ')} recommend (+), while ${negatives.map(s => s.system).join(', ')} discourage (-)`,
      resolution: scoreResult.block ? 'Safety override blocks item' : 'Aggregate scoring applied'
    });
  }

  // Check for safety blocks
  if (scoreResult.block) {
    conflicts.push({
      type: 'Hard Block',
      description: 'Safety rules triggered contraindication',
      resolution: 'Item excluded from recommendations (score = 0)'
    });
  }

  return conflicts;
};

module.exports = {
  buildDebugInfo,
  buildConflictAnalysis,
  getDominantDosha
};
