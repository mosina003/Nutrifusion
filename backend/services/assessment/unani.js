/**
 * Unani Assessment Engine
 * Identifies Mizaj (Temperament) and Akhlat (Humors) based on Unani principles
 * Four Humors: Dam (Hot+Moist), Safra (Hot+Dry), Balgham (Cold+Moist), Sauda (Cold+Dry)
 */

class UnaniEngine {
  constructor() {
    this.humorTypes = ['dam', 'safra', 'balgham', 'sauda'];
    this.humorNames = {
      dam: 'Dam (Hot + Moist)',
      safra: 'Safra (Hot + Dry)',
      balgham: 'Balgham (Cold + Moist)',
      sauda: 'Sauda (Cold + Dry)'
    };
  }

  /**
   * Score Unani assessment responses
   * @param {Object} responses - User responses with question IDs and answers
   * @returns {Object} Scored health profile
   */
  score(responses) {
    const humorScores = {
      dam: 0,
      safra: 0,
      balgham: 0,
      sauda: 0
    };

    const thermalScores = { heat: 0, cold: 0 };
    const moistureScores = { dry: 0, moist: 0 };

    // Track digestive answers for digestive strength calculation
    let digestiveQ16Answer = null;
    let digestiveQ17Answer = null;

    // Calculate scores from responses with category weighting
    Object.entries(responses).forEach(([questionId, answer]) => {
      if (answer && answer.humor) {
        let weight = 1;

        // Apply 2x weight to humor_symptoms (Q11-Q15) and digestive_organ (Q16-Q20)
        const qNum = parseInt(questionId.replace('un_q', ''));
        if (qNum >= 11 && qNum <= 20) {
          weight = 2;
        }

        // Accumulate humor score
        humorScores[answer.humor] = (humorScores[answer.humor] || 0) + weight;

        // Also track thermal and moisture for compatibility
        thermalScores.heat += (answer.heat || 0) * weight;
        thermalScores.cold += (answer.cold || 0) * weight;
        moistureScores.dry += (answer.dry || 0) * weight;
        moistureScores.moist += (answer.moist || 0) * weight;

        // Track digestive questions for digestive strength
        if (questionId === 'un_q16') digestiveQ16Answer = answer.humor;
        if (questionId === 'un_q17') digestiveQ17Answer = answer.humor;
      }
    });

    // Sort humors by score to find primary and secondary
    const sortedHumors = Object.entries(humorScores)
      .sort(([, a], [, b]) => b - a);

    const primaryHumor = sortedHumors[0][0];
    const primaryScore = sortedHumors[0][1];
    const secondaryHumor = sortedHumors[1][0];
    const secondaryScore = sortedHumors[1][1];

    // Calculate severity based on score difference
    const scoreDifference = primaryScore - secondaryScore;
    let severity = 1; // Mild
    if (scoreDifference >= 5) severity = 3; // Severe
    else if (scoreDifference >= 3) severity = 2; // Moderate

    // Calculate digestive strength
    const digestiveStrength = this._calculateDigestiveStrength(digestiveQ16Answer, digestiveQ17Answer);

    // Determine thermal and moisture tendencies
    const thermal = thermalScores.heat > thermalScores.cold ? 'hot' : 'cold';
    const moisture = moistureScores.moist > moistureScores.dry ? 'moist' : 'dry';

    // Calculate humor percentages
    const totalScore = Object.values(humorScores).reduce((sum, score) => sum + score, 0);
    const humorPercentages = {};
    if (totalScore > 0) {
      for (const [humor, score] of Object.entries(humorScores)) {
        humorPercentages[humor] = Math.round((score / totalScore) * 100);
      }
    }

    return {
      primary_mizaj: primaryHumor,
      secondary_mizaj: secondaryHumor,
      dominant_humor: primaryHumor,
      severity: severity,
      digestive_strength: digestiveStrength,
      humor_scores: humorScores,
      humor_percentages: humorPercentages,
      thermal_tendency: thermal,
      moisture_tendency: moisture,
      balance_indicator: this._getSeverityLabel(severity),
      score_difference: scoreDifference
    };
  }

