/**
 * TCM 7-Day Meal Plan Generator
 * Creates balanced weekly meal plans based on TCM pattern diagnosis
 */

class TCMMealPlanGenerator {
  constructor() {
    this.usedCombinations = new Set();
    this.ingredientUsage = {
      grains: {},
      proteins: {},
      vegetables: {},
      fruits: {}
    };
  }

  /**
   * Generate 7-day meal plan from ranked foods
   * @param {Object} rankedFoods - Output from TCMDietEngine.rankFoods()
   * @param {Object} userAssessment - User's TCM assessment
   * @returns {Object} - 7-day meal plan with reasoning
   */
  generateWeeklyPlan(rankedFoods, userAssessment) {
    this._resetTracking();

    const suitableFoods = rankedFoods.top_ranked_foods;

    // Group foods by category for easier meal composition
    const foodsByCategory = this._groupByCategory(suitableFoods);

    const weekPlan = {};
    
    for (let day = 1; day <= 7; day++) {
      weekPlan[`day_${day}`] = this._generateDayMeals(
        foodsByCategory,
        userAssessment,
        day
      );
    }

    return {
      top_ranked_foods: rankedFoods.top_ranked_foods.slice(0, 10).map(f => ({
        food_name: f.food_name,
        score: f.score
      })),
      "7_day_plan": weekPlan,
      reasoning_summary: this._generateReasoningSummary(userAssessment, foodsByCategory)
    };
  }

  /**
   * Generate meals for a single day
   * @private
   */
  _generateDayMeals(foodsByCategory, userAssessment, dayNumber) {
    const { primary_pattern, cold_heat } = userAssessment;

    return {
      breakfast: this._selectBreakfast(foodsByCategory, primary_pattern, cold_heat),
      lunch: this._selectLunch(foodsByCategory, primary_pattern, cold_heat, dayNumber),
      dinner: this._selectDinner(foodsByCategory, primary_pattern, cold_heat)
    };
  }

  /**
   * BREAKFAST - Warm and digestion-supportive, avoid cold/raw foods
   * @private
   */
  _selectBreakfast(foodsByCategory, pattern, cold_heat) {
    const breakfast = [];
    
    // Select warm grains (avoid cold thermal nature)
    const warmGrains = (foodsByCategory.Grain || []).filter(f => 
      f.rawFood.tcm?.thermalNature !== 'Cold' && 
      !this._isUsedRecently(f, 'breakfast')
    );

    if (warmGrains.length > 0) {
      const grain = warmGrains[0];
      breakfast.push(grain.food_name);
      this._markAsUsed(grain, 'breakfast');
    }

    // For Qi Deficiency or Cold pattern, add Qi-tonifying food
    if (pattern === 'Qi Deficiency' || cold_heat === 'Cold') {
      const qiTonifying = [
        ...(foodsByCategory.Grain || []),
        ...(foodsByCategory.Legume || []),
        ...(foodsByCategory.Protein || [])
      ].find(f => 
        f.rawFood.tcm?.tonifies_qi === true && 
        !this._isUsedRecently(f, 'breakfast')
      );
      
      if (qiTonifying && !breakfast.includes(qiTonifying.food_name)) {
        breakfast.push(qiTonifying.food_name);
        this._markAsUsed(qiTonifying, 'breakfast');
      }
    }

    // Add optional warming beverage
    const beverages = (foodsByCategory.Beverage || []).filter(f => 
      f.rawFood.tcm?.thermalNature !== 'Cold'
    );
    if (beverages.length > 0) {
      const beverage = beverages[0];
      breakfast.push(beverage.food_name);
    }

    return breakfast;
  }

