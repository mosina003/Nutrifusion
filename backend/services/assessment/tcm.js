/**
 * Traditional Chinese Medicine (TCM) Assessment Engine
 * Identifies dominant pattern imbalances (Yin/Yang, Heat/Damp, Qi)
 */

class TCMEngine {
  constructor() {
    this.patterns = ['yin_deficiency', 'yang_deficiency', 'heat_excess', 'damp_accumulation', 'qi_deficiency'];
  }

  /**
   * Score TCM assessment responses
   * @param {Object} responses - User responses with question IDs and answers
   * @returns {Object} Scored health profile
   */
  score(responses) {
    const scores = {
      yin_deficiency: 0,
      yang_deficiency: 0,
      heat_excess: 0,
      damp_accumulation: 0,
      qi_deficiency: 0
    };

    // Calculate pattern scores
    Object.entries(responses).forEach(([questionId, answer]) => {
      if (answer) {
        scores.yin_deficiency += answer.yin || 0;
        scores.yang_deficiency += answer.yang || 0;
        scores.heat_excess += answer.heat || 0;
        scores.damp_accumulation += answer.damp || 0;
        scores.qi_deficiency += answer.qi_deficiency || 0;
      }
    });

    // Sort patterns by score
    const sortedPatterns = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0);

    // Identify dominant and secondary patterns
    const dominantPattern = sortedPatterns[0] ? sortedPatterns[0][0] : 'balanced';
    const dominantScore = sortedPatterns[0] ? sortedPatterns[0][1] : 0;
    
    // Secondary pattern if significant (>= 70% of dominant score)
    const secondaryPattern = sortedPatterns[1] && sortedPatterns[1][1] >= (dominantScore * 0.7)
      ? sortedPatterns[1][0]
      : null;

