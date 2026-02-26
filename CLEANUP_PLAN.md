# File Structure Cleanup Plan

## Current Duplication Issues

### 1. Assessment Scoring Duplication
**Problem:** Modern has TWO files doing the same thing
- ❌ `services/intelligence/clinicalScorer.js` (355 lines)
- ✅ `services/assessment/modern.js` (445 lines)

**Both compute:** BMI, BMR, TDEE, metabolic risk scoring

**Decision:** Keep `assessment/modern.js` (matches Ayurveda/Unani/TCM pattern)

---

### 2. Food Scoring Duplication
**Problem:** Modern has TWO files doing the same thing
- ❌ `services/intelligence/foodScorer.js` (377 lines)
- ✅ `services/intelligence/diet/modernDietEngine.js` (470 lines)

**Both compute:** Goal-based scoring, metabolic risk adjustment, food ranking

**Decision:** Keep `diet/modernDietEngine.js` (matches Ayurveda/Unani/TCM pattern)

---

### 3. Unnecessary Files
- ❌ `services/intelligence/example.js` - Demo code only
- ❌ `services/intelligence/clinicalNutritionPrompt.js` - LLM prompt (optional, not used by core)

---

## Correct File Structure (All Frameworks)

### ✅ Ayurveda (Clean Pattern)
```
services/
├── assessment/
│   └── ayurveda.js              # Assessment: Prakriti, Vikriti, Agni
└── intelligence/
    └── diet/
        ├── ayurvedaDietEngine.js        # Food scoring
        ├── ayurvedaDietPlanService.js   # Orchestration
        └── ayurvedaMealPlan.js          # 7-day meal plan
```

### ✅ Unani (Clean Pattern)
```
services/
├── assessment/
│   └── unani.js                 # Assessment: Mizaj
└── intelligence/
    └── diet/
        ├── unaniDietEngine.js
        ├── unaniDietPlanService.js
        └── unaniMealPlan.js
```

### ✅ TCM (Clean Pattern)
```
services/
├── assessment/
│   └── tcm.js                   # Assessment: Yin/Yang, Elements
└── intelligence/
    └── diet/
        ├── tcmDietEngine.js
        ├── tcmDietPlanService.js
        └── tcmMealPlan.js
```

### ❌ Modern (DUPLICATED - Needs Cleanup)
```
services/
├── assessment/
│   └── modern.js                ✅ KEEP # Assessment: BMI, BMR, TDEE
└── intelligence/
    ├── clinicalScorer.js        ❌ DELETE (duplicate of assessment/modern.js)
    ├── foodScorer.js            ❌ DELETE (duplicate of diet/modernDietEngine.js)
    ├── clinicalNutritionPrompt.js  ❌ DELETE (optional LLM feature)
    ├── example.js               ❌ DELETE (demo only)
    └── diet/
        ├── modernDietEngine.js          ✅ KEEP
        ├── modernDietPlanService.js     ✅ KEEP
        └── modernMealPlan.js            ✅ KEEP
```

---

## Action Plan

### Step 1: Update `assessment/modern.js`
Check if `clinicalScorer.js` has MORE ADVANCED logic than `assessment/modern.js`

**IF YES:** Copy the better logic to `assessment/modern.js`
**IF NO:** Keep `assessment/modern.js` as-is

### Step 2: Update `diet/modernDietEngine.js`
Check if `foodScorer.js` has different logic than `modernDietEngine.js`

**IF YES:** Merge any missing logic into `modernDietEngine.js`
**IF NO:** Keep `modernDietEngine.js` as-is

### Step 3: Delete Duplicate Files
```bash
rm services/intelligence/clinicalScorer.js
rm services/intelligence/foodScorer.js
rm services/intelligence/clinicalNutritionPrompt.js
rm services/intelligence/example.js
rm services/intelligence/INTELLIGENCE_README.md  # Outdated documentation
```

### Step 4: Update `intelligence/index.js`
Remove references to deleted files:
```javascript
// BEFORE (incorrect)
const ClinicalScorer = require('./clinicalScorer');
const FoodScorer = require('./foodScorer');

// AFTER (correct)
const ModernEngine = require('../assessment/modern');
const ModernDietEngine = require('./diet/modernDietEngine');
```

### Step 5: Update Routes
Update any routes that import the old files:
- Look for: `require('./services/intelligence/clinicalScorer')`
- Replace with: `require('./services/assessment/modern')`

---

## Final Clean Structure

```
backend/services/
├── assessment/
│   ├── ayurveda.js          # Prakriti, Vikriti, Agni calculation
│   ├── unani.js             # Mizaj calculation
│   ├── tcm.js               # Yin/Yang, Element calculation
│   ├── modern.js            # BMI, BMR, TDEE, metabolic risk
│   └── index.js             # Factory pattern
│
└── intelligence/
    ├── diet/
    │   ├── ayurvedaDietEngine.js
    │   ├── ayurvedaDietPlanService.js
    │   ├── ayurvedaMealPlan.js
    │   ├── unaniDietEngine.js
    │   ├── unaniDietPlanService.js
    │   ├── unaniMealPlan.js
    │   ├── tcmDietEngine.js
    │   ├── tcmDietPlanService.js
    │   ├── tcmMealPlan.js
    │   ├── modernDietEngine.js
    │   ├── modernDietPlanService.js
    │   └── modernMealPlan.js
    │
    ├── rules/
    │   ├── ayurveda.rules.js
    │   ├── unani.rules.js
    │   ├── tcm.rules.js
    │   ├── modern.rules.js
    │   ├── ruleEngine.js
    │   └── safety.rules.js
    │
    └── index.js             # Export all diet services
```

---

## Benefits After Cleanup

1. ✅ **Consistency:** All 4 frameworks follow identical pattern
2. ✅ **No Duplication:** Each functionality exists in ONE place only
3. ✅ **Maintainability:** Clear separation between assessment and diet
4. ✅ **Scalability:** Easy to add new frameworks
5. ✅ **Developer Experience:** No confusion about which file to use

---

## Migration Notes

### For Existing Code Using Old Files:

**Old Import (deprecated):**
```javascript
const { ClinicalScorer } = require('./services/intelligence');
const profile = ClinicalScorer.computeProfile(responses);
```

**New Import (correct):**
```javascript
const ModernEngine = require('./services/assessment/modern');
const modernEngine = new ModernEngine();
const profile = modernEngine.score(responses);
```

**Old Import (deprecated):**
```javascript
const { FoodScorer } = require('./services/intelligence');
const ranked = FoodScorer.rankFoods(foods, profile);
```

**New Import (correct):**
```javascript
const { ModernDiet } = require('./services/intelligence');
const categorized = await ModernDiet.Engine.scoreAllFoods(profile);
```
