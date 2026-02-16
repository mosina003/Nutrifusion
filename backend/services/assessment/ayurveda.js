/**
 * Ayurveda Assessment Engine
 * Identifies Prakriti (constitution) through weighted scoring
 */

class AyurvedaEngine {
  constructor() {
    this.doshas = ['vata', 'pitta', 'kapha'];
  }

  /**
   * Score Ayurveda assessment responses
   * @param {Object} responses - User responses with question IDs and answers
   * @returns {Object} Scored health profile
   */
  score(responses) {
    const scores = {
      vata: 0,
      pitta: 0,
      kapha: 0
    };

    // Calculate weighted scores
    Object.entries(responses).forEach(([questionId, answer]) => {
      if (answer && answer.dosha && answer.weight) {
        scores[answer.dosha] += answer.weight;
      }
    });

    // Calculate total and percentages
    const total = scores.vata + scores.pitta + scores.kapha;
    const percentages = {
      vata: Math.round((scores.vata / total) * 100),
      pitta: Math.round((scores.pitta / total) * 100),
      kapha: Math.round((scores.kapha / total) * 100)
    };

    // Identify primary and secondary doshas
    const sortedDoshas = Object.entries(percentages)
      .sort((a, b) => b[1] - a[1]);

    const primaryDosha = sortedDoshas[0][0];
    const secondaryDosha = sortedDoshas[1][1] >= 25 ? sortedDoshas[1][0] : null;

    return {
      primary_dosha: primaryDosha,
      secondary_dosha: secondaryDosha,
      vata_percentage: percentages.vata,
      pitta_percentage: percentages.pitta,
      kapha_percentage: percentages.kapha,
      raw_scores: scores,
      dosha_type: this._getDoshaType(primaryDosha, secondaryDosha)
    };
  }

  /**
   * Get dosha type description
   */
  _getDoshaType(primary, secondary) {
    if (!secondary) {
      return primary.charAt(0).toUpperCase() + primary.slice(1);
    }
    return `${primary.charAt(0).toUpperCase() + primary.slice(1)}-${secondary.charAt(0).toUpperCase() + secondary.slice(1)}`;
  }

  /**
   * Generate health profile from scores
   */
  generateHealthProfile(scores, userInfo) {
    const profile = {
      framework: 'ayurveda',
      constitution: {
        primary_dosha: scores.primary_dosha,
        secondary_dosha: scores.secondary_dosha,
        dosha_type: scores.dosha_type
      },
      percentages: {
        vata: scores.vata_percentage,
        pitta: scores.pitta_percentage,
        kapha: scores.kapha_percentage
      },
      characteristics: this._getDoshaCharacteristics(scores.primary_dosha),
      dietary_guidelines: this._getDietaryGuidelines(scores.primary_dosha, scores.secondary_dosha),
      lifestyle_recommendations: this._getLifestyleRecommendations(scores.primary_dosha)
    };

    return profile;
  }

