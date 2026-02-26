/**
 * Ayurveda Assessment Engine
 * Calculates Prakriti (constitution), Vikriti (imbalance), and Agni (digestive type)
 */

class AyurvedaEngine {
  constructor() {
    this.doshas = ['vata', 'pitta', 'kapha'];
    this.totalQuestions = 18;
    this.prakritiQuestions = ['ay_q1', 'ay_q2', 'ay_q3', 'ay_q4', 'ay_q5', 'ay_q6', 'ay_q7', 'ay_q8', 'ay_q9', 'ay_q10', 'ay_q11', 'ay_q12', 'ay_q13', 'ay_q14', 'ay_q15', 'ay_q16', 'ay_q17', 'ay_q18']; // Q1-Q18 (all questions)
    this.vikritiQuestions = ['ay_q7', 'ay_q8', 'ay_q9', 'ay_q10', 'ay_q11', 'ay_q12', 'ay_q13', 'ay_q14', 'ay_q15']; // Q7-Q15
    this.agniQuestions = ['ay_q7', 'ay_q8', 'ay_q9', 'ay_q10', 'ay_q11', 'ay_q12']; // Q7-Q12
  }

  /**
   * Score Ayurveda assessment responses
   * @param {Object} responses - User responses with question IDs and answers
   * @returns {Object} Scored health profile with Prakriti, Vikriti, and Agni
   */
  score(responses) {
    // Calculate Prakriti (from all 18 questions)
    const prakriti = this._calculatePrakriti(responses);
    
    // Calculate Vikriti (from Q7-Q15: digestion + mental/emotional)
    const vikriti = this._calculateVikriti(responses);
    
    // Calculate Agni (from Q7-Q12: digestion only)
    const agni = this._calculateAgni(responses);

    // Calculate severity based on imbalance (1-3 scale)
    const severity = this._calculateSeverity(prakriti, vikriti);

    return {
      prakriti,
      vikriti,
      agni,
      dominant_dosha: vikriti.dominant,  // For diet engine compatibility
      severity,                          // For diet engine compatibility
      interpretation: this._generateInterpretation(prakriti, vikriti, agni)
    };
  }

  /**
   * Calculate Prakriti (baseline constitution) from all 18 questions
   */
  _calculatePrakriti(responses) {
    const scores = { vata: 0, pitta: 0, kapha: 0 };

    // Count responses for each dosha (weight = 1 per answer)
    this.prakritiQuestions.forEach(qId => {
      const answer = responses[qId];
      if (answer && answer.dosha) {
        scores[answer.dosha] += 1;
      }
    });

    // Calculate percentages
    const total = scores.vata + scores.pitta + scores.kapha;
    const percentages = {
      vata: Math.round((scores.vata / total) * 100),
      pitta: Math.round((scores.pitta / total) * 100),
      kapha: Math.round((scores.kapha / total) * 100)
    };

    // Sort doshas by score
    const sortedDoshas = Object.entries(scores)
      .sort((a, b) => b[1] - a[1]);

    const primaryDosha = sortedDoshas[0][0];
    const primaryScore = sortedDoshas[0][1];
    const secondaryScore = sortedDoshas[1][1];
    
    // Secondary dosha exists if difference ≤ 2
    const secondaryDosha = (primaryScore - secondaryScore) <= 2 ? sortedDoshas[1][0] : null;

    const doshaType = secondaryDosha 
      ? `${this._capitalize(primaryDosha)}-${this._capitalize(secondaryDosha)}`
      : this._capitalize(primaryDosha);

    return {
      primary: primaryDosha,
      secondary: secondaryDosha,
      dosha_type: doshaType,
      percentages,
      raw_scores: scores
    };
  }

  /**
   * Calculate Vikriti (current imbalance) from Q7-Q15
   */
  _calculateVikriti(responses) {
    const scores = { vata: 0, pitta: 0, kapha: 0 };

    // Only count responses from vikriti questions (Q7-Q15)
    this.vikritiQuestions.forEach(qId => {
      const answer = responses[qId];
      if (answer && answer.dosha) {
        scores[answer.dosha] += 1;
      }
    });

    // Find dominant dosha in current state
    const sortedDoshas = Object.entries(scores)
      .sort((a, b) => b[1] - a[1]);

    const dominantDosha = sortedDoshas[0][0];
    const dominantScore = sortedDoshas[0][1];

    return {
      dominant: dominantDosha,
      scores,
      is_balanced: this._isBalanced(scores),
      description: this._getVikritiDescription(dominantDosha)
    };
  }

