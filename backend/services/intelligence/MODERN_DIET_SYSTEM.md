# Modern Clinical Nutrition System - Organized Structure

## Overview
The Modern clinical nutrition system has been reorganized to match the file structure of Ayurveda, Unani, and TCM frameworks for consistency and maintainability.

## File Structure

```
backend/services/intelligence/
├── diet/
│   ├── ayurvedaDietEngine.js
│   ├── ayurvedaDietPlanService.js
│   ├── ayurvedaMealPlan.js
│   ├── modernDietEngine.js          ← NEW
│   ├── modernDietPlanService.js     ← NEW
│   ├── modernMealPlan.js            ← NEW
│   ├── tcmDietEngine.js
│   ├── tcmDietPlanService.js
│   ├── tcmMealPlan.js
│   ├── unaniDietEngine.js
│   ├── unaniDietPlanService.js
│   └── unaniMealPlan.js
├── rules/
│   ├── ayurveda.rules.js
│   ├── modern.rules.js
│   ├── tcm.rules.js
│   ├── unani.rules.js
│   ├── ruleEngine.js
│   └── safety.rules.js
├── clinicalScorer.js               (legacy - still used)
├── foodScorer.js                   (legacy - still used)
├── clinicalNutritionPrompt.js      (legacy - still used)
└── index.js                        (updated with new exports)
```

## Architecture Pattern

All four medical frameworks (Ayurveda, Unani, TCM, Modern) now follow the same 3-file pattern:

### 1. **{framework}DietEngine.js**
**Purpose:** Food scoring logic

**Key Functions:**
- `validateFood(food)` - Check if food has required data
- `scoreFood(profile, food)` - Score a single food item
- `scoreAllFoods(profile)` - Score all foods in database

**Modern Implementation:**
- Multi-factor scoring algorithm (Goal×4, Metabolic×3, Digestive×2, Lifestyle×2, Base Quality×1)
- Integration with `modern.rules.js` for additional rule-based scoring
- Returns: `{ food, score, breakdown, modern_data, rule_reasons, rule_warnings }`

### 2. **{framework}DietPlanService.js**
**Purpose:** Orchestration and preferences

**Key Functions:**
- `_validateProfile(profile)` - Validate input profile
- `generateDietPlan(profile, preferences)` - Generate complete diet plan
- `getFoodRecommendations(profile, limit)` - Get food recommendations only
- `scoreSingleFood(profile, food)` - Score one specific food

**Modern Implementation:**
- Accepts clinical profile from `ClinicalScorer.computeProfile()`
- Applies user preferences (vegetarian, vegan, allergen exclusions)
- Generates reasoning and summary based on goals and risk factors
- Returns: `{ weeklyPlan, reasoning, topRecommendations, avoidFoods, summary }`

### 3. **{framework}MealPlan.js**
**Purpose:** 7-day meal plan generation

**Key Functions:**
- `generateWeeklyPlan(profile, categorizedFoods)` - Create 7-day meal plan
- `generateBreakfast/Lunch/Dinner/Snack()` - Meal-specific generators
- `calculateCalorieTargets()` - Determine calorie distribution
- `calculateMacroTargets()` - Determine macro distribution

**Modern Implementation:**
- Calorie distribution: Breakfast 25%, Lunch 35%, Dinner 25%, Snacks 15%
- Macro targets based on goals (e.g., weight loss: 30% protein, 35% carbs, 35% fat)
- Food rotation rules (no protein >3×/week, no identical meals)
- Incompatible food combinations (iron+calcium, protein+starch, fruit+meals)

## Usage Examples

### Basic Usage (Modern Framework)

```javascript
const { ModernDiet, ClinicalScorer } = require('../services/intelligence');

// 1. Process assessment
const assessmentResponses = { /* user responses */ };
const clinicalProfile = ClinicalScorer.computeProfile(assessmentResponses);

// 2. Generate diet plan
const preferences = {
  vegetarian: true,
  excludeAllergens: ['dairy', 'nuts']
};

const dietPlan = await ModernDiet.PlanService.generateDietPlan(
  clinicalProfile, 
  preferences
);

// 3. Access results
console.log(dietPlan.weeklyPlan);        // 7-day meal plan
console.log(dietPlan.reasoning);         // Why foods were chosen
console.log(dietPlan.topRecommendations); // Top 20 foods
console.log(dietPlan.avoidFoods);        // Foods to avoid
console.log(dietPlan.summary);           // Summary statistics
```

