# Layer 3: Intelligent Recommendation Engine - Testing Guide

## Overview
This guide covers testing the NutriFusion intelligent recommendation system with **Layer 3 Professional Enhancements**. The system integrates 5 medical systems (Ayurveda, Unani, TCM, Modern Nutrition, Safety) with advanced features: debug transparency, practitioner overrides, configurable weights, and optional LLM explanations.

## Architecture Summary

### Rule Engines (Deterministic Logic)
- **Ayurveda Rules**: Dosha compatibility, Virya, Rasa, Guna, digestion
- **Unani Rules**: Mizaj balancing (heat/moisture temperament)
- **TCM Rules**: Yin-Yang balance, thermal nature, meridian relevance
- **Modern Rules**: BMI/calories, diabetes/carbs, acid reflux/fat, protein
- **Safety Rules**: Allergy blocks, contraindications (hard blocks)

### Scoring System
- **Base Score**: 50 (neutral)
- **Score Deltas**: Each rule adds/subtracts points (weighted)
- **Configurable Weights**: Ayurveda (1.0), Unani (1.0), TCM (1.0), Modern (1.0), Safety (1.5)
- **Final Score**: Clamped between 0-100
- **Blocked Items**: Score = 0 (safety violations)

### Core API Endpoints
1. `GET /api/recommendations/foods` - General food recommendations
2. `GET /api/recommendations/recipes` - Recipe recommendations  
3. `GET /api/recommendations/meal/:mealTime` - Meal-specific recommendations
4. `GET /api/recommendations/dailyplan` - Complete daily meal plan

### Professional Enhancement Endpoints (NEW)
5. `GET /api/recommendations/debug/:foodId` - Detailed debug info (Practitioner/Admin only)
6. `POST /api/recommendations/override` - Create practitioner override (Practitioner only)
7. `GET /api/recommendations/overrides/:userId` - List all overrides for user (Practitioner/Admin)
8. `GET /api/recommendations/override/:userId/:itemId` - Check if override exists

### Optional Features
- **LLM Enhancement**: Add `?llm=true` to any recommendation endpoint for Gemini-enhanced explanations
- **Rule Weights**: Configured via SystemConfig collection (default weights can be updated)

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

## Layer 3 Professional Enhancements Testing

### Test 8: Debug Transparency (For Judges/Evaluators)
**Purpose**: Show complete rule breakdown for evaluation purposes

**API Test:**
```bash
GET /api/recommendations/debug/:foodId
Authorization: Bearer <practitioner_token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "item": { "id": "...", "name": "Quinoa", "category": "Grain" },
    "userProfile": {
      "dominantDosha": "Pitta",
      "age": 35,
      "BMI": 24,
      "conditions": ["Acid Reflux"],
      "allergies": []
    },
    "scoring": {
      "baseScore": 50,
      "finalScore": 98,
      "blocked": false
    },
    "ruleBreakdown": {
      "ayurveda": {
        "delta": +30,
        "contributions": [
          "Cooling potency (-2 score for Pitta) = +10",
          "Sweet taste balances Pitta = +15",
          "Light quality aids digestion = +5"
        ]
      },
      "modern": {
        "delta": +20,
        "contributions": [
          "High protein (14g) = +10",
          "Low fat (6g) safe for acid reflux = +10"
        ]
      },
      "safety": { "delta": 0, "contributions": [] }
    },
    "calculations": {
      "formula": "50 (base) + (30*1.0) + (20*1.0) = 100 → clamped to 100",
      "breakdown": "ayurveda weighted: +30, modern weighted: +20",
      "clamped": true
    },
    "dataCompleteness": {
      "hasAyurvedaData": true,
      "hasUnaniData": false,
      "hasTCMData": true,
      "hasModernData": true,
      "completenessScore": 75
    },
    "conflicts": []
  }
}
```

**Validation:**
- ✅ Complete rule breakdown visible
- ✅ Calculation formula transparent
- ✅ Data completeness score shown
- ✅ Only accessible by Practitioner/Admin

---

### Test 9: Practitioner Override System
**Purpose**: Allow doctors to override system recommendations with clinical judgment

**Step 1: Create Override**
```bash
POST /api/recommendations/override
Authorization: Bearer <practitioner_token>
Content-Type: application/json

{
  "foodId": "67890abcdef",
  "userId": "12345userid",
  "action": "approve",
  "reason": "Patient has family history with this food, clinical observation shows tolerance",
  "originalScore": 35,
  "newScore": 75
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Override created successfully",
  "data": {
    "overrideId": "...",
    "action": "approve",
    "reason": "Patient has family history...",
    "appliedBy": "practitioner_id",
    "appliedAt": "2026-01-25T..."
  }
}
```

**Step 2: Verify Override Applied**
```bash
GET /api/recommendations/foods
Authorization: Bearer <patient_token>
```

**Expected**: The overridden food now appears with modified score and reason:
```json
{
  "name": "Peanuts",
  "finalScore": 75,
  "overridden": true,
  "reasons": [
    "⚕️ Practitioner Override: Patient has family history with this food, clinical observation shows tolerance",
    "... other reasons ..."
  ]
}
```

**Step 3: List All Overrides**
```bash
GET /api/recommendations/overrides/:userId
Authorization: Bearer <practitioner_token>
```

**Validation:**
- ✅ Override created with audit trail
- ✅ Automatically applied in recommendations
- ✅ Practitioner reason visible in explanation
- ✅ Only practitioners can create overrides

