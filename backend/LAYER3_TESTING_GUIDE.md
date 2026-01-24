# Layer 3: Intelligent Recommendation Engine - Testing Guide

## Overview
This guide covers testing the NutriFusion intelligent recommendation system, which integrates 5 medical systems (Ayurveda, Unani, Siddha, TCM, Modern Nutrition) to provide personalized food and recipe recommendations.

## Architecture Summary

### Rule Engines (Deterministic Logic)
- **Ayurveda Rules**: Dosha compatibility, Virya, Rasa, Guna, digestion
- **Unani Rules**: Mizaj balancing (heat/moisture temperament)
- **Siddha Rules**: (Future implementation - digestibility focus)
- **TCM Rules**: Yin-Yang balance, thermal nature, meridian relevance
- **Modern Rules**: BMI/calories, diabetes/carbs, acid reflux/fat, protein
- **Safety Rules**: Allergy blocks, contraindications (hard blocks)

### Scoring System
- **Base Score**: 50 (neutral)
- **Score Deltas**: Each rule adds/subtracts points
- **Final Score**: Clamped between 0-100
- **Blocked Items**: Score = 0 (safety violations)

### API Endpoints
1. `GET /api/recommendations/foods` - General food recommendations
2. `GET /api/recommendations/recipes` - Recipe recommendations
3. `GET /api/recommendations/meal/:mealTime` - Meal-specific recommendations
4. `GET /api/recommendations/dailyplan` - Complete daily meal plan

---

## Test Scenarios

### Test 1: Pitta-Dominant User with Acid Reflux
**User Profile:**
- Prakriti: { vata: 25, pitta: 50, kapha: 25 }
- Medical Conditions: ['Acid Reflux']
- Age: 35, BMI: 24

**Expected Behavior:**
- ✅ Cooling foods (Cold virya) score higher
- ✅ Low-fat foods score higher
- ❌ Hot/spicy foods score lower or blocked
- ❌ High-fat foods (>15g) score lower
- ❌ Fried foods hard-blocked by safety engine

**API Test:**
```bash
GET /api/recommendations/foods?limit=10&minScore=40
Authorization: Bearer <patient_token>
```

**Expected Top Results:**
- Cucumber (cooling, low-fat)
- Rice (cooling, easy to digest)
- Coconut (cooling, soothing)

**Validation:**
- All results have finalScore >= 40
- No fried foods in results
- Warnings mention acid reflux for marginal items
- System scores show negative Ayurveda/Modern deltas for hot foods

---

### Test 2: Kapha-Dominant User with Obesity
**User Profile:**
- Prakriti: { vata: 20, pitta: 25, kapha: 55 }
- Medical Conditions: []
- Age: 40, BMI: 29 (overweight)

**Expected Behavior:**
- ✅ Light, warm foods (Hot virya) score higher
- ✅ Low-calorie foods (<100 cal) score higher
- ✅ Pungent/bitter tastes preferred
- ❌ Heavy, oily foods score lower
- ❌ High-calorie foods (>200 cal) score lower

**API Test:**
```bash
GET /api/recommendations/recipes?limit=10&minScore=40
Authorization: Bearer <patient_token>
```

**Expected Top Results:**
- Spiced lentil soup (light, warming)
- Steamed vegetables with ginger
- Green tea (pungent, warming)

**Validation:**
- Low-calorie recipes prioritized
- Warming/hot foods scored higher
- Heavy dairy/fried items score lower

---

### Test 3: Vata-Dominant User with Weak Digestion
**User Profile:**
- Prakriti: { vata: 55, pitta: 25, kapha: 20 }
- Digestion Issues: 'Weak'
- Age: 60, BMI: 19 (underweight)

**Expected Behavior:**
- ✅ Warm, cooked foods score higher
- ✅ Easy-to-digest foods (Light guna) score higher
- ✅ Calorie-dense foods for weight gain
- ❌ Cold, raw foods score lower
- ❌ Heavy foods (Heavy guna) score lower

**API Test:**
```bash
GET /api/recommendations/foods?category=Vegetable&limit=10
Authorization: Bearer <patient_token>
```

**Expected Top Results:**
- Cooked carrots (warm, easy digest)
- Steamed sweet potato (calorie-dense, warm)
- Pumpkin soup (light, nourishing)

**Validation:**
- No raw vegetables in top results
- Warming foods prioritized
- High-calorie items encouraged (BMI < 18.5)

---

### Test 4: Diabetic User
**User Profile:**
- Medical Conditions: ['Diabetes']
- Age: 50, BMI: 27

**Expected Behavior:**
- ✅ Low-carb foods (<10g net carbs) score very high
- ✅ High-fiber foods score higher
- ❌ High-carb foods (>30g) score very low
- ❌ Sugary categories (desserts) hard-blocked

**API Test:**
```bash
GET /api/recommendations/foods?limit=10&minScore=40
Authorization: Bearer <patient_token>
```

**Expected Results:**
- Green vegetables (low-carb)
- Nuts (high fiber, low net carbs)
- Protein-rich foods (eggs, chicken)

**Validation:**
- All net carbs < 20g
- No desserts/sweets in results
- Warnings for borderline carb items (20-30g)
- Safety blocks for high-sugar foods

---

### Test 5: User with Multiple Allergies
**User Profile:**
- Allergies: ['Nuts', 'Dairy', 'Gluten']
- Dietary Preferences: ['Vegetarian']

**Expected Behavior:**
- ❌ All nut-based foods hard-blocked
- ❌ All dairy products hard-blocked
- ❌ Wheat/grain foods hard-blocked
- ❌ Meat/fish blocked (vegetarian)
- ✅ Only safe alternatives shown