### Score Foods Only

```javascript
const { ModernDiet } = require('../services/intelligence');

// Get food recommendations without meal plan
const recommendations = await ModernDiet.PlanService.getFoodRecommendations(
  clinicalProfile,
  50  // limit
);

console.log(recommendations.highly_recommended);
console.log(recommendations.moderate);
console.log(recommendations.avoid);
```

### Score Single Food

```javascript
const { ModernDiet } = require('../services/intelligence');

const scoredFood = await ModernDiet.PlanService.scoreSingleFood(
  clinicalProfile,
  foodDocument  // or food ID
);

console.log(scoredFood.score);           // Numerical score
console.log(scoredFood.breakdown);       // Scoring breakdown
console.log(scoredFood.recommendation);  // "Highly Recommended", "Moderate", or "Avoid"
console.log(scoredFood.details);         // Human-readable explanations
```

### Using Engine Directly

```javascript
const { ModernDiet } = require('../services/intelligence');

// Score a single food directly
const scored = ModernDiet.Engine.scoreFood(clinicalProfile, foodDocument);

// Score all foods
const categorized = await ModernDiet.Engine.scoreAllFoods(clinicalProfile);
```

## Backward Compatibility

Legacy exports are maintained for backward compatibility:

```javascript
const { 
  IntelligenceService,  // Legacy main service
  ClinicalScorer,       // Still used for assessment processing
  FoodScorer,           // Original food scoring (now wrapped by ModernDiet.Engine)
  clinicalNutritionPrompt  // LLM prompt generation
} = require('../services/intelligence');
```

## Comparing All Four Frameworks

| Framework | Engine | Plan Service | Meal Plan |
|-----------|--------|--------------|-----------|
| **Ayurveda** | Dosha-based scoring (Vata/Pitta/Kapha) | Dosha balancing, Agni compatibility | Traditional combinations, seasonal timing |
| **Unani** | Mizaj-based scoring (Hot/Cold/Wet/Dry) | Temperament balancing | Humoral balance, food pairings |
| **TCM** | Yin-Yang, Five Elements scoring | Qi balance, organ meridians | Seasonal foods, energetic properties |
| **Modern** | Multi-factor clinical scoring | Goal-based, metabolic risk | Calorie/macro targets, nutrient density |

## Integration with Assessment Routes

The assessment routes can now use the organized structure:

```javascript
// In routes/assessments.js
const { ModernDiet, ClinicalScorer } = require('../services/intelligence');

router.post('/api/assessment/modern/complete', async (req, res) => {
  try {
    // 1. Get assessment responses
    const responses = req.body.responses;
    
    // 2. Compute clinical profile
    const clinicalProfile = ClinicalScorer.computeProfile(responses);
    
    // 3. Generate diet plan
    const dietPlan = await ModernDiet.PlanService.generateDietPlan(
      clinicalProfile,
      req.body.preferences
    );
    
    res.json({
      success: true,
      profile: clinicalProfile,
      dietPlan
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Benefits of This Structure

1. **Consistency:** All four frameworks follow the same pattern
2. **Maintainability:** Clear separation of concerns (scoring vs orchestration vs generation)
3. **Scalability:** Easy to add new frameworks or modify existing ones
4. **Testability:** Each component can be tested independently
5. **Clarity:** Developers can understand any framework by learning the pattern once

## Next Steps

1. ✅ Modern diet engine created and organized
2. ✅ Integration with existing assessment routes maintained
3. ✅ Backward compatibility preserved
4. 🔄 Consider deprecating legacy exports in future versions
5. 🔄 Add integration tests for all four frameworks
6. 🔄 Update API documentation to reflect new structure

---

**Last Updated:** 2026-02-24  
**Version:** 2.0  
**Status:** Production Ready
