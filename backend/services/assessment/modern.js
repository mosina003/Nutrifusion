/**
 * Modern Evidence-Based Clinical Nutrition Assessment Engine
 * Generates clinical nutrition profile with BMI, BMR, TDEE, and macronutrient calculations
 */

class ModernEngine {
  constructor() {
    this.activityLevels = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };
  }

  /**
   * Score/Calculate Modern clinical assessment
   * @param {Object} responses - User responses containing demographic and health data
   * @returns {Object} Calculated health metrics
   */
  score(responses) {
    // Extract key data from responses
    const age = parseInt(responses.age?.value);
    const gender = responses.gender?.value;
    const height = parseFloat(responses.height?.value); // in cm
    const weight = parseFloat(responses.weight?.value); // in kg
    const activityLevel = responses.activity_level?.value;
    const medicalConditions = responses.medical_conditions?.value || [];
    const dietaryPreference = responses.dietary_preference?.value;
    const allergies = responses.allergies?.value || [];
    const sleepQuality = responses.sleep_quality?.value;
    const stressLevel = responses.stress_level?.value;
    const goals = responses.goals?.value || [];

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const bmiCategory = this._getBMICategory(bmi);

    // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else if (gender === 'female') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    } else {
      // Use average for non-binary
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 78;
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    const activityMultiplier = this.activityLevels[activityLevel] || 1.55;
    const tdee = bmr * activityMultiplier;

    // Adjust calories based on goals
    const adjustedCalories = this._adjustCaloriesForGoals(tdee, goals, bmiCategory);

    // Calculate macronutrient distribution
    const macros = this._calculateMacros(adjustedCalories, dietaryPreference, medicalConditions, goals);

    // Identify risk flags
    const riskFlags = this._identifyRiskFlags(bmi, medicalConditions, allergies, sleepQuality, stressLevel, age);

    // Generate recommendations
    const recommendations = this._generateRecommendations(bmiCategory, riskFlags, goals, medicalConditions);

    return {
      bmi: Math.round(bmi * 10) / 10,
      bmi_category: bmiCategory,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      recommended_calories: Math.round(adjustedCalories),
      macro_split: macros,
      risk_flags: riskFlags,
      recommendations: recommendations,
      health_metrics: {
        sleep_quality: sleepQuality,
        stress_level: stressLevel,
        activity_level: activityLevel
      }
    };
  }

  /**
   * Get BMI Category
   */
  _getBMICategory(bmi) {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  /**
   * Adjust calories based on goals
   */
  _adjustCaloriesForGoals(tdee, goals, bmiCategory) {
    if (goals.includes('weight_loss') || (bmiCategory === 'overweight' || bmiCategory === 'obese')) {
      return tdee * 0.85; // 15% deficit
    }
    if (goals.includes('weight_gain') || bmiCategory === 'underweight') {
      return tdee * 1.15; // 15% surplus
    }
    if (goals.includes('muscle_gain')) {
      return tdee * 1.10; // 10% surplus
    }
    return tdee; // maintenance
  }

  /**
   * Calculate macronutrient distribution
   */
  _calculateMacros(calories, dietaryPreference, medicalConditions, goals) {
    let proteinPercent, carbPercent, fatPercent;

    // Base distribution on dietary preference
    if (dietaryPreference === 'keto' || dietaryPreference === 'low_carb') {
      proteinPercent = 30;
      carbPercent = 10;
      fatPercent = 60;
    } else if (dietaryPreference === 'high_protein') {
      proteinPercent = 35;
      carbPercent = 35;
      fatPercent = 30;
    } else if (dietaryPreference === 'balanced' || dietaryPreference === 'mediterranean') {
      proteinPercent = 25;
      carbPercent = 45;
      fatPercent = 30;
    } else if (dietaryPreference === 'vegan' || dietaryPreference === 'vegetarian') {
      proteinPercent = 20;
      carbPercent = 50;
      fatPercent = 30;
    } else {
      // Default balanced
      proteinPercent = 25;
      carbPercent = 45;
      fatPercent = 30;
    }

    // Adjust for medical conditions
    if (medicalConditions.includes('diabetes') || medicalConditions.includes('prediabetes')) {
      carbPercent = Math.max(carbPercent - 10, 25);
      proteinPercent += 5;
      fatPercent += 5;
    }

    if (medicalConditions.includes('kidney_disease')) {
      proteinPercent = Math.min(proteinPercent - 5, 15);
      carbPercent += 3;
      fatPercent += 2;
    }

    // Adjust for goals
    if (goals.includes('muscle_gain')) {
      proteinPercent = Math.max(proteinPercent, 30);
    }

    // Ensure percentages add up to 100
    const total = proteinPercent + carbPercent + fatPercent;
    proteinPercent = Math.round((proteinPercent / total) * 100);
    carbPercent = Math.round((carbPercent / total) * 100);
    fatPercent = 100 - proteinPercent - carbPercent;

    // Calculate grams
    const proteinGrams = Math.round((calories * proteinPercent / 100) / 4);
    const carbGrams = Math.round((calories * carbPercent / 100) / 4);
    const fatGrams = Math.round((calories * fatPercent / 100) / 9);

    return {
      protein: {
        percent: proteinPercent,
        grams: proteinGrams,
        calories: proteinGrams * 4
      },
      carbs: {
        percent: carbPercent,
        grams: carbGrams,
        calories: carbGrams * 4
      },
      fats: {
        percent: fatPercent,
        grams: fatGrams,
        calories: fatGrams * 9
      }
    };
  }

  /**
   * Identify health risk flags
   */
  _identifyRiskFlags(bmi, medicalConditions, allergies, sleepQuality, stressLevel, age) {
    const flags = [];

    // BMI-related flags
    if (bmi < 18.5) flags.push({ type: 'nutrition', severity: 'moderate', message: 'Underweight - may need to increase caloric intake' });
    if (bmi >= 30) flags.push({ type: 'nutrition', severity: 'high', message: 'Obesity - increased risk of chronic diseases' });
    if (bmi >= 25 && bmi < 30) flags.push({ type: 'nutrition', severity: 'moderate', message: 'Overweight - consider weight management' });

    // Medical condition flags
    if (medicalConditions.includes('diabetes')) {
      flags.push({ type: 'medical', severity: 'high', message: 'Diabetes - requires careful carbohydrate management' });
    }
    if (medicalConditions.includes('hypertension')) {
      flags.push({ type: 'medical', severity: 'high', message: 'Hypertension - sodium restriction recommended' });
    }
    if (medicalConditions.includes('heart_disease')) {
      flags.push({ type: 'medical', severity: 'high', message: 'Heart disease - focus on heart-healthy fats and fiber' });
    }
    if (medicalConditions.includes('kidney_disease')) {
      flags.push({ type: 'medical', severity: 'high', message: 'Kidney disease - protein and potassium management needed' });
    }

    // Sleep quality flags
    if (sleepQuality === 'poor' || sleepQuality === 'very_poor') {
      flags.push({ type: 'lifestyle', severity: 'moderate', message: 'Poor sleep quality - may affect metabolism and hunger hormones' });
    }

    // Stress level flags
    if (stressLevel === 'high' || stressLevel === 'very_high') {
      flags.push({ type: 'lifestyle', severity: 'moderate', message: 'High stress - may lead to emotional eating and inflammation' });
    }

    // Age-related flags
    if (age >= 65) {
      flags.push({ type: 'nutrition', severity: 'low', message: 'Senior - ensure adequate protein and vitamin D intake' });
    }

    // Allergy flags
    if (allergies.length > 0) {
      flags.push({ type: 'allergy', severity: 'moderate', message: `Food allergies present: ${allergies.join(', ')}` });
    }

    return flags;
  }

  /**
   * Generate clinical recommendations
   */
  _generateRecommendations(bmiCategory, riskFlags, goals, medicalConditions) {
    const recommendations = [];

    // BMI-based recommendations
    if (bmiCategory === 'underweight') {
      recommendations.push('Focus on calorie-dense, nutrient-rich foods');
      recommendations.push('Include healthy fats like nuts, avocados, and olive oil');
      recommendations.push('Eat more frequently throughout the day');
    } else if (bmiCategory === 'overweight' || bmiCategory === 'obese') {
      recommendations.push('Focus on portion control and mindful eating');
      recommendations.push('Increase fiber intake with vegetables and whole grains');
      recommendations.push('Reduce processed foods and added sugars');
    }

    // Medical condition recommendations
    if (medicalConditions.includes('diabetes')) {
      recommendations.push('Choose low glycemic index foods');
      recommendations.push('Monitor carbohydrate intake at each meal');
      recommendations.push('Include fiber-rich foods to stabilize blood sugar');
    }

    if (medicalConditions.includes('hypertension')) {
      recommendations.push('Limit sodium intake to 2,300mg or less per day');
      recommendations.push('Increase potassium-rich foods (if no kidney issues)');
      recommendations.push('Follow DASH diet principles');
    }

    if (medicalConditions.includes('heart_disease')) {
      recommendations.push('Choose lean proteins and fish rich in omega-3s');
      recommendations.push('Limit saturated and trans fats');
      recommendations.push('Increase soluble fiber intake');
    }

    // Goal-based recommendations
    if (goals.includes('muscle_gain')) {
      recommendations.push('Consume protein within 2 hours post-workout');
      recommendations.push('Distribute protein evenly throughout the day');
      recommendations.push('Include resistance training 3-4 times per week');
    }

    if (goals.includes('energy_boost')) {
      recommendations.push('Maintain stable blood sugar with balanced meals');
      recommendations.push('Stay hydrated throughout the day');
      recommendations.push('Include iron-rich foods if energy is low');
    }

    // General health recommendations
    recommendations.push('Stay hydrated with at least 8 glasses of water daily');
    recommendations.push('Include a variety of colorful fruits and vegetables');
    recommendations.push('Practice regular meal timing for metabolic health');

    return recommendations;
  }

  /**
   * Generate health profile from scores
   */
  generateHealthProfile(scores, responses) {
    const profile = {
      framework: 'modern',
      demographics: {
        age: responses.age?.value,
        gender: responses.gender?.value,
        height: responses.height?.value,
        weight: responses.weight?.value
      },
      body_composition: {
        bmi: scores.bmi,
        category: scores.bmi_category
      },
      energy_requirements: {
        bmr: scores.bmr,
        tdee: scores.tdee,
        recommended_calories: scores.recommended_calories
      },
      macronutrient_targets: scores.macro_split,
      health_status: {
        medical_conditions: responses.medical_conditions?.value || [],
        allergies: responses.allergies?.value || [],
        dietary_preference: responses.dietary_preference?.value,
        sleep_quality: scores.health_metrics.sleep_quality,
        stress_level: scores.health_metrics.stress_level,
        activity_level: scores.health_metrics.activity_level
      },
      goals: responses.goals?.value || [],
      risk_flags: scores.risk_flags,
      recommendations: scores.recommendations
    };

    return profile;
  }

  /**
   * Generate nutrition inputs for recommendation engine
   */
  generateNutritionInputs(scores, healthProfile) {
    const inputs = {
      calorie_target: scores.recommended_calories,
      protein_target: scores.macro_split.protein.grams,
      carb_target: scores.macro_split.carbs.grams,
      fat_target: scores.macro_split.fats.grams,
      dietary_restrictions: healthProfile.health_status.allergies,
      dietary_preference: healthProfile.health_status.dietary_preference,
      medical_considerations: healthProfile.health_status.medical_conditions,
      meal_frequency: this._getMealFrequency(scores.bmi_category, healthProfile.goals),
      nutrient_priorities: this._getNutrientPriorities(scores.risk_flags, healthProfile.health_status.medical_conditions),
      hydration_target: this._getHydrationTarget(healthProfile.demographics.weight)
    };

    return inputs;
  }

  /**
   * Validate responses before scoring
   */
  validateResponses(responses, requiredQuestions) {
    const errors = [];

    // Check required fields
    const requiredFields = ['age', 'gender', 'height', 'weight', 'activity_level'];
    requiredFields.forEach(field => {
      if (!responses[field] || !responses[field].value) {
        errors.push(`${field} is required`);
      }
    });

    // Validate age
    if (responses.age?.value) {
      const age = parseInt(responses.age.value);
      if (isNaN(age) || age < 16 || age > 120) {
        errors.push('Age must be between 16 and 120');
      }
    }

    // Validate height
    if (responses.height?.value) {
      const height = parseFloat(responses.height.value);
      if (isNaN(height) || height < 100 || height > 250) {
        errors.push('Height must be between 100 and 250 cm');
      }
    }

    // Validate weight
    if (responses.weight?.value) {
      const weight = parseFloat(responses.weight.value);
      if (isNaN(weight) || weight < 30 || weight > 300) {
        errors.push('Weight must be between 30 and 300 kg');
      }
    }

    // Validate activity level
    if (responses.activity_level?.value) {
      const validLevels = Object.keys(this.activityLevels);
      if (!validLevels.includes(responses.activity_level.value)) {
        errors.push('Invalid activity level');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Helper methods
  _getMealFrequency(bmiCategory, goals) {
    if (goals.includes('weight_loss')) return '4-5 small meals';
    if (goals.includes('muscle_gain')) return '5-6 meals with protein';
    if (bmiCategory === 'underweight') return '5-6 meals';
    return '3 meals + 1-2 snacks';
  }

  _getNutrientPriorities(riskFlags, medicalConditions) {
    const priorities = [];

    if (medicalConditions.includes('diabetes')) {
      priorities.push('fiber', 'chromium', 'magnesium');
    }
    if (medicalConditions.includes('hypertension')) {
      priorities.push('potassium', 'magnesium', 'calcium');
    }
    if (medicalConditions.includes('heart_disease')) {
      priorities.push('omega_3', 'fiber', 'antioxidants');
    }
    if (medicalConditions.includes('osteoporosis')) {
      priorities.push('calcium', 'vitamin_d', 'vitamin_k');
    }

    // General priorities
    if (priorities.length === 0) {
      priorities.push('fiber', 'protein', 'vitamins', 'minerals');
    }

    return priorities;
  }

  _getHydrationTarget(weight) {
    // 30-35ml per kg body weight
    const minWater = Math.round((weight * 30) / 1000 * 10) / 10;
    const maxWater = Math.round((weight * 35) / 1000 * 10) / 10;
    return `${minWater}-${maxWater} liters per day`;
  }
}

module.exports = new ModernEngine();