**API Test:**
```bash
GET /api/recommendations/recipes?limit=10
Authorization: Bearer <patient_token>
```

**Expected Results:**
- Rice-based recipes
- Vegetable dishes
- Legume-based meals (non-peanut)

**Validation:**
- Zero results with allergens
- All results vegetarian
- Safety warnings clearly displayed
- Blocked items score = 0

---

### Test 6: Meal-Specific Recommendations
**User Profile:** Balanced dosha, no medical conditions

**Breakfast Test:**
```bash
GET /api/recommendations/meal/Breakfast?limit=5
Authorization: Bearer <patient_token>
```

**Expected Results:**
- Light, easy-to-digest foods
- Grain-based items (oatmeal, rice)
- Fruits

**Lunch Test:**
```bash
GET /api/recommendations/meal/Lunch?limit=5
Authorization: Bearer <patient_token>
```

**Expected Results:**
- Balanced meals with protein
- Vegetables, legumes
- Higher calorie content

**Snack Test:**
```bash
GET /api/recommendations/meal/Snack?limit=5
Authorization: Bearer <patient_token>
```

**Expected Results:**
- Fruits, nuts (if no allergy)
- Light beverages
- Low-calorie options

---

### Test 7: Daily Meal Plan
**User Profile:** Any valid patient

**API Test:**
```bash
GET /api/recommendations/dailyplan
Authorization: Bearer <patient_token>
```

**Expected Response Structure:**
```json
{
  "success": true,
  "data": {
    "dailyPlan": {
      "breakfast": [ /* 3 recipes */ ],
      "lunch": [ /* 3 recipes */ ],
      "dinner": [ /* 3 recipes */ ],
      "snacks": [ /* 5 options */ ]
    },
    "totalNutrition": {
      "calories": 1800,
      "protein": 80,
      "carbs": 200,
      "fat": 60
    },
    "summary": {
      "userProfile": {
        "dominantDosha": "Pitta",
        "medicalConditions": [],
        "dietaryPreferences": []
      }
    }
  }
}
```

**Validation:**
- All meals have 3+ options
- Total calories reasonable (1500-2500)
- Each meal has explanations
- Nutritional summary accurate

---

## Testing Checklist

### Functional Tests
- [ ] Ayurveda rules apply correctly (dosha matching)
- [ ] Unani rules apply correctly (mizaj balancing)
- [ ] TCM rules apply correctly (thermal nature)
- [ ] Modern nutrition rules apply correctly (BMI, diabetes)
- [ ] Safety rules block unsafe items
- [ ] Scoring aggregation works (base 50, deltas, clamping)
- [ ] Recommendations ranked by score
- [ ] Blocked items excluded from results

### Edge Cases
- [ ] User with no health profile (defaults used)
- [ ] Empty food database returns empty array
- [ ] Invalid meal time returns 400 error
- [ ] User with extreme BMI (<15 or >40)
- [ ] User with 5+ medical conditions
- [ ] User with 10+ allergies

### Integration Tests
- [ ] Authentication required (401 without token)
- [ ] Foods endpoint returns valid results
- [ ] Recipes endpoint returns valid results
- [ ] Meal endpoint works for all meal times
- [ ] Daily plan endpoint generates complete plan
- [ ] Explanations generated for all results

### Data Validation
- [ ] All scores between 0-100
- [ ] Blocked items have score = 0
- [ ] Reasons array not empty for top results
- [ ] Warnings array populated for marginal items
- [ ] System scores breakdown present
- [ ] Nutrition summary accurate

---

## Sample Test Data Setup

### Create Test User (Pitta + Acid Reflux)
```json
POST /api/auth/register
{
  "email": "pitta.test@example.com",
  "password": "Test@1234",
  "fullName": "Pitta Test User",
  "age": 35,
  "gender": "Female",
  "BMI": 24,
  "prakriti": { "vata": 25, "pitta": 50, "kapha": 25 }
}
```

### Create Health Profile
```json
POST /api/health-profiles
{
  "medicalConditions": ["Acid Reflux"],
  "allergies": [],
  "dietaryPreferences": [],
  "digestiveIssues": "Normal",
  "lifestyle": {
    "activity": "Moderate",
    "sleep": "7-8 hours",
    "stress": "Moderate"
  }
}
```

---

## Performance Benchmarks

### Expected Response Times
- Food recommendations: < 500ms
- Recipe recommendations: < 1000ms (includes ingredient population)
- Meal-specific: < 800ms
- Daily plan: < 2000ms (4 meal queries)

### Scalability
- Handle 100+ foods in database
- Handle 50+ recipes in database
- Support 50+ concurrent users
- Cache user profiles for repeat queries

---

## Known Limitations
1. **Siddha Rules**: Not fully implemented (placeholder logic)
2. **LLM Integration**: Optional, not implemented by default
3. **Seasonal Context**: No automatic season detection (future enhancement)
4. **Recipe Multi-System Data**: Recipes use aggregated nutrition, may need individual ingredient analysis

---

## Next Steps
1. Test all 7 scenarios with Postman
2. Create automated test suite (Jest/Mocha)
3. Add performance monitoring
4. Implement seasonal awareness
5. Add LLM explanation enhancement (optional)
6. Create practitioner override system
7. Build frontend UI for recommendations

---

## Success Criteria
✅ All rule engines return valid RuleResults
✅ Scoring aggregation produces 0-100 scores
✅ Safety blocks prevent unsafe recommendations
✅ Explanations are human-readable
✅ API responds within performance benchmarks
✅ All 7 test scenarios pass validation
✅ Zero unsafe items reach users