    return {
      dominant_pattern: dominantPattern,
      dominant_score: dominantScore,
      secondary_pattern: secondaryPattern,
      secondary_score: secondaryPattern ? sortedPatterns[1][1] : null,
      all_scores: scores,
      pattern_description: this._getPatternDescription(dominantPattern),
      severity: this._getSeverity(dominantScore)
    };
  }

  /**
   * Get severity level based on score
   */
  _getSeverity(score) {
    if (score < 10) return 'mild';
    if (score < 20) return 'moderate';
    return 'significant';
  }

  /**
   * Get pattern description
   */
  _getPatternDescription(pattern) {
    const descriptions = {
      yin_deficiency: 'Yin Deficiency - Lack of cooling, nourishing essence',
      yang_deficiency: 'Yang Deficiency - Lack of warming, activating energy',
      heat_excess: 'Heat Excess - Excessive internal heat',
      damp_accumulation: 'Damp Accumulation - Excessive fluid retention',
      qi_deficiency: 'Qi Deficiency - Lack of vital energy',
      balanced: 'Balanced - No significant pattern identified'
    };
    return descriptions[pattern] || descriptions.balanced;
  }

  /**
   * Generate health profile from scores
   */
  generateHealthProfile(scores, userInfo) {
    const profile = {
      framework: 'tcm',
      pattern: {
        dominant: scores.dominant_pattern,
        secondary: scores.secondary_pattern,
        severity: scores.severity
      },
      scores: scores.all_scores,
      characteristics: this._getPatternCharacteristics(scores.dominant_pattern),
      dietary_guidelines: this._getDietaryGuidelines(scores.dominant_pattern, scores.secondary_pattern),
      lifestyle_recommendations: this._getLifestyleRecommendations(scores.dominant_pattern),
      organ_systems: this._getAffectedOrgans(scores.dominant_pattern),
      balancing_strategy: this._getBalancingStrategy(scores.dominant_pattern, scores.secondary_pattern)
    };

    return profile;
  }

  /**
   * Generate nutrition inputs for recommendation engine
   */
  generateNutritionInputs(scores, healthProfile) {
    const inputs = {
      primary_pattern: scores.dominant_pattern,
      secondary_pattern: scores.secondary_pattern,
      food_energetics: this._getFoodEnergetics(scores.dominant_pattern),
      healing_foods: this._getHealingFoods(scores.dominant_pattern),
      avoid_foods: this._getAvoidFoods(scores.dominant_pattern),
      cooking_methods: this._getCookingMethods(scores.dominant_pattern),
      herbs_and_spices: this._getHerbsAndSpices(scores.dominant_pattern),
      meal_composition: this._getMealComposition(scores.dominant_pattern)
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
      const validKeys = ['yin', 'yang', 'heat', 'damp', 'qi_deficiency'];
      const hasValidKey = validKeys.some(key => 
        answer.hasOwnProperty(key) && typeof answer[key] === 'number' && answer[key] >= 0 && answer[key] <= 2
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
  _getPatternCharacteristics(pattern) {
    const characteristics = {
      yin_deficiency: {
        symptoms: ['Dry mouth/throat', 'Night sweats', 'Hot palms/feet', 'Insomnia', 'Afternoon fever'],
        signs: ['Red tongue, thin coating', 'Rapid, thin pulse', 'Dry skin', 'Constipation'],
        emotional: ['Anxiety', 'Restlessness', 'Irritability at night']
      },
      yang_deficiency: {
        symptoms: ['Cold hands/feet', 'Low energy', 'Frequent urination', 'Poor circulation', 'Back weakness'],
        signs: ['Pale tongue, wet coating', 'Slow, weak pulse', 'Weak digestion', 'Weight gain'],
        emotional: ['Lethargy', 'Lack of motivation', 'Depression']
      },
      heat_excess: {
        symptoms: ['Red face', 'Thirst', 'Yellow urine', 'Strong body odor', 'Inflammation'],
        signs: ['Red tongue, yellow coating', 'Rapid, strong pulse', 'Redness/rashes', 'Acne'],
        emotional: ['Agitation', 'Anger', 'Impatience']
      },
      damp_accumulation: {
        symptoms: ['Heavy feeling', 'Bloating', 'Loose stools', 'Foggy thinking', 'Swelling'],
        signs: ['Swollen tongue, thick coating', 'Slippery pulse', 'Weight gain', 'Mucus'],
        emotional: ['Mental fog', 'Lethargy', 'Worry']
      },
      qi_deficiency: {
        symptoms: ['Fatigue', 'Weak voice', 'Shortness of breath', 'Poor appetite', 'Frequent colds'],
        signs: ['Pale tongue', 'Weak pulse', 'Tired appearance', 'Poor muscle tone'],
        emotional: ['Sadness', 'Lack of enthusiasm', 'Overthinking']
      },
      balanced: {
        symptoms: ['Good energy', 'Balanced temperature', 'Healthy digestion'],
        signs: ['Pink tongue', 'Regular pulse'],
        emotional: ['Calm', 'Balanced mood']
      }
    };
    return characteristics[pattern] || characteristics.balanced;
  }

  _getDietaryGuidelines(primary, secondary) {
    const guidelines = {
      yin_deficiency: {
        favor: ['Cooling foods', 'Moistening foods', 'Black beans', 'Mung beans', 'Pears', 'Watermelon'],
        avoid: ['Spicy foods', 'Alcohol', 'Coffee', 'Warming spices', 'Fried foods'],
        cooking: ['Steam', 'Boil', 'Simmer', 'Avoid grilling/roasting'],
        timing: 'Regular meals, no late-night eating'
      },
      yang_deficiency: {
        favor: ['Warming foods', 'Kidney beans', 'Walnuts', 'Lamb', 'Ginger', 'Cinnamon'],
        avoid: ['Cold foods', 'Raw foods', 'Ice cream', 'Cold drinks', 'Excess raw vegetables'],
        cooking: ['Slow cooking', 'Roasting', 'Warming soups', 'Stews'],
        timing: 'Eat warm foods throughout the day'
      },
      heat_excess: {
        favor: ['Cooling vegetables', 'Bitter greens', 'Cucumber', 'Celery', 'Mung beans'],
        avoid: ['Spicy foods', 'Alcohol', 'Red meat', 'Garlic', 'Ginger in excess'],
        cooking: ['Steaming', 'Boiling', 'Raw salads OK', 'Minimal oil'],
        timing: 'Regular meals, avoid overeating'
      },
      damp_accumulation: {
        favor: ['Diuretic foods', 'Barley', 'Corn', 'Aduki beans', 'Celery', 'Bitter foods'],
        avoid: ['Dairy', 'Sugar', 'Fried foods', 'Alcohol', 'Wheat', 'Bananas'],
        cooking: ['Grilling', 'Roasting', 'Drying', 'Minimal oil'],
        timing: 'Smaller meals, avoid late eating'
      },
      qi_deficiency: {
        favor: ['Easily digestible', 'Rice', 'Sweet potato', 'Chicken', 'Fish', 'Dates'],
        avoid: ['Cold foods', 'Raw foods', 'Heavy meals', 'Excessive cold drinks'],
        cooking: ['Gentle cooking', 'Steaming', 'Slow cooking', 'Warm soups'],
        timing: 'Regular meals, smaller portions'
      },
      balanced: {
        favor: ['Balanced diet', 'Variety of foods', 'Seasonal eating'],
        avoid: ['Extremes', 'Processed foods'],
        cooking: ['All methods in moderation'],
        timing: 'Regular meal times'
      }
    };

    const primaryGuidelines = guidelines[primary] || guidelines.balanced;
    if (secondary && guidelines[secondary]) {
      return {
        primary: primaryGuidelines,
        secondary: guidelines[secondary],
        note: 'Combine approaches for both patterns'
      };
    }

    return primaryGuidelines;
  }

  _getLifestyleRecommendations(pattern) {
    const recommendations = {
      yin_deficiency: {
        exercise: 'Gentle, cooling (swimming, yin yoga, tai chi)',
        sleep: '8-9 hours, before midnight, dark cool room',
        stress: 'Meditation, quiet time, avoid overstimulation',
        timing: 'Rest in afternoon, avoid late nights'
      },
      yang_deficiency: {
        exercise: 'Moderate, warming (brisk walking, gentle yang yoga)',
        sleep: '8 hours, warm bedroom, wake with sun',
        stress: 'Gentle activity, warm baths, social connection',
        timing: 'Stay active during day, rest early evening'
      },
      heat_excess: {
        exercise: 'Cooling activities (swimming, evening walks)',
        sleep: '7-8 hours, cool bedroom, calm before bed',
        stress: 'Cooling practices, nature, avoid conflict',
        timing: 'Avoid midday heat, evening relaxation'
      },
      damp_accumulation: {
        exercise: 'Active movement (jogging, aerobics, vigorous yoga)',
        sleep: '7-8 hours, well-ventilated room, wake early',
        stress: 'Active engagement, mental stimulation',
        timing: 'Morning exercise, avoid afternoon naps'
      },
      qi_deficiency: {
        exercise: 'Gentle to moderate (qigong, walking, light yoga)',
        sleep: '8-9 hours, regular schedule, rest when tired',
        stress: 'Rest adequately, avoid overwork, gentle activities',
        timing: 'Pace activities, take breaks, avoid exhaustion'
      },
      balanced: {
        exercise: 'Balanced, varied activities',
        sleep: '7-8 hours, regular schedule',
        stress: 'Balanced approach to work and rest',
        timing: 'Regular daily routine'
      }
    };
    return recommendations[pattern] || recommendations.balanced;
  }

  _getAffectedOrgans(pattern) {
    const organs = {
      yin_deficiency: ['Kidney', 'Liver', 'Heart'],
      yang_deficiency: ['Kidney', 'Spleen', 'Heart'],
      heat_excess: ['Heart', 'Liver', 'Stomach'],
      damp_accumulation: ['Spleen', 'Stomach', 'Lung'],
      qi_deficiency: ['Spleen', 'Lung', 'Kidney'],
      balanced: []
    };
    return organs[pattern] || [];
  }

  _getBalancingStrategy(primary, secondary) {
    const strategies = {
      yin_deficiency: 'Nourish Yin, clear deficiency heat, calm spirit',
      yang_deficiency: 'Tonify Yang, warm the interior, strengthen Kidney',
      heat_excess: 'Clear heat, cool blood, calm spirit',
      damp_accumulation: 'Drain dampness, strengthen Spleen, transform phlegm',
      qi_deficiency: 'Tonify Qi, strengthen Spleen, support digestion',
      balanced: 'Maintain balance through moderation'
    };

    let strategy = strategies[primary] || strategies.balanced;
    if (secondary && strategies[secondary]) {
      strategy += ` AND ${strategies[secondary]}`;
    }

    return strategy;
  }

  _getFoodEnergetics(pattern) {
    const energetics = {
      yin_deficiency: ['cool', 'moist', 'nourishing', 'yin-building'],
      yang_deficiency: ['warm', 'qi-tonifying', 'yang-building', 'energizing'],
      heat_excess: ['cool', 'cold', 'bitter', 'heat-clearing'],
      damp_accumulation: ['warm', 'drying', 'diuretic', 'light'],
      qi_deficiency: ['neutral', 'sweet', 'qi-tonifying', 'easily_digestible'],
      balanced: ['balanced', 'varied']
    };
    return energetics[pattern] || energetics.balanced;
  }

  _getHealingFoods(pattern) {
    const foods = {
      yin_deficiency: ['mung_beans', 'black_beans', 'tofu', 'pear', 'watermelon', 'spinach', 'eggs'],
      yang_deficiency: ['lamb', 'walnuts', 'kidney_beans', 'cinnamon', 'ginger', 'chicken', 'shrimp'],
      heat_excess: ['cucumber', 'celery', 'mung_beans', 'watermelon', 'bitter_melon', 'lettuce'],
      damp_accumulation: ['barley', 'corn', 'aduki_beans', 'celery', 'turnip', 'green_tea'],
      qi_deficiency: ['rice', 'sweet_potato', 'chicken', 'dates', 'mushrooms', 'oats', 'trout'],
      balanced: ['variety_of_whole_foods']
    };
    return foods[pattern] || foods.balanced;
  }

  _getAvoidFoods(pattern) {
    const avoid = {
      yin_deficiency: ['hot_spices', 'alcohol', 'coffee', 'deep_fried', 'lamb', 'excessive_garlic'],
      yang_deficiency: ['ice_cream', 'cold_drinks', 'raw_foods', 'banana', 'excess_cucumber'],
      heat_excess: ['spicy_foods', 'alcohol', 'red_meat', 'garlic', 'ginger', 'fried_foods'],
      damp_accumulation: ['dairy', 'sugar', 'fried_foods', 'alcohol', 'wheat', 'banana', 'pork'],
      qi_deficiency: ['cold_foods', 'raw_foods', 'heavy_meals', 'excessive_fiber'],
      balanced: ['processed_foods', 'excessive_anything']
    };
    return avoid[pattern] || avoid.balanced;
  }

  _getCookingMethods(pattern) {
    const methods = {
      yin_deficiency: ['steaming', 'boiling', 'simmering', 'gentle_cooking'],
      yang_deficiency: ['slow_cooking', 'roasting', 'baking', 'warming_soups'],
      heat_excess: ['steaming', 'boiling', 'raw_OK', 'minimal_oil'],
      damp_accumulation: ['grilling', 'roasting', 'dry_cooking', 'minimal_water'],
      qi_deficiency: ['steaming', 'slow_cooking', 'soup', 'gentle_methods'],
      balanced: ['varied_methods']
    };
    return methods[pattern] || methods.balanced;
  }

  _getHerbsAndSpices(pattern) {
    const herbs = {
      yin_deficiency: ['mint', 'chrysanthemum', 'goji_berry', 'mulberry', 'licorice'],
      yang_deficiency: ['ginger', 'cinnamon', 'clove', 'fennel', 'star_anise'],
      heat_excess: ['mint', 'chrysanthemum', 'dandelion', 'green_tea'],
      damp_accumulation: ['ginger', 'turmeric', 'cardamom', 'coriander', 'fennel'],
      qi_deficiency: ['ginseng', 'astragalus', 'date', 'licorice', 'cinnamon'],
      balanced: ['variety_in_moderation']
    };
    return herbs[pattern] || herbs.balanced;
  }

  _getMealComposition(pattern) {
    const composition = {
      yin_deficiency: { grains: 40, vegetables: 35, protein: 20, fruits: 5 },
      yang_deficiency: { grains: 35, vegetables: 30, protein: 30, healthy_fats: 5 },
      heat_excess: { grains: 35, vegetables: 45, protein: 15, fruits: 5 },
      damp_accumulation: { grains: 30, vegetables: 40, protein: 25, minimal_fats: 5 },
      qi_deficiency: { grains: 40, vegetables: 30, protein: 25, easy_digest: 5 },
      balanced: { grains: 35, vegetables: 35, protein: 25, healthy_variety: 5 }
    };
    return composition[pattern] || composition.balanced;
  }
}

module.exports = new TCMEngine();
