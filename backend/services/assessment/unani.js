/**
 * Unani Assessment Engine
 * Identifies Mizaj (Temperament) based on hot/cold and dry/moist qualities
 */

class UnaniEngine {
  constructor() {
    this.mizajTypes = ['damvi', 'safravi', 'balghami', 'saudavi'];
  }

  /**
   * Score Unani assessment responses
   * @param {Object} responses - User responses with question IDs and answers
   * @returns {Object} Scored health profile
   */
  score(responses) {
    const scores = {
      heat: 0,
      cold: 0,
      dry: 0,
      moist: 0
    };

    // Calculate scores from responses
    Object.entries(responses).forEach(([questionId, answer]) => {
      if (answer) {
        scores.heat += answer.heat || 0;
        scores.cold += answer.cold || 0;
        scores.dry += answer.dry || 0;
        scores.moist += answer.moist || 0;
      }
    });

    // Determine thermal tendency
    const thermalScore = scores.heat - scores.cold;
    const thermal = thermalScore > 0 ? 'hot' : 'cold';
    const thermalIntensity = Math.abs(thermalScore);

    // Determine moisture tendency
    const moistureScore = scores.moist - scores.dry;
    const moisture = moistureScore > 0 ? 'moist' : 'dry';
    const moistureIntensity = Math.abs(moistureScore);

    // Classify Mizaj type
    const mizajType = this._classifyMizaj(thermal, moisture);

    return {
      mizaj_type: mizajType,
      thermal_tendency: thermal,
      thermal_score: thermalIntensity,
      moisture_tendency: moisture,
      moisture_score: moistureIntensity,
      raw_scores: scores,
      balance_indicator: this._getBalanceIndicator(thermalIntensity, moistureIntensity)
    };
  }

  /**
   * Classify Mizaj based on thermal and moisture tendencies
   */
  _classifyMizaj(thermal, moisture) {
    if (thermal === 'hot' && moisture === 'moist') return 'damvi';
    if (thermal === 'hot' && moisture === 'dry') return 'safravi';
    if (thermal === 'cold' && moisture === 'moist') return 'balghami';
    if (thermal === 'cold' && moisture === 'dry') return 'saudavi';
    return 'balanced'; // Edge case
  }

  /**
   * Get balance indicator
   */
  _getBalanceIndicator(thermalIntensity, moistureIntensity) {
    const total = thermalIntensity + moistureIntensity;
    if (total < 5) return 'mild';
    if (total < 10) return 'moderate';
    return 'strong';
  }

  /**
   * Generate health profile from scores
   */
  generateHealthProfile(scores, userInfo) {
    const profile = {
      framework: 'unani',
      mizaj: {
        type: scores.mizaj_type,
        thermal_tendency: scores.thermal_tendency,
        moisture_tendency: scores.moisture_tendency,
        balance_level: scores.balance_indicator
      },
      qualities: {
        thermal_score: scores.thermal_score,
        moisture_score: scores.moisture_score
      },
      characteristics: this._getMizajCharacteristics(scores.mizaj_type),
      dietary_guidelines: this._getDietaryGuidelines(scores.mizaj_type),
      lifestyle_recommendations: this._getLifestyleRecommendations(scores.mizaj_type),
      balancing_approach: this._getBalancingApproach(scores.mizaj_type)
    };

    return profile;
  }