  /**
   * Calculate digestive strength based on Q16 and Q17
   */
  _calculateDigestiveStrength(q16Answer, q17Answer) {
    // Based on the user's specification:
    // A (Dam) → strong
    // B (Safra) → strong but hot
    // C (Balgham) → slow
    // D (Sauda) → weak

    const digestiveMap = {
      dam: 'strong',
      safra: 'strong_but_hot',
      balgham: 'slow',
      sauda: 'weak'
    };

    // Prioritize Q16, but consider Q17
    const primary = digestiveMap[q16Answer] || 'moderate';
    const secondary = digestiveMap[q17Answer] || 'moderate';

    // If both indicate same strength, return that
    if (primary === secondary) return primary;

    // If one is strong/strong_but_hot and other is not weak, lean towards strong
    if ((primary.includes('strong') && secondary !== 'weak') ||
        (secondary.includes('strong') && primary !== 'weak')) {
      return q16Answer === 'safra' || q17Answer === 'safra' ? 'strong_but_hot' : 'strong';
    }

    // Default to primary (Q16)
    return primary;
  }

  /**
   * Get severity label
   */
  _getSeverityLabel(severity) {
    const labels = { 1: 'mild', 2: 'moderate', 3: 'severe' };
    return labels[severity] || 'mild';
  }

  /**
   * Generate health profile from scores
   */
  generateHealthProfile(scores, userInfo) {
    const profile = {
      framework: 'unani',
      mizaj: {
        primary: scores.primary_mizaj,
        primary_name: this.humorNames[scores.primary_mizaj],
        secondary: scores.secondary_mizaj,
        secondary_name: this.humorNames[scores.secondary_mizaj],
        thermal_tendency: scores.thermal_tendency,
        moisture_tendency: scores.moisture_tendency,
        balance_level: scores.balance_indicator,
        severity: scores.severity
      },
      humors: {
        dominant: scores.dominant_humor,
        scores: scores.humor_scores,
        difference: scores.score_difference
      },
      digestive_profile: {
        strength: scores.digestive_strength,
        description: this._getDigestiveDescription(scores.digestive_strength)
      },
      characteristics: this._getHumorCharacteristics(scores.primary_mizaj),
      dietary_guidelines: this._getDietaryGuidelines(scores.primary_mizaj),
      lifestyle_recommendations: this._getLifestyleRecommendations(scores.primary_mizaj),
      balancing_approach: this._getBalancingApproach(scores.primary_mizaj)
    };

    return profile;
  }

  /**
   * Get digestive description
   */
  _getDigestiveDescription(strength) {
    const descriptions = {
      strong: 'Strong digestive fire, good appetite and metabolism',
      strong_but_hot: 'Strong digestion but prone to heat and acidity',
      slow: 'Slow digestion, needs lighter, easier-to-digest foods',
      weak: 'Weak digestive capacity, requires careful food choices',
      moderate: 'Moderate digestive strength, balanced approach needed'
    };
    return descriptions[strength] || descriptions.moderate;
  }

  /**
   * Generate nutrition inputs for recommendation engine
   */
  generateNutritionInputs(scores, healthProfile) {
    const inputs = {
      mizaj_type: scores.primary_mizaj,
      dominant_humor: scores.dominant_humor,
      thermal_balance: this._getThermalBalance(scores.thermal_tendency),
      moisture_balance: this._getMoistureBalance(scores.moisture_tendency),
      digestive_strength: scores.digestive_strength,
      food_qualities: this._getFoodQualities(scores.primary_mizaj),
      avoid_foods: this._getAvoidFoods(scores.primary_mizaj),
      recommended_herbs: this._getRecommendedHerbs(scores.primary_mizaj),
      meal_structure: this._getMealStructure(scores.primary_mizaj)
    };

    return inputs;
  }

