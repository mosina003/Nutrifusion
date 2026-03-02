/**
 * Unani 7-Day Meal Plan Generator
 * Creates balanced weekly meal plans based on Unani principles
 */

/**
 * Simple seeded pseudo-random number generator (LCG algorithm)
 */
class SeededRandom {
  constructor(seed) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

/**
 * Fisher-Yates shuffle algorithm with seeded randomization
 */
const shuffleArray = (array, seed = 0) => {
  const arr = [...array];
  const rng = new SeededRandom(seed);
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

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

    // Generate a random offset based on timestamp for true variety on regeneration
    const randomOffset = Date.now() % 1000000 + Math.floor(Math.random() * 100000);
    console.log('🔀 Unani random offset for plan variety:', randomOffset);

    const suitableFoods = [
      ...rankedFoods.highly_suitable,
      ...rankedFoods.moderately_suitable
    ];

    console.log('🔍 Suitable foods count:', suitableFoods.length);
    if (suitableFoods.length > 0) {
      console.log('🔍 Sample food structure:', JSON.stringify(suitableFoods[0], null, 2));
    }

    // Group foods by category for easier meal composition
    const foodsByCategory = this._groupByCategory(suitableFoods);

    console.log('🔍 Foods by category:', Object.keys(foodsByCategory).map(k => `${k}: ${foodsByCategory[k].length}`).join(', '));

    const weekPlan = {};
    
    for (let day = 1; day <= 7; day++) {
      const dayMeals = this._generateDayMeals(
        foodsByCategory,
        userAssessment,
        day,
        randomOffset  // Pass random offset to day meals
      );
      console.log(`🔍 Day ${day} meals:`, {
        breakfast: dayMeals.breakfast?.length || 0,
        lunch: dayMeals.lunch?.length || 0,
        dinner: dayMeals.dinner?.length || 0
      });
      weekPlan[`day_${day}`] = dayMeals;
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
  _generateDayMeals(foodsByCategory, userAssessment, dayNumber, randomOffset = 0) {
    const { primary_mizaj, digestive_strength } = userAssessment;

    return {
      breakfast: this._selectBreakfast(foodsByCategory, primary_mizaj, digestive_strength, randomOffset),
      lunch: this._selectLunch(foodsByCategory, primary_mizaj, dayNumber, randomOffset),
      dinner: this._selectDinner(foodsByCategory, primary_mizaj, digestive_strength, randomOffset)
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
      ...(foodsByCategory.grain || []).filter(f => this._isLightDigestible(f)),
      ...(foodsByCategory.fruit || []).filter(f => this._isLightDigestible(f)),
      ...(foodsByCategory.dairy || []).filter(f => this._isLightDigestible(f))
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
    const beverages = (foodsByCategory.beverage || []).filter(f => this._isLightDigestible(f));
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
  _selectLunch(foodsByCategory, mizaj, dayNumber, randomOffset = 0) {
    const lunch = [];

    // 1. Select Grain (max 2 times/week per grain) with shuffling
    const grains = (foodsByCategory.grain || []).filter(f => 
      !this._isOverused(f.food_name, 'grains', 2)
    );
    if (grains.length > 0) {
      const shuffledGrains = shuffleArray(grains, randomOffset + dayNumber);
      const grain = shuffledGrains[0];
      lunch.push(grain.food_name);
      this._incrementUsage(grain.food_name, 'grains');
    }

    // 2. Select Protein/Legume (max 2 times/week) with shuffling
    const proteins = [
      ...(foodsByCategory.legume || []),
      ...(foodsByCategory.meat || [])
    ].filter(f => !this._isOverused(f.food_name, 'legumes', 2));
    
    if (proteins.length > 0) {
      const shuffledProteins = shuffleArray(proteins, randomOffset + dayNumber * 2);
      const protein = shuffledProteins[0];
      lunch.push(protein.food_name);
      this._incrementUsage(protein.food_name, 'legumes');
    }

    // 3. Select Vegetables (rotate) with shuffling
    const vegetables = (foodsByCategory.vegetable || []).filter(f => 
      !this._isUsedRecently(f, 'lunch')
    );
    
    if (vegetables.length > 0) {
      const shuffledVegetables = shuffleArray(vegetables, randomOffset + dayNumber * 3);
      const veg = shuffledVegetables[0];
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
    const spices = (foodsByCategory.spice || []).slice(0, 2);
    spices.forEach(s => lunch.push(s.food_name));

    return lunch;
  }

  /**
   * DINNER - Light, digestibility ≤3
   * Avoid heavy moist (Balgham), avoid very dry (Sauda)
   * @private
   */
  _selectDinner(foodsByCategory, mizaj, digestive_strength, randomOffset = 0) {
    const dinner = [];

    // Select light options based on Mizaj
    let lightOptions = [
      ...(foodsByCategory.vegetable || []),
      ...(foodsByCategory.grain || [])
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

    // Select 1-2 light items (with shuffling)
    const availableDinnerItems = lightOptions.filter(f => !this._isUsedRecently(f, 'dinner'));
    const shuffledDinner = shuffleArray(availableDinnerItems, randomOffset + 100);
    const dinnerItems = shuffledDinner.slice(0, 2);
    
    dinnerItems.forEach(item => {
      dinner.push(item.food_name);
      this._markAsUsed(item, 'dinner');
    });

    // Add soup or light beverage (with shuffling)
    const beverages = (foodsByCategory.Beverage || []).filter(f => this._isLightDigestible(f));
    if (beverages.length > 0 && dinner.length < 3) {
      const shuffledBeverages = shuffleArray(beverages, randomOffset + 200);
      const bev = shuffledBeverages[0];
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