  /**
   * Calculate Agni (digestive type) from Q7-Q12
   */
  _calculateAgni(responses) {
    const counts = { vata: 0, pitta: 0, kapha: 0 };

    // Count digestive question responses
    this.agniQuestions.forEach(qId => {
      const answer = responses[qId];
      if (answer && answer.dosha) {
        counts[answer.dosha] += 1;
      }
    });

    // Determine Agni type based on majority
    const sortedCounts = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]);

    const dominantDosha = sortedCounts[0][0];
    const dominantCount = sortedCounts[0][1];
    const secondCount = sortedCounts[1][1];

    // If fairly balanced across all three → Sama Agni
    if (dominantCount - secondCount <= 1) {
      return {
        type: 'sama',
        name: 'Sama Agni',
        description: 'Balanced digestion',
        explanation: 'Your digestive fire is balanced and functioning optimally. Maintain your current healthy eating patterns.'
      };
    }

    // Map dosha to Agni type
    const agniTypes = {
      vata: {
        type: 'vishama',
        name: 'Vishama Agni',
        description: 'Irregular digestion',
        explanation: 'Your digestive fire fluctuates. This may manifest as irregular appetite, bloating, gas, or constipation. Regular meal timing and warm, cooked foods are essential.'
      },
      pitta: {
        type: 'tikshna',
        name: 'Tikshna Agni',
        description: 'Sharp/intense digestion',
        explanation: 'Your digestive fire is strong and fast. You may experience strong hunger, acidity, or loose stools. Avoid skipping meals and moderate spicy, oily foods.'
      },
      kapha: {
        type: 'manda',
        name: 'Manda Agni',
        description: 'Slow digestion',
        explanation: 'Your digestive fire is slow and steady. You may feel heavy after meals or lack appetite. Light, warm foods with digestive spices will help stimulate your digestion.'
      }
    };

    return agniTypes[dominantDosha];
  }

  /**
   * Calculate severity of dosha imbalance (1-3 scale)
   * @param {Object} prakriti - Baseline constitution
   * @param {Object} vikriti - Current state
   * @returns {number} Severity score (1 = mild, 2 = moderate, 3 = severe)
   */
  _calculateSeverity(prakriti, vikriti) {
    // If vikriti is balanced, severity is low
    if (vikriti.is_balanced) {
      return 1;
    }

    // Calculate total score difference between prakriti and vikriti
    const vataTotal = prakriti.raw_scores.vata;
    const pittaTotal = prakriti.raw_scores.pitta;
    const kaphaTotal = prakriti.raw_scores.kapha;

    const vikVata = vikriti.scores.vata;
    const vikPitta = vikriti.scores.pitta;
    const vikKapha = vikriti.scores.kapha;

    // Check if dominant vikriti dosha is different from prakriti primary
    if (prakriti.primary !== vikriti.dominant) {
      // Strong imbalance - different dominant dosha
      return 3;
    }

    // Calculate proportion of dominant dosha in vikriti (out of 9 vikriti questions)
    const dominantScore = vikriti.scores[vikriti.dominant];
    const totalVikritiQuestions = 9;

    // If dominant dosha is > 55% of vikriti responses (5+ out of 9)
    if (dominantScore >= 5) {
      return 3; // Severe
    } else if (dominantScore >= 4) {
      return 2; // Moderate
    } else {
      return 1; // Mild
    }
  }

  /**
   * Generate comprehensive interpretation
   */
  _generateInterpretation(prakriti, vikriti, agni) {
    const hasImbalance = prakriti.primary !== vikriti.dominant;

    return {
      constitution_overview: this._getConstitutionOverview(prakriti),
      current_state: this._getCurrentStateDescription(vikriti, hasImbalance),
      digestive_profile: agni,
      dietary_priority: this._getDietaryPriority(prakriti, vikriti, agni),
      lifestyle_recommendations: this._getLifestyleRecommendations(prakriti, vikriti),
      summary: this._generateSummary(prakriti, vikriti, agni, hasImbalance)
    };
  }

  /**
   * Get constitution overview
   */
  _getConstitutionOverview(prakriti) {
    const descriptions = {
      vata: 'You naturally possess creativity, enthusiasm, and dynamic energy with quick thinking and adaptability.',
      pitta: 'You naturally possess strong metabolism, sharp intellect, focus, and leadership qualities with determined action.',
      kapha: 'You naturally possess stability, endurance, calmness, and nurturing qualities with steady, grounded energy.'
    };

    const secondaryDescriptions = {
      vata: 'creative and dynamic',
      pitta: 'focused and driven',
      kapha: 'stable and nurturing'
    };

    let overview = descriptions[prakriti.primary];

    if (prakriti.secondary) {
      overview += ` Your secondary ${prakriti.secondary} nature adds ${secondaryDescriptions[prakriti.secondary]} traits.`;
    }

    return {
      primary_dosha: this._capitalize(prakriti.primary),
      secondary_dosha: prakriti.secondary ? this._capitalize(prakriti.secondary) : null,
      dosha_type: prakriti.dosha_type,
      description: overview,
      characteristics: this._getDoshaCharacteristics(prakriti.primary)
    };
  }

  /**
   * Get current state description
   */
  _getCurrentStateDescription(vikriti, hasImbalance) {
    if (!hasImbalance) {
      return {
        balanced: true,
        message: 'Your doshas are currently in good balance with your natural constitution.'
      };
    }

    const imbalanceDescriptions = {
      vata: 'Vata appears elevated at present. This may manifest as irregular digestion, bloating, gas, anxiety, restlessness, or disturbed sleep.',
      pitta: 'Pitta appears elevated at present. This may manifest as acidity, heartburn, irritability, anger, inflammation, or excessive heat.',
      kapha: 'Kapha appears elevated at present. This may manifest as heaviness, sluggish digestion, lethargy, excess mucus, or emotional withdrawal.'
    };

    return {
      balanced: false,
      elevated_dosha: this._capitalize(vikriti.dominant),
      message: imbalanceDescriptions[vikriti.dominant],
      recommendation: 'Your dietary and lifestyle recommendations will prioritize balancing this imbalance.'
    };
  }

  /**
   * Get dietary priority (Agni → Vikriti → Prakriti)
   */
  _getDietaryPriority(prakriti, vikriti, agni) {
    const hasImbalance = prakriti.primary !== vikriti.dominant;
    const targetDosha = hasImbalance ? vikriti.dominant : prakriti.primary;

    const guidelines = this._getDietaryGuidelines(targetDosha);

    return {
      primary_focus: agni.name,
      secondary_focus: hasImbalance ? `Balance ${this._capitalize(vikriti.dominant)}` : `Support ${prakriti.dosha_type} constitution`,
      guidelines,
      agni_specific: this._getAgniSpecificDiet(agni.type)
    };
  }

  /**
   * Get Agni-specific dietary advice
   */
  _getAgniSpecificDiet(agniType) {
    const advice = {
      vishama: {
        focus: ['Regular meal times (same time daily)', 'Warm, cooked meals', 'Easy-to-digest foods', 'Avoid cold, raw, or dry foods'],
        timing: 'Eat at regular intervals - never skip meals',
        preparation: 'Well-cooked, warm, slightly oily'
      },
      tikshna: {
        focus: ['Cool, calming foods', 'Moderate portions', 'Avoid spicy, fried, salty foods', 'Include sweet, bitter tastes'],
        timing: 'Don\'t skip meals - eat before extreme hunger',
        preparation: 'Cooling preparation, minimal spices'
      },
      manda: {
        focus: ['Light, warm meals', 'Digestive spices (ginger, cumin, black pepper)', 'Avoid heavy, oily, sweet foods', 'Smaller portions'],
        timing: 'Skip breakfast if not hungry, light dinner',
        preparation: 'Baked, grilled, or sautéed with minimal oil'
      },
      sama: {
        focus: ['Maintain balanced variety', 'Fresh, seasonal foods', 'Mindful eating', 'Continue healthy habits'],
        timing: 'Regular meal schedule',
        preparation: 'Variety of healthy cooking methods'
      }
    };

    return advice[agniType];
  }

  /**
   * Generate summary
   */
  _generateSummary(prakriti, vikriti, agni, hasImbalance) {
    let summary = `You are primarily ${prakriti.dosha_type} by constitution. `;

    if (hasImbalance) {
      summary += `Currently, ${this._capitalize(vikriti.dominant)} imbalance is present. `;
    } else {
      summary += `Your doshas are currently balanced. `;
    }

    summary += `Your digestive type is ${agni.name}. `;

    const targetDosha = hasImbalance ? vikriti.dominant : prakriti.primary;
    const dietFocus = this._getDietFocus(targetDosha, agni.type);
    
    summary += dietFocus;

    return summary;
  }

  /**
   * Get diet focus summary
   */
  _getDietFocus(dosha, agniType) {
    const focus = {
      vata: 'Your diet should prioritize warming, grounding, well-cooked meals with regular timing.',
      pitta: 'Your diet should prioritize cooling, fresh foods while avoiding excess heat and spice.',
      kapha: 'Your diet should prioritize light, warm, stimulating foods with digestive spices.'
    };

    return focus[dosha];
  }

  /**
   * Check if doshas are balanced
   */
  _isBalanced(scores) {
    const values = Object.values(scores);
    const max = Math.max(...values);
    const min = Math.min(...values);
    return (max - min) <= 1;
  }

  /**
   * Get Vikriti description
   */
  _getVikritiDescription(dosha) {
    const descriptions = {
      vata: 'Current Vata elevation',
      pitta: 'Current Pitta elevation',
      kapha: 'Current Kapha elevation'
    };
    return descriptions[dosha];
  }

  /**
   * Generate health profile from scores
   */
  generateHealthProfile(scores, userInfo) {
    return {
      framework: 'ayurveda',
      prakriti: scores.prakriti,
      vikriti: scores.vikriti,
      agni: scores.agni,
      interpretation: scores.interpretation,
      user_info: userInfo
    };
  }

  /**
   * Generate nutrition inputs for recommendation engine
   */
  generateNutritionInputs(scores, healthProfile) {
    const hasImbalance = scores.prakriti.primary !== scores.vikriti.dominant;
    const targetDosha = hasImbalance ? scores.vikriti.dominant : scores.prakriti.primary;

    return {
      target_dosha: targetDosha,
      prakriti: scores.prakriti.primary,
      vikriti: scores.vikriti.dominant,
      agni_type: scores.agni.type,
      balancing_tastes: this._getBalancingTastes(targetDosha),
      avoid_qualities: this._getAvoidQualities(targetDosha),
      meal_timing: this._getMealTiming(scores.agni.type),
      cooking_methods: this._getCookingMethods(targetDosha)
    };
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
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Helper methods
  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  _getDoshaCharacteristics(dosha) {
    const characteristics = {
      vata: {
        physical: ['Light, thin frame', 'Dry skin and hair', 'Variable appetite', 'Quick movements'],
        mental: ['Creative and enthusiastic', 'Quick thinking', 'Easily distracted', 'Adaptable'],
        digestion: ['Irregular appetite', 'Prone to gas and bloating', 'Tendency toward constipation'],
        when_balanced: 'Creative, joyful, energetic',
        when_imbalanced: 'Anxious, scattered, restless'
      },
      pitta: {
        physical: ['Medium, athletic build', 'Warm body temperature', 'Strong appetite', 'Sharp features'],
        mental: ['Focused and intelligent', 'Determined', 'Leadership qualities', 'Perfectionist'],
        digestion: ['Strong, sharp appetite', 'Fast digestion', 'Prone to acidity'],
        when_balanced: 'Focused, courageous, confident',
        when_imbalanced: 'Irritable, angry, critical'
      },
      kapha: {
        physical: ['Solid, sturdy build', 'Smooth, moist skin', 'Steady energy', 'Strong endurance'],
        mental: ['Calm and patient', 'Methodical', 'Good memory', 'Nurturing'],
        digestion: ['Slow, steady appetite', 'Can skip meals easily', 'Slow metabolism'],
        when_balanced: 'Loving, calm, stable',
        when_imbalanced: 'Lethargic, stubborn, possessive'
      }
    };
    return characteristics[dosha];
  }

  _getDietaryGuidelines(dosha) {
    const guidelines = {
      vata: {
        favor: ['Warm, cooked foods', 'Sweet, sour, salty tastes', 'Grounding foods (root vegetables, grains)', 'Healthy fats (ghee, olive oil)', 'Warm beverages'],
        avoid: ['Cold, frozen foods', 'Raw vegetables (in excess)', 'Dry, light foods (crackers, popcorn)', 'Bitter, astringent tastes', 'Caffeine'],
        qualities: 'Warm, moist, oily, grounding, nourishing',
        meal_pattern: 'Regular meal times are essential'
      },
      pitta: {
        favor: ['Cool, fresh foods', 'Sweet, bitter, astringent tastes', 'Fresh fruits and vegetables', 'Whole grains', 'Cooling herbs (cilantro, mint)'],
        avoid: ['Spicy, hot foods', 'Sour, salty, pungent tastes', 'Fried, oily foods', 'Red meat', 'Alcohol'],
        qualities: 'Cool, fresh, moderate, sweet',
        meal_pattern: 'Never skip meals, moderate portions'
      },
      kapha: {
        favor: ['Light, warm foods', 'Pungent, bitter, astringent tastes', 'Vegetables (especially leafy greens)', 'Legumes', 'Warming spices (ginger, black pepper, cumin)'],
        avoid: ['Heavy, oily foods', 'Sweet, sour, salty tastes', 'Dairy products', 'Fried foods', 'Cold foods and drinks'],
        qualities: 'Light, dry, warm, stimulating',
        meal_pattern: 'Can skip breakfast if not hungry, light dinner'
      }
    };
    return guidelines[dosha];
  }

  _getLifestyleRecommendations(prakriti, vikriti) {
    const targetDosha = prakriti.primary !== vikriti.dominant ? vikriti.dominant : prakriti.primary;

    const recommendations = {
      vata: {
        exercise: 'Gentle, grounding activities: yoga, walking, tai chi, swimming',
        sleep: 'Establish regular sleep schedule, aim for 7-8 hours, sleep before 10pm',
        stress_management: 'Meditation, warm oil massage (abhyanga), calming activities, routine',
        environment: 'Warm, stable, peaceful, avoid excess stimulation',
        daily_routine: 'Maintain regular daily schedule for meals, sleep, and activities'
      },
      pitta: {
        exercise: 'Moderate intensity, cooling activities: swimming, walking in nature, yoga',
        sleep: '7-8 hours in cool, dark room, avoid late-night work',
        stress_management: 'Cooling activities, nature exposure, avoid competitive activities',
        environment: 'Cool, calm, peaceful, avoid excess heat',
        daily_routine: 'Regular schedule but allow flexibility, avoid perfectionism'
      },
      kapha: {
        exercise: 'Vigorous, stimulating activities: running, cycling, aerobics, dancing',
        sleep: '6-7 hours, wake before 6am, avoid oversleeping',
        stress_management: 'Active hobbies, social activities, new experiences, variety',
        environment: 'Stimulating, bright, active, avoid damp, cold spaces',
        daily_routine: 'Vary routine, embrace change, stay active'
      }
    };

    return recommendations[targetDosha];
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
      vata: ['cold', 'dry', 'light', 'raw', 'rough'],
      pitta: ['hot', 'spicy', 'oily', 'salty', 'sour'],
      kapha: ['heavy', 'oily', 'sweet', 'cold', 'damp']
    };
    return avoid[dosha];
  }

  _getMealTiming(agniType) {
    const timing = {
      vishama: {
        breakfast: '7-8am (warm, grounding, never skip)',
        lunch: '12-1pm (largest meal, warm)',
        dinner: '6-7pm (light, warm, early)',
        note: 'Eat at the same times daily'
      },
      tikshna: {
        breakfast: '7-8am (moderate, cooling)',
        lunch: '12-1pm (largest meal)',
        dinner: '6-7pm (moderate, not too late)',
        note: 'Never skip meals to avoid excess hunger'
      },
      manda: {
        breakfast: '8-9am (light or skip if not hungry)',
        lunch: '12-1pm (largest meal with spices)',
        dinner: '5-6pm (very light, early)',
        note: 'Avoid heavy evening meals'
      },
      sama: {
        breakfast: '7-8am (balanced)',
        lunch: '12-1pm (largest meal)',
        dinner: '6-7pm (moderate)',
        note: 'Maintain regular schedule'
      }
    };
    return timing[agniType];
  }

  _getCookingMethods(dosha) {
    const methods = {
      vata: ['steaming', 'boiling', 'sautéing with ghee/oil', 'baking', 'stewing'],
      pitta: ['steaming', 'boiling', 'light sautéing', 'raw (in moderation)', 'minimal added fats'],
      kapha: ['grilling', 'roasting', 'baking', 'dry sautéing', 'stir-frying', 'minimal oil']
    };
    return methods[dosha];
  }
}

module.exports = new AyurvedaEngine();