  /**
   * Validate responses before scoring
   */
  validateResponses(responses, requiredQuestions) {
    const errors = [];

    // Check if all required questions are answered
    requiredQuestions.forEach(qId => {
      if (!responses[qId]) {
        errors.push(`Question ${qId} is required`);
      }
    });

    // Validate answer format
    Object.entries(responses).forEach(([qId, answer]) => {
      if (!answer.humor || !this.humorTypes.includes(answer.humor)) {
        errors.push(`Invalid humor type for question ${qId}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Helper methods
  _getHumorCharacteristics(humor) {
    const characteristics = {
      dam: {
        temperament: 'Dam - Hot & Moist (Sanguine)',
        physical: ['Strong constitution', 'Good complexion', 'Warm body', 'Quick metabolism', 'Flexible joints'],
        mental: ['Cheerful', 'Sociable', 'Optimistic', 'Quick learner', 'Active'],
        digestion: ['Strong appetite', 'Good digestion', 'Regular elimination', 'Balanced'],
        common_issues: ['Redness', 'Fullness', 'Occasional fever']
      },
      safra: {
        temperament: 'Safra - Hot & Dry (Choleric)',
        physical: ['Lean build', 'Warm & dry skin', 'High energy', 'Fast metabolism', 'Hot extremities'],
        mental: ['Ambitious', 'Quick-tempered', 'Decisive', 'Intense focus', 'Sharp mind'],
        digestion: ['Strong hunger', 'Fast digestion', 'Prone to acidity', 'Excessive thirst'],
        common_issues: ['Burning', 'Acidity', 'High fever', 'Impatience']
      },
      balgham: {
        temperament: 'Balgham - Cold & Moist (Phlegmatic)',
        physical: ['Solid build', 'Cool & moist skin', 'Steady energy', 'Slow metabolism', 'Heavy feeling'],
        mental: ['Calm', 'Patient', 'Methodical', 'Good memory', 'Slow but steady'],
        digestion: ['Moderate appetite', 'Slow digestion', 'Heaviness after meals', 'Mucus tendency'],
        common_issues: ['Cold', 'Cough', 'Sinus congestion', 'Sluggishness']
      },
      sauda: {
        temperament: 'Sauda - Cold & Dry (Melancholic)',
        physical: ['Thin to medium build', 'Cool & dry skin', 'Variable energy', 'Slow metabolism', 'Dry joints'],
        mental: ['Analytical', 'Perfectionist', 'Cautious', 'Deep thinker', 'Serious'],
        digestion: ['Variable appetite', 'Sensitive digestion', 'Constipation prone', 'Bloating'],
        common_issues: ['Dark circles', 'Constipation', 'Weakness', 'Worry']
      }
    };
    return characteristics[humor] || characteristics.dam;
  }

  _getDietaryGuidelines(humor) {
    const guidelines = {
      dam: {
        favor: ['Cooling foods', 'Fresh fruits', 'Vegetables', 'Light proteins', 'Moderate portions'],
        avoid: ['Excessive hot spices', 'Heavy meats', 'Overeating', 'Rich desserts'],
        qualities: 'Cool, light, fresh foods in moderation',
        timing: 'Regular meals, avoid late-night eating'
      },
      safra: {
        favor: ['Cooling foods', 'Sweet fruits', 'Leafy greens', 'Whole grains', 'Coconut water'],
        avoid: ['Very hot foods', 'Fried items', 'Red meat', 'Alcohol', 'Excessive salt'],
        qualities: 'Cool and moist, calming foods',
        timing: 'Regular intervals, never skip meals'
      },
      balgham: {
        favor: ['Warming spices', 'Light foods', 'Bitter greens', 'Dry-cooked foods', 'Honey'],
        avoid: ['Cold drinks', 'Dairy products', 'Sweet foods', 'Heavy meals', 'Oily foods'],
        qualities: 'Warm, dry, light, and stimulating',
        timing: 'Light breakfast or skip, moderate lunch, light dinner'
      },
      sauda: {
        favor: ['Warming foods', 'Cooked vegetables', 'Healthy fats', 'Warm liquids', 'Dates'],
        avoid: ['Cold foods', 'Dry crackers', 'Excessive raw foods', 'Cold drinks', 'Leftovers'],
        qualities: 'Warm, moist, nourishing foods',
        timing: 'Regular warm meals, avoid cold foods'
      }
    };
    return guidelines[humor] || guidelines.dam;
  }

  _getLifestyleRecommendations(humor) {
    const recommendations = {
      dam: {
        exercise: 'Moderate, regular activity',
        sleep: '7-8 hours, avoid oversleeping',
        stress: 'Social activities, outdoor time',
        environment: 'Cool, airy, not overly warm'
      },
      safra: {
        exercise: 'Cooling activities, swimming, evening walks',
        sleep: 'Sufficient rest, cool bedroom',
        stress: 'Calming practices, avoid conflict',
        environment: 'Cool, peaceful, serene'
      },
      balgham: {
        exercise: 'Vigorous, daily activity to stimulate',
        sleep: '6-7 hours, wake early',
        stress: 'Active engagement, variety',
        environment: 'Warm, dry, stimulating'
      },
      sauda: {
        exercise: 'Gentle to moderate, warming yoga',
        sleep: 'Regular schedule, warm bedroom',
        stress: 'Warming activities, social connection',
        environment: 'Warm, moist, comforting'
      }
    };
    return recommendations[humor] || recommendations.dam;
  }

  _getBalancingApproach(humor) {
    const approaches = {
      dam: 'Balance excess heat and moisture with cooling, light foods',
      safra: 'Balance heat and dryness with cooling, moistening foods',
      balgham: 'Balance cold and moisture with warming, drying foods',
      sauda: 'Balance cold and dryness with warming, moistening foods'
    };
    return approaches[humor] || 'Maintain balance through appropriate diet';
  }

  _getThermalBalance(thermal) {
    return thermal === 'hot' ? 'needs_cooling' : 'needs_warming';
  }

  _getMoistureBalance(moisture) {
    return moisture === 'moist' ? 'needs_drying' : 'needs_moistening';
  }

  _getFoodQualities(humor) {
    const qualities = {
      dam: ['cooling', 'light', 'fresh', 'moderate'],
      safra: ['cooling', 'moist', 'sweet', 'calming'],
      balgham: ['warming', 'dry', 'light', 'stimulating'],
      sauda: ['warming', 'moist', 'nourishing', 'grounding']
    };
    return qualities[humor] || [];
  }

  _getAvoidFoods(humor) {
    const avoid = {
      dam: ['excessive_spicy', 'heavy_meats', 'fried_foods', 'alcohol'],
      safra: ['hot_spices', 'sour_foods', 'salty_foods', 'red_meat'],
      balgham: ['cold_drinks', 'dairy', 'sweets', 'heavy_foods'],
      sauda: ['cold_foods', 'dry_foods', 'raw_vegetables', 'ice_cream']
    };
    return avoid[humor] || [];
  }

  _getRecommendedHerbs(humor) {
    const herbs = {
      dam: ['mint', 'coriander', 'fennel', 'rose'],
      safra: ['sandalwood', 'cardamom', 'chicory', 'licorice'],
      balgham: ['ginger', 'black_pepper', 'turmeric', 'cinnamon'],
      sauda: ['saffron', 'ginger', 'cardamom', 'fennel']
    };
    return herbs[humor] || [];
  }

  _getMealStructure(humor) {
    const structure = {
      dam: {
        breakfast: 'light_moderate',
        lunch: 'main_meal',
        dinner: 'light'
      },
      safra: {
        breakfast: 'moderate',
        lunch: 'main_meal',
        dinner: 'moderate'
      },
      balgham: {
        breakfast: 'skip_or_light',
        lunch: 'main_meal',
        dinner: 'very_light'
      },
      sauda: {
        breakfast: 'warm_nourishing',
        lunch: 'main_meal',
        dinner: 'warm_light'
      }
    };
    return structure[humor] || structure.dam;
  }
}

module.exports = new UnaniEngine();