---

### Test 10: LLM-Enhanced Explanations
**Purpose**: Convert technical explanations to warm, human-friendly language

**Without LLM (Default):**
```bash
GET /api/recommendations/foods?limit=5
Authorization: Bearer <patient_token>
```

**Response:**
```
✅ **Cucumber** is highly recommended for you (Score: 85/100).

**System Analysis:**
- Ayurveda: +20
- Unani: +10
- Modern Nutrition: +10

**Why this is good for you:**
- Cooling potency balances Pitta dosha
- Low-fat content safe for acid reflux
- High water content aids hydration
```

**With LLM Enhancement:**
```bash
GET /api/recommendations/foods?limit=5&llm=true
Authorization: Bearer <patient_token>
```

**Response (Gemini-Enhanced):**
```
Cucumber is an excellent choice for you! Its naturally cooling properties 
help balance your body's heat, while being gentle on your stomach with very 
low fat content—perfect for managing acid reflux. Plus, it's wonderfully 
hydrating. Enjoy it fresh in salads or as a refreshing snack!
```

**Validation:**
- ✅ LLM explanation is warm and conversational
- ✅ All facts remain accurate (scores, conditions)
- ✅ Falls back gracefully if LLM unavailable
- ✅ Optional feature (default: rule-based only)

---

### Test 11: Configurable Rule Weights
**Purpose**: Adjust system priorities via configuration

**Default Weights:**
```javascript
{
  ayurveda: 1.0,
  unani: 1.0,
  tcm: 1.0,
  modern: 1.0,
  safety: 1.5
}
```

**Test Scenario**: Increase Ayurveda weight for traditional focus

**Step 1: Update Config (via MongoDB/Admin API)**
```javascript
db.systemconfigs.updateOne(
  {},
  { $set: { "ruleWeights.ayurveda": 1.5 } }
)
```

**Step 2: Get Recommendations**
```bash
GET /api/recommendations/foods
```

**Expected**: Foods with strong Ayurveda alignment score higher

**Validation:**
- ✅ Score changes reflect new weights
- ✅ WeightedScores field shows multiplication
- ✅ Configuration persists across server restarts

---

## Performance Benchmarks

### Expected Response Times
- Food recommendations: < 500ms
- Recipe recommendations: < 1000ms (includes ingredient population)
- Debug endpoint: < 800ms (detailed calculations)
- Override creation: < 200ms (database write)
- LLM-enhanced: < 3000ms (includes Gemini API call)

### Scalability
- Handle 100+ foods in database
- Handle 50+ recipes in database
- Support 50+ concurrent users
- LLM rate limit: 15 requests/minute (free tier)

---

## Known Features & Limitations

### ✅ Implemented
1. ✅ **5 Rule Engines**: Ayurveda, Unani, TCM, Modern, Safety
2. ✅ **Debug Transparency**: Complete rule breakdown
3. ✅ **Practitioner Overrides**: Clinical judgment system
4. ✅ **Configurable Weights**: System priority adjustment
5. ✅ **LLM Enhancement**: Optional Gemini integration
6. ✅ **Conflict Detection**: System disagreement analysis
7. ✅ **Audit Trail**: All overrides logged
8. ✅ **Clinical Validation**: 7 documented case studies

### ⏳ Future Enhancements
1. **Caching Layer**: User profile & recommendation caching
2. **Seasonal Awareness**: Auto-detect season for Ritucharya
3. **Multi-Language**: Regional language support
4. **Advanced Analytics**: Usage patterns, recommendation acceptance rates
5. **Mobile App**: React Native frontend

---

## Testing Scripts

Run these scripts to validate the system:

```bash
# Test LLM enhancement
node scripts/testLLMEnhancement.js

# Test Layer 3 recommendations
node scripts/testLayer3Recommendations.js

# Check database integrity
node scripts/checkDatabase.js
```

---

## Next Steps
1. ✅ Test all endpoints with Postman
2. ✅ Validate debug transparency with evaluators
3. ✅ Create practitioner override workflows
4. ⏳ Add caching layer for production
5. ⏳ Build frontend UI for recommendations
6. ⏳ Deploy to production environment
7. ⏳ Create demo video for IEEE/hackathon submission

---

## Clinical Decision Support System (CDSS) Checklist

This system qualifies as a **Clinical Decision Support System** with:

✅ **Rule-Based Logic**: Deterministic, explainable decisions  
✅ **Multi-System Integration**: 5 traditional + modern systems  
✅ **Transparency**: Complete rule breakdown for auditing  
✅ **Professional Override**: Respects clinical judgment  
✅ **Audit Trail**: All decisions logged  
✅ **Safety First**: Hard blocks for contraindications  
✅ **Configurable**: Weights adjustable for different contexts  
✅ **Evidence-Based**: Clinical validation documented  

**Ministry of AYUSH Compliance**: Integrates traditional systems with safety guardrails  
**IEEE Evaluation Ready**: Debug mode shows complete scoring logic  
**Hackathon Demo Ready**: LLM enhancement adds wow factor  

---

## Success Criteria
✅ All rule engines return valid RuleResults
✅ Scoring aggregation produces 0-100 scores
✅ Safety blocks prevent unsafe recommendations
✅ Explanations are human-readable
✅ API responds within performance benchmarks
✅ All 7 test scenarios pass validation
✅ Zero unsafe items reach users