  /**
   * Generate nutrition inputs for recommendation engine
   */
  generateNutritionInputs(scores, healthProfile) {
    const inputs = {
      primary_quality: this._getPrimaryQuality(scores.primary_dosha),
      secondary_quality: scores.secondary_dosha ? this._getPrimaryQuality(scores.secondary_dosha) : null,
      balancing_tastes: this._getBalancingTastes(scores.primary_dosha),
      avoid_qualities: this._getAvoidQualities(scores.primary_dosha),
      meal_timing: this._getMealTiming(scores.primary_dosha),
      cooking_methods: this._getCookingMethods(scores.primary_dosha)
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
      if (!answer.dosha || !['vata', 'pitta', 'kapha'].includes(answer.dosha)) {
        errors.push(`Invalid dosha value for question ${qId}`);
      }
      if (!answer.weight || typeof answer.weight !== 'number') {
        errors.push(`Invalid weight for question ${qId}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Helper methods for characteristics and recommendations
  _getDoshaCharacteristics(dosha) {
    const characteristics = {
      vata: {
        physical: ['Light frame', 'Thin build', 'Dry skin', 'Variable appetite'],
        mental: ['Creative', 'Quick thinking', 'Easily distracted', 'Enthusiastic'],
        digestion: ['Irregular', 'Prone to gas', 'Variable hunger']
      },
      pitta: {
        physical: ['Medium build', 'Warm body', 'Strong appetite', 'Good muscle tone'],
        mental: ['Focused', 'Intelligent', 'Determined', 'Leadership qualities'],
        digestion: ['Strong', 'Regular', 'Prone to acidity']
      },
      kapha: {
        physical: ['Solid build', 'Strong endurance', 'Smooth skin', 'Steady energy'],
        mental: ['Calm', 'Patient', 'Methodical', 'Good memory'],
        digestion: ['Slow', 'Steady', 'Can skip meals']
      }
    };
    return characteristics[dosha];
  }

  _getDietaryGuidelines(primary, secondary) {
    const guidelines = {
      vata: {
        favor: ['Warm foods', 'Cooked meals', 'Sweet/sour/salty tastes', 'Grounding foods'],
        avoid: ['Cold foods', 'Raw foods', 'Bitter/astringent tastes', 'Dry crackers'],
        timing: 'Regular meal times',
        qualities: 'Warm, moist, oily, grounding'
      },
      pitta: {
        favor: ['Cool foods', 'Sweet/bitter/astringent tastes', 'Moderate portions', 'Fresh foods'],
        avoid: ['Spicy foods', 'Fried foods', 'Sour/salty tastes', 'Alcohol'],
        timing: 'Don\'t skip meals',
        qualities: 'Cool, fresh, moderate'
      },
      kapha: {
        favor: ['Light foods', 'Pungent/bitter/astringent tastes', 'Spices', 'Vegetables'],
        avoid: ['Heavy foods', 'Sweet/sour/salty tastes', 'Dairy', 'Fried foods'],
        timing: 'Skip breakfast if not hungry',
        qualities: 'Light, dry, warm, stimulating'
      }
    };

    const primaryGuidelines = guidelines[primary];
    if (secondary && guidelines[secondary]) {
      return {
        primary: primaryGuidelines,
        secondary: guidelines[secondary],
        note: 'Balance both doshas in your diet'
      };
    }

    return primaryGuidelines;
  }

  _getLifestyleRecommendations(dosha) {
    const recommendations = {
      vata: {
        exercise: 'Gentle, grounding (yoga, walking, tai chi)',
        sleep: 'Regular schedule, 7-8 hours, before 10pm',
        stress: 'Meditation, massage, warm baths',
        environment: 'Warm, stable, peaceful'
      },
      pitta: {
        exercise: 'Moderate intensity, cooling (swimming, walking)',
        sleep: '7-8 hours, cool bedroom',
        stress: 'Cooling activities, nature walks',
        environment: 'Cool, peaceful, not competitive'
      },
      kapha: {
        exercise: 'Vigorous, stimulating (running, aerobics)',
        sleep: '6-7 hours, wake early',
        stress: 'Active hobbies, social activities',
        environment: 'Stimulating, bright, active'
      }
    };
    return recommendations[dosha];
  }

  _getPrimaryQuality(dosha) {
    const qualities = {
      vata: 'light_dry_cold_mobile',
      pitta: 'hot_sharp_oily_light',
      kapha: 'heavy_slow_cool_stable'
    };
    return qualities[dosha];
  }

  _getBalancingTastes(dosha) {
    const tastes = {
      vata: ['sweet', 'sour', 'salty'],
      pitta: ['sweet', 'bitter', 'astringent'],
      kapha: ['pungent', 'bitter', 'astringent']
    };
    return tastes[dosha];
  }

  _getAvoidQualities(dosha) {
    const avoid = {
      vata: ['cold', 'dry', 'light', 'raw'],
      pitta: ['hot', 'spicy', 'oily', 'salty'],
      kapha: ['heavy', 'oily', 'sweet', 'cold']
    };
    return avoid[dosha];
  }

  _getMealTiming(dosha) {
    const timing = {
      vata: {
        breakfast: '7-8am (warm, grounding)',
        lunch: '12-1pm (largest meal)',
        dinner: '6-7pm (light, warm)'
      },
      pitta: {
        breakfast: '7-8am (moderate)',
        lunch: '12-1pm (largest meal)',
        dinner: '6-7pm (moderate)'
      },
      kapha: {
        breakfast: '8-9am (light or skip)',
        lunch: '12-1pm (largest meal)',
        dinner: '6pm (light)'
      }
    };
    return timing[dosha];
  }

  _getCookingMethods(dosha) {
    const methods = {
      vata: ['steaming', 'boiling', 'baking', 'sautéing with ghee'],
      pitta: ['steaming', 'boiling', 'moderate heat', 'minimal oil'],
      kapha: ['grilling', 'roasting', 'baking', 'dry cooking', 'stir-frying']
    };
    return methods[dosha];
  }
}

module.exports = new AyurvedaEngine();