  /**
   * LUNCH - Main meal: Include Qi support + pattern correction
   * @private
   */
  _selectLunch(foodsByCategory, pattern, cold_heat, dayNumber) {
    const lunch = [];

    // 1. Select Grain (Qi support, max 2 times/week per grain)
    const grains = (foodsByCategory.Grain || []).filter(f => 
      !this._isOverused(f.food_name, 'grains', 2)
    );
    if (grains.length > 0) {
      const grain = grains[dayNumber % grains.length];
      lunch.push(grain.food_name);
      this._incrementUsage(grain.food_name, 'grains');
    }

    // 2. Select Protein (pattern-specific)
    const proteins = [
      ...(foodsByCategory.Legume || []),
      ...(foodsByCategory.Protein || [])
    ].filter(f => !this._isOverused(f.food_name, 'proteins', 2));
    
    if (proteins.length > 0) {
      // For Dampness, prefer resolves_dampness proteins
      if (pattern === 'Dampness') {
        const dampnessResolver = proteins.find(p => p.rawFood.tcm?.resolves_dampness === true);
        if (dampnessResolver) {
          lunch.push(dampnessResolver.food_name);
          this._incrementUsage(dampnessResolver.food_name, 'proteins');
        } else {
          const protein = proteins[0];
          lunch.push(protein.food_name);
          this._incrementUsage(protein.food_name, 'proteins');
        }
      } else {
        const protein = proteins[dayNumber % proteins.length];
        lunch.push(protein.food_name);
        this._incrementUsage(protein.food_name, 'proteins');
      }
    }

    // 3. Select Vegetables (pattern correction)
    const vegetables = (foodsByCategory.Vegetable || []).filter(f => 
      !this._isOverused(f.food_name, 'vegetables', 3)
    );
    
    if (vegetables.length > 0) {
      // For Heat pattern, prefer cooling vegetables
      if (pattern === 'Heat Pattern' || cold_heat === 'Heat') {
        const coolingVeg = vegetables.find(v => 
          v.rawFood.tcm?.thermalNature === 'Cool' || v.rawFood.tcm?.thermalNature === 'Cold'
        );
        if (coolingVeg) {
          lunch.push(coolingVeg.food_name);
          this._incrementUsage(coolingVeg.food_name, 'vegetables');
        }
      } else {
        const veg = vegetables[dayNumber % vegetables.length];
        lunch.push(veg.food_name);
        this._incrementUsage(veg.food_name, 'vegetables');
      }

      // Add second vegetable for variety
      const secondVeg = vegetables.find(v => 
        !lunch.includes(v.food_name) && !this._isOverused(v.food_name, 'vegetables', 3)
      );
      if (secondVeg) {
        lunch.push(secondVeg.food_name);
        this._incrementUsage(secondVeg.food_name, 'vegetables');
      }
    }

    // 4. Optional: Add Qi-moving food for Liver Qi Stagnation
    if (pattern === 'Liver Qi Stagnation') {
      const qiMover = [
        ...(foodsByCategory.Vegetable || []),
        ...(foodsByCategory.Spice || [])
      ].find(f => f.rawFood.tcm?.moves_qi === true && !lunch.includes(f.food_name));
      
      if (qiMover) {
        lunch.push(qiMover.food_name);
      }
    }

    return lunch;
  }

  /**
   * DINNER - Light, avoid heavy damp-forming foods, support digestion
   * @private
   */
  _selectDinner(foodsByCategory, pattern, cold_heat) {
    const dinner = [];

    // 1. Light grain or vegetable soup
    const lightOptions = [
      ...(foodsByCategory.Grain || []).filter(f => 
        this._isLightFood(f) && !this._isUsedRecently(f, 'dinner')
      ),
      ...(foodsByCategory.Vegetable || []).filter(f => 
        this._isLightFood(f) && !this._isUsedRecently(f, 'dinner')
      )
    ];

    // Avoid damp-forming foods
    const suitableLight = lightOptions.filter(f => 
      f.rawFood.tcm?.damp_forming !== true
    );

    if (suitableLight.length > 0) {
      const lightFood = suitableLight[0];
      dinner.push(lightFood.food_name);
      this._markAsUsed(lightFood, 'dinner');
    }

    // 2. Light protein (if needed for Qi support)
    if (pattern === 'Qi Deficiency') {
      const lightProteins = [
        ...(foodsByCategory.Protein || []),
        ...(foodsByCategory.Legume || [])
      ].filter(f => 
        this._isLightFood(f) && 
        !this._isUsedRecently(f, 'dinner') &&
        f.rawFood.tcm?.damp_forming !== true
      );

      if (lightProteins.length > 0) {
        const protein = lightProteins[0];
        dinner.push(protein.food_name);
        this._markAsUsed(protein, 'dinner');
      }
    }

    // 3. Vegetables (light, easily digestible)
    const dinnerVegetables = (foodsByCategory.Vegetable || []).filter(f => 
      this._isLightFood(f) && 
      !this._isUsedRecently(f, 'dinner') &&
      f.rawFood.tcm?.damp_forming !== true
    );

    if (dinnerVegetables.length > 0) {
      const veg = dinnerVegetables[0];
      dinner.push(veg.food_name);
      this._markAsUsed(veg, 'dinner');
    }

    // 4. Digestion-supporting spice
    const digestiveSpices = (foodsByCategory.Spice || []).filter(f => 
      f.rawFood.tcm?.thermalNature === 'Warm' && !dinner.includes(f.food_name)
    );

    if (digestiveSpices.length > 0) {
      dinner.push(digestiveSpices[0].food_name);
    }

    return dinner;
  }

  /**
   * Group foods by category
   * @private
   */
  _groupByCategory(foods) {
    const categories = {
      Grain: [],
      Vegetable: [],
      Fruit: [],
      Protein: [],
      Legume: [],
      Spice: [],
      Beverage: [],
      Dairy: [],
      Nut: [],
      Oil: []
    };

    foods.forEach(food => {
      const category = food.category || 'Other';
      
      // Map 'Meat' to 'Protein'
      const mappedCategory = category === 'Meat' ? 'Protein' : category;
      
      if (categories[mappedCategory]) {
        categories[mappedCategory].push(food);
      }
    });

    return categories;
  }

