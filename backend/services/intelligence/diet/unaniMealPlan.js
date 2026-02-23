/**
 * Unani 7-Day Meal Plan Generator
 * Creates balanced weekly meal plans based on Unani principles
 */

class UnaniMealPlanGenerator {
  constructor() {
    this.usedCombinations = new Set();
    this.ingredientUsage = {
      grains: {},
      legumes: {},
      vegetables: {},
      proteins: {}
    };
  }

  /**
   * Generate 7-day meal plan from ranked foods
   * @param {Object} rankedFoods - Output from UnaniDietEngine.rankFoods()
   * @param {Object} userAssessment - User's Unani assessment
   * @returns {Object} - 7-day meal plan with reasoning
   */
  generateWeeklyPlan(rankedFoods, userAssessment) {
    this._resetTracking();

    const suitableFoods = [
      ...rankedFoods.highly_suitable,
      ...rankedFoods.moderately_suitable
    ];

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
      top_ranked_foods: rankedFoods.highly_suitable.slice(0, 10).map(f => ({
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
    const { primary_mizaj, digestive_strength } = userAssessment;

    return {
      breakfast: this._selectBreakfast(foodsByCategory, primary_mizaj, digestive_strength),
      lunch: this._selectLunch(foodsByCategory, primary_mizaj, dayNumber),
      dinner: this._selectDinner(foodsByCategory, primary_mizaj, digestive_strength)
    };
  }

  /**
   * BREAKFAST - Light, digestibility ≤3, no high flatulence
   * @private
   */
  _selectBreakfast(foodsByCategory, mizaj, digestive_strength) {
    const breakfast = [];
    
    // Select light grain or fruit
    const lightOptions = [
      ...(foodsByCategory.Grain || []).filter(f => this._isLightDigestible(f)),
      ...(foodsByCategory.Fruit || []).filter(f => this._isLightDigestible(f)),
      ...(foodsByCategory.Dairy || []).filter(f => this._isLightDigestible(f))
    ];

    // For Balgham (Cold+Moist), avoid very cold/moist breakfast
    if (mizaj === 'balgham') {
      const warmOption = lightOptions.find(f => 
        f.rawFood.unani?.temperament?.hot_level >= 2 && !this._isUsedRecently(f, 'breakfast')
      );
      if (warmOption) {
        breakfast.push(warmOption.food_name);
        this._markAsUsed(warmOption, 'breakfast');
      }
    } else {
      const option = lightOptions.find(f => !this._isUsedRecently(f, 'breakfast'));
      if (option) {
        breakfast.push(option.food_name);
        this._markAsUsed(option, 'breakfast');
      }
    }

    // Add optional beverage
    const beverages = (foodsByCategory.Beverage || []).filter(f => this._isLightDigestible(f));
    if (beverages.length > 0) {
      const beverage = beverages.find(b => !this._isUsedRecently(b, 'breakfast')) || beverages[0];
      breakfast.push(beverage.food_name);
      this._markAsUsed(beverage, 'breakfast');
    }

    return breakfast;
  }

  /**
   * LUNCH - Main meal: 1 grain + 1 protein/legume + 1 vegetable
   * @private
   */
  _selectLunch(foodsByCategory, mizaj, dayNumber) {
    const lunch = [];

    // 1. Select Grain (max 2 times/week per grain)
    const grains = (foodsByCategory.Grain || []).filter(f => 
      !this._isOverused(f.food_name, 'grains', 2)
    );
    if (grains.length > 0) {
      const grain = grains[dayNumber % grains.length];
      lunch.push(grain.food_name);
      this._incrementUsage(grain.food_name, 'grains');
    }

    // 2. Select Protein/Legume (max 2 times/week)
    const proteins = [
      ...(foodsByCategory.Legume || []),
      ...(foodsByCategory.Meat || [])
    ].filter(f => !this._isOverused(f.food_name, 'legumes', 2));
    
    if (proteins.length > 0) {
      const protein = proteins[dayNumber % proteins.length];
      lunch.push(protein.food_name);
      this._incrementUsage(protein.food_name, 'legumes');
    }

    // 3. Select Vegetables (rotate)
    const vegetables = (foodsByCategory.Vegetable || []).filter(f => 
      !this._isUsedRecently(f, 'lunch')
    );
    
    if (vegetables.length > 0) {
      const veg = vegetables[0];
      lunch.push(veg.food_name);
      this._markAsUsed(veg, 'lunch');
      
      // Add second vegetable for variety
      if (vegetables.length > 1) {
        const veg2 = vegetables[1];
        lunch.push(veg2.food_name);
        this._markAsUsed(veg2, 'lunch');
      }
    }

    // 4. Add balancing spice/condiment
    const spices = (foodsByCategory.Spice || []).slice(0, 2);
    spices.forEach(s => lunch.push(s.food_name));

    return lunch;
  }

  /**
   * DINNER - Light, digestibility ≤3
   * Avoid heavy moist (Balgham), avoid very dry (Sauda)
   * @private
   */
  _selectDinner(foodsByCategory, mizaj, digestive_strength) {
    const dinner = [];

    // Select light options based on Mizaj
    let lightOptions = [
      ...(foodsByCategory.Vegetable || []),
      ...(foodsByCategory.Grain || [])
    ].filter(f => this._isLightDigestible(f));

    // Filter based on Mizaj
    if (mizaj === 'balgham') {
      // Avoid heavy moist foods at dinner
      lightOptions = lightOptions.filter(f => {
        const moist_level = f.rawFood.unani?.temperament?.moist_level || 0;
        const digestibility = f.rawFood.unani?.digestibility_level || 3;
        return !(moist_level >= 3 && digestibility >= 4);
      });
    } else if (mizaj === 'sauda') {
      // Avoid very dry foods at dinner
      lightOptions = lightOptions.filter(f => {
        const dry_level = f.rawFood.unani?.temperament?.dry_level || 0;
        return dry_level < 3;
      });
    }

    // Select 1-2 light items
    const dinnerItems = lightOptions
      .filter(f => !this._isUsedRecently(f, 'dinner'))
      .slice(0, 2);
    
    dinnerItems.forEach(item => {
      dinner.push(item.food_name);
      this._markAsUsed(item, 'dinner');
    });

    // Add soup or light beverage
    const beverages = (foodsByCategory.Beverage || []).filter(f => this._isLightDigestible(f));
    if (beverages.length > 0 && dinner.length < 3) {
      const bev = beverages[0];
      dinner.push(bev.food_name);
    }

    return dinner;
  }

  /**
   * Helper: Check if food is light and digestible
   * @private
   */
  _isLightDigestible(food) {
    const digestibility = food.rawFood.unani?.digestibility_level || 3;
    const flatulence = food.rawFood.unani?.flatulence_potential || 'low';
    
    return digestibility <= 3 && flatulence !== 'high';
  }

  /**
   * Helper: Check if food was used recently
   * @private
   */
  _isUsedRecently(food, mealType) {
    const key = `${food.food_name}_${mealType}`;
    return this.usedCombinations.has(key);
  }

  /**
   * Helper: Mark food as used
   * @private
   */
  _markAsUsed(food, mealType) {
    const key = `${food.food_name}_${mealType}`;
    this.usedCombinations.add(key);
  }

  /**
   * Helper: Check if ingredient is overused
   * @private
   */
  _isOverused(foodName, category, maxTimes) {
    return (this.ingredientUsage[category][foodName] || 0) >= maxTimes;
  }

  /**
   * Helper: Increment ingredient usage
   * @private
   */
  _incrementUsage(foodName, category) {
    if (!this.ingredientUsage[category][foodName]) {
      this.ingredientUsage[category][foodName] = 0;
    }
    this.ingredientUsage[category][foodName]++;
  }

  /**
   * Group foods by category
   * @private
   */
  _groupByCategory(foods) {
    const grouped = {};
    
    foods.forEach(food => {
      const category = food.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(food);
    });

    return grouped;
  }

  /**
   * Reset tracking for new plan generation
   * @private
   */
  _resetTracking() {
    this.usedCombinations = new Set();
    this.ingredientUsage = {
      grains: {},
      legumes: {},
      vegetables: {},
      proteins: {}
    };
  }

  /**
   * Generate reasoning summary
   * @private
   */
  _generateReasoningSummary(userAssessment, foodsByCategory) {
    const { primary_mizaj, dominant_humor, severity, digestive_strength } = userAssessment;

    const humorNames = {
      dam: 'Dam (Hot + Moist)',
      safra: 'Safra (Hot + Dry)',
      balgham: 'Balgham (Cold + Moist)',
      sauda: 'Sauda (Cold + Dry)'
    };

    const balancingApproach = {
      dam: 'cooling and drying foods to balance excess heat and moisture',
      safra: 'cooling and moistening foods to balance excess heat and dryness',
      balgham: 'warming and drying foods to balance excess cold and moisture',
      sauda: 'warming and moistening foods to balance excess cold and dryness'
    };

    const digestiveNote = {
      weak: 'Light, easily digestible foods are prioritized. Heavy and gas-producing foods are avoided.',
      slow: 'Moderately light foods are selected. Very heavy foods are minimized.',
      strong: 'Regular digestibility foods are suitable. No major restrictions on food heaviness.',
      strong_but_hot: 'Regular digestibility with preference for cooling foods to manage heat.',
      moderate: 'Balanced approach to food digestibility.'
    };

    return `Dominant humor corrected: ${humorNames[dominant_humor]} at severity level ${severity}. Foods that reduce this humor are heavily favored. ` +
      `Temperament balancing: Selected ${balancingApproach[primary_mizaj]} based on ${primary_mizaj.toUpperCase()} constitution. ` +
      `Digestive influence: ${digestiveNote[digestive_strength]} ` +
      `Meal timing: Dinner is kept lighter than lunch to avoid overloading digestion in evening. Breakfast is light and warming to gently activate digestive fire.`;
  }
}

module.exports = new UnaniMealPlanGenerator();