  /**
   * Generate nutrition inputs for recommendation engine
   */
  generateNutritionInputs(scores, healthProfile) {
    const inputs = {
      mizaj_type: scores.mizaj_type,
      thermal_balance: this._getThermalBalance(scores.thermal_tendency),
      moisture_balance: this._getMoistureBalance(scores.moisture_tendency),
      food_qualities: this._getFoodQualities(scores.mizaj_type),
      avoid_foods: this._getAvoidFoods(scores.mizaj_type),
      recommended_herbs: this._getRecommendedHerbs(scores.mizaj_type),
      meal_structure: this._getMealStructure(scores.mizaj_type)
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
      const validKeys = ['heat', 'cold', 'dry', 'moist'];
      const hasValidKey = validKeys.some(key => 
        answer.hasOwnProperty(key) && (answer[key] === 0 || answer[key] === 1)
      );
      
      if (!hasValidKey) {
        errors.push(`Invalid answer format for question ${qId}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Helper methods
  _getMizajCharacteristics(mizajType) {
    const characteristics = {
      damvi: {
        temperament: 'Hot & Moist (Sanguine)',
        physical: ['Strong constitution', 'Good complexion', 'Warm body', 'Quick metabolism'],
        mental: ['Cheerful', 'Sociable', 'Optimistic', 'Quick learner'],
        digestion: ['Strong appetite', 'Good digestion', 'Regular elimination']
      },
      safravi: {
        temperament: 'Hot & Dry (Choleric)',
        physical: ['Lean build', 'Warm & dry skin', 'High energy', 'Fast metabolism'],
        mental: ['Ambitious', 'Quick-tempered', 'Decisive', 'Intense focus'],
        digestion: ['Strong hunger', 'Can handle heavy foods', 'Prone to acidity']
      },
      balghami: {
        temperament: 'Cold & Moist (Phlegmatic)',
        physical: ['Solid build', 'Cool & moist skin', 'Steady energy', 'Slow metabolism'],
        mental: ['Calm', 'Patient', 'Methodical', 'Good memory'],
        digestion: ['Moderate appetite', 'Slow digestion', 'Tendency for mucus']
      },
      saudavi: {
        temperament: 'Cold & Dry (Melancholic)',
        physical: ['Thin to medium build', 'Cool & dry skin', 'Variable energy', 'Slow metabolism'],
        mental: ['Analytical', 'Perfectionist', 'Cautious', 'Deep thinker'],
        digestion: ['Variable appetite', 'Sensitive digestion', 'Prone to constipation']
      }
    };
    return characteristics[mizajType] || characteristics.damvi;
  }

  _getDietaryGuidelines(mizajType) {
    const guidelines = {
      damvi: {
        favor: ['Cooling foods', 'Fresh fruits', 'Vegetables', 'Light proteins'],
        avoid: ['Excessive hot spices', 'Heavy meats', 'Overeating', 'Rich desserts'],
        qualities: 'Cool, light, fresh foods in moderation',
        timing: 'Regular meals, avoid late-night eating'
      },
      safravi: {
        favor: ['Cooling foods', 'Sweet fruits', 'Leafy greens', 'Whole grains'],
        avoid: ['Very hot foods', 'Fried items', 'Red meat', 'Alcohol'],
        qualities: 'Cool and moist, calming foods',
        timing: 'Regular intervals, never skip meals'
      },
      balghami: {
        favor: ['Warming spices', 'Light foods', 'Bitter greens', 'Dry-cooked foods'],
        avoid: ['Cold drinks', 'Dairy products', 'Sweet foods', 'Heavy meals'],
        qualities: 'Warm, dry, light, and stimulating',
        timing: 'Light breakfast or skip, moderate lunch, light dinner'
      },
      saudavi: {
        favor: ['Warming foods', 'Cooked vegetables', 'Healthy fats', 'Warm liquids'],
        avoid: ['Cold foods', 'Dry crackers', 'Excessive raw foods', 'Cold drinks'],
        qualities: 'Warm, moist, nourishing foods',
        timing: 'Regular warm meals, avoid cold foods'
      }
    };
    return guidelines[mizajType] || guidelines.damvi;
  }

  _getLifestyleRecommendations(mizajType) {
    const recommendations = {
      damvi: {
        exercise: 'Moderate, regular activity',
        sleep: '7-8 hours, avoid oversleeping',
        stress: 'Social activities, outdoor time',
        environment: 'Cool, airy, not overly warm'
      },
      safravi: {
        exercise: 'Cooling activities, swimming, evening walks',
        sleep: 'Sufficient rest, cool bedroom',
        stress: 'Calming practices, avoid conflict',
        environment: 'Cool, peaceful, serene'
      },
      balghami: {
        exercise: 'Vigorous, daily activity to stimulate',
        sleep: '6-7 hours, wake early',
        stress: 'Active engagement, variety',
        environment: 'Warm, dry, stimulating'
      },
      saudavi: {
        exercise: 'Gentle to moderate, warming yoga',
        sleep: 'Regular schedule, warm bedroom',
        stress: 'Warming activities, social connection',
        environment: 'Warm, moist, comforting'
      }
    };
    return recommendations[mizajType] || recommendations.damvi;
  }

  _getBalancingApproach(mizajType) {
    const approaches = {
      damvi: 'Balance excess heat and moisture with cooling, light foods',
      safravi: 'Balance heat and dryness with cooling, moistening foods',
      balghami: 'Balance cold and moisture with warming, drying foods',
      saudavi: 'Balance cold and dryness with warming, moistening foods'
    };
    return approaches[mizajType] || 'Maintain balance through appropriate diet';
  }

  _getThermalBalance(thermal) {
    return thermal === 'hot' ? 'needs_cooling' : 'needs_warming';
  }

  _getMoistureBalance(moisture) {
    return moisture === 'moist' ? 'needs_drying' : 'needs_moistening';
  }

  _getFoodQualities(mizajType) {
    const qualities = {
      damvi: ['cooling', 'light', 'fresh', 'moderate'],
      safravi: ['cooling', 'moist', 'sweet', 'calming'],
      balghami: ['warming', 'dry', 'light', 'stimulating'],
      saudavi: ['warming', 'moist', 'nourishing', 'grounding']
    };
    return qualities[mizajType] || [];
  }

  _getAvoidFoods(mizajType) {
    const avoid = {
      damvi: ['excessive_spicy', 'heavy_meats', 'fried_foods', 'alcohol'],
      safravi: ['hot_spices', 'sour_foods', 'salty_foods', 'red_meat'],
      balghami: ['cold_drinks', 'dairy', 'sweets', 'heavy_foods'],
      saudavi: ['cold_foods', 'dry_foods', 'raw_vegetables', 'ice_cream']
    };
    return avoid[mizajType] || [];
  }

  _getRecommendedHerbs(mizajType) {
    const herbs = {
      damvi: ['mint', 'coriander', 'fennel', 'rose'],
      safravi: ['sandalwood', 'cardamom', 'cinnamon', 'licorice'],
      balghami: ['ginger', 'black_pepper', 'turmeric', 'cinnamon'],
      saudavi: ['saffron', 'ginger', 'cardamom', 'fennel']
    };
    return herbs[mizajType] || [];
  }

  _getMealStructure(mizajType) {
    const structure = {
      damvi: {
        breakfast: 'light_moderate',
        lunch: 'main_meal',
        dinner: 'light'
      },
      safravi: {
        breakfast: 'moderate',
        lunch: 'main_meal',
        dinner: 'moderate'
      },
      balghami: {
        breakfast: 'skip_or_light',
        lunch: 'main_meal',
        dinner: 'very_light'
      },
      saudavi: {
        breakfast: 'warm_nourishing',
        lunch: 'main_meal',
        dinner: 'warm_light'
      }
    };
    return structure[mizajType] || structure.damvi;
  }
}

module.exports = new UnaniEngine();