  /**
   * Check if food is light (for dinner)
   * @private
   */
  _isLightFood(food) {
    // Prefer foods that are not heavy/oily/sweet
    const heavyFlavors = food.rawFood.tcm?.flavor || [];
    const isHeavy = heavyFlavors.includes('Sweet') && food.rawFood.tcm?.damp_forming === true;
    
    return !isHeavy;
  }

  /**
   * Reset tracking for new plan
   * @private
   */
  _resetTracking() {
    this.usedCombinations.clear();
    this.ingredientUsage = {
      grains: {},
      proteins: {},
      vegetables: {},
      fruits: {}
    };
  }

  /**
   * Check if ingredient is overused
   * @private
   */
  _isOverused(foodName, category, maxTimes) {
    return (this.ingredientUsage[category][foodName] || 0) >= maxTimes;
  }

  /**
   * Increment usage count
   * @private
   */
  _incrementUsage(foodName, category) {
    if (!this.ingredientUsage[category][foodName]) {
      this.ingredientUsage[category][foodName] = 0;
    }
    this.ingredientUsage[category][foodName]++;
  }

  /**
   * Mark food as used recently
   * @private
   */
  _markAsUsed(food, mealType) {
    const key = `${food.food_name}_${mealType}`;
    this.usedCombinations.add(key);
  }

  /**
   * Check if food was used recently
   * @private
   */
  _isUsedRecently(food, mealType) {
    const key = `${food.food_name}_${mealType}`;
    return this.usedCombinations.has(key);
  }

  /**
   * Generate reasoning summary
   * @private
   */
  _generateReasoningSummary(userAssessment, foodsByCategory) {
    const { primary_pattern, secondary_pattern, cold_heat, severity } = userAssessment;

    let summary = `TCM 7-Day Meal Plan for ${primary_pattern} (${severity === 1 ? 'mild' : severity === 2 ? 'moderate' : 'strong'} severity).\n\n`;

    // Primary pattern corrected
    summary += `Primary Pattern Correction: Foods selected to ${this._getPatternCorrectionStrategy(primary_pattern)}.\n`;

    // Thermal balancing logic
    if (cold_heat === 'Cold') {
      summary += `Thermal Balance: Emphasizing warm and hot foods to balance cold tendency. Avoiding cold/raw foods especially in breakfast.\n`;
    } else if (cold_heat === 'Heat') {
      summary += `Thermal Balance: Emphasizing cool and cold foods to balance heat tendency. Including cooling vegetables and avoiding spicy foods.\n`;
    } else {
      summary += `Thermal Balance: Balanced approach with neutral thermal foods.\n`;
    }

    // Why dinner is lighter
    summary += `Dinner Structure: Lighter meals in the evening to support digestion and avoid accumulation. Avoiding damp-forming and heavy foods at night.\n`;

    // How Qi/Yin/Yang support was applied
    summary += `Pattern Support: `;
    if (primary_pattern === 'Qi Deficiency') {
      summary += `Qi-tonifying foods included throughout the day, especially at breakfast and lunch for energy support.`;
    } else if (primary_pattern === 'Yin Deficiency') {
      summary += `Yin-nourishing foods emphasized to restore cooling essence and fluids.`;
    } else if (primary_pattern === 'Yang Deficiency') {
      summary += `Yang-warming foods prioritized to restore warmth and metabolic fire.`;
    } else if (primary_pattern === 'Dampness') {
      summary += `Dampness-resolving foods emphasized, with strict avoidance of damp-forming sweet and heavy foods.`;
    } else if (primary_pattern === 'Heat Pattern') {
      summary += `Heat-clearing foods prioritized with cooling thermal nature to reduce internal heat.`;
    } else if (primary_pattern === 'Liver Qi Stagnation') {
      summary += `Qi-moving foods included to resolve stagnation and promote smooth flow.`;
    }

    if (secondary_pattern) {
      summary += ` Secondary support for ${secondary_pattern} also incorporated.`;
    }

    return summary;
  }

  /**
   * Get pattern correction strategy
   * @private
   */
  _getPatternCorrectionStrategy(pattern) {
    const strategies = {
      'Cold Pattern': 'warm the interior with hot and warm-natured foods',
      'Heat Pattern': 'clear heat with cooling foods',
      'Qi Deficiency': 'tonify Qi with strengthening grains and proteins',
      'Dampness': 'resolve dampness with drying and diuretic foods',
      'Dryness': 'moisten with Yin-nourishing foods',
      'Liver Qi Stagnation': 'move Qi with aromatic and pungent foods',
      'Yin Deficiency': 'nourish Yin with cooling and moistening foods',
      'Yang Deficiency': 'warm Yang with heating and energizing foods'
    };
    return strategies[pattern] || 'achieve balance';
  }
}

module.exports = new TCMMealPlanGenerator();
