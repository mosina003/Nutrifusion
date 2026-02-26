# Comparison: `assessment/` vs `rules/` Folders

## Executive Summary

**NO MAJOR DUPLICATION** - These folders serve completely different purposes:

| Aspect | `assessment/` Folder | `rules/` Folder |
|--------|---------------------|----------------|
| **Purpose** | Calculate user health profile from questionnaire | Evaluate food items against user profile |
| **Input** | User questionnaire responses | User profile + Food item |
| **Output** | Health profile scores | Food compatibility score |
| **When Used** | Once during user onboarding | Every time food recommendations are generated |
| **Data Flow** | Questions → Profile | Profile + Food → Score |

---

## File-by-File Comparison

### 1. Ayurveda Files

#### `assessment/ayurveda.js` (550 lines)
**Purpose:** Calculate Prakriti, Vikriti, and Agni from questionnaire responses

**What it does:**
- Processes 18 assessment questions
- Calculates Prakriti (birth constitution): 33% Vata, 33% Pitta, 33% Kapha
- Calculates Vikriti (current imbalance): Determines dominant dosha
- Calculates Agni (digestive fire): Variable/Sharp/Slow/Balanced
- **Output:** `{ prakriti, vikriti, agni, interpretation }`

**Key Functions:**
```javascript
_calculatePrakriti(responses)  // From all 18 questions
_calculateVikriti(responses)   // From Q7-Q15 (current state)
_calculateAgni(responses)      // From Q7-Q12 (digestion)
```

#### `rules/ayurveda.rules.js` (173 lines)
**Purpose:** Score individual FOOD ITEMS for a user

**What it does:**
- Takes user's Prakriti/Vikriti/Agni profile + a food item
- Evaluates if food balances or aggravates doshas
- Delegates to `diet/ayurvedaDietEngine.js` for scoring
- Returns food compatibility score (-20 to +20)
- **Output:** `{ scoreDelta, reasons, warnings, block }`

**Key Functions:**
```javascript
evaluateAyurveda(user, food)      // Main function
_transformUserToAssessment(user)  // Transform user profile
_generateReasonsFromBreakdown()   // Create explanations
```

**Relationship:**
```
User Questionnaire → assessment/ayurveda.js → Profile
Profile + Food Item → rules/ayurveda.rules.js → Food Score
```

**❌ NO DUPLICATION** - Different purposes, different logic

---

### 2. Unani Files

#### `assessment/unani.js` (406 lines)
**Purpose:** Calculate Mizaj (temperament) and Akhlat (humors) from questionnaire

**What it does:**
- Processes 20 assessment questions
- Calculates four humor scores: Dam (Hot+Moist), Safra (Hot+Dry), Balgham (Cold+Moist), Sauda (Cold+Dry)
- Determines primary/secondary Mizaj
- Calculates digestive strength
- **Output:** `{ primary_mizaj, secondary_mizaj, dominant_humor, severity, digestive_strength }`

**Key Functions:**
```javascript
score(responses)                     // Main assessment
_calculateDigestiveStrength()        // From Q16-Q17
_determineThermalTendency()          // Hot vs Cold
_determineMoistureTendency()         // Dry vs Moist
```

#### `rules/unani.rules.js` (184 lines)
**Purpose:** Score individual FOOD ITEMS for a user

**What it does:**
- Takes user's Mizaj profile + a food item
- Evaluates if food balances humors
- Delegates to `diet/unaniDietEngine.js` for scoring
- Returns food compatibility score
- **Output:** `{ scoreDelta, reasons, warnings, block }`

**Key Functions:**
```javascript
evaluateUnani(user, food)             // Main function
_transformUserToAssessment(user)      // Transform user profile
_generateReasonsFromBreakdown()       // Create explanations
```

**❌ NO DUPLICATION** - Different purposes, different logic

---

### 3. TCM Files

#### `assessment/tcm.js` (260 lines)
**Purpose:** Pattern diagnosis from questionnaire (Cold/Heat, Qi, Dampness, Liver patterns)

**What it does:**
- Processes TCM assessment questions across 4 sections
- Section A: Cold/Heat patterns
- Section B: Qi deficiency/excess
- Section C: Dampness patterns
- Section D: Liver Qi stagnation/heat
- **Output:** `{ primary_pattern, secondary_pattern, cold_heat_tendency, severity }`

**Key Functions:**
```javascript
score(responses)                     // Main assessment
_determineColdHeat(sectionScores)    // Section A analysis
_determineQiPattern(sectionScores)   // Section B analysis
_determineDampnessPattern()          // Section C analysis
_determineLiverPattern()             // Section D analysis
```

#### `rules/tcm.rules.js` (56 lines)
**Purpose:** Score individual FOOD ITEMS for a user

**What it does:**
- Takes user's TCM pattern + a food item
- Delegates to `diet/tcmDietEngine.js` for scoring
- Returns food compatibility score
- **Output:** `{ scoreDelta, reasons, warnings, block }`

**Key Functions:**
```javascript
evaluateTCM(user, food)              // Main function
_transformUserToAssessment(user)     // Transform user profile
```

**❌ NO DUPLICATION** - Different purposes, different logic

---

### 4. Modern Files

#### `assessment/modern.js` (445 lines)
**Purpose:** Calculate clinical nutrition profile (BMI, BMR, TDEE, macros)

**What it does:**
- Processes demographic and health data
- Calculates BMI (Body Mass Index)
- Calculates BMR (Basal Metabolic Rate) using Mifflin-St Jeor
- Calculates TDEE (Total Daily Energy Expenditure)
- Adjusts calories based on goals
- Calculates macro distribution (protein/carbs/fat)
- Identifies risk flags (diabetes, hypertension, etc.)
- **Output:** `{ bmi, bmr, tdee, recommended_calories, macro_split, risk_flags }`

**Key Functions:**
```javascript
score(responses)                     // Main calculation
_getBMICategory(bmi)                 // Underweight/Normal/Overweight/Obese
_adjustCaloriesForGoals(tdee, goals) // Goal-based calorie adjustment
_calculateMacros(calories, goals)    // Macro distribution
_identifyRiskFlags(bmi, conditions)  // Metabolic risk assessment
```

#### `rules/modern.rules.js` (249 lines)
**Purpose:** Score individual FOOD ITEMS based on clinical nutrition

**What it does:**
- Takes user's BMI, medical conditions + a food item
- Checks BMI/calorie compatibility
- Checks diabetes contraindications (high carb foods)
- Checks acid reflux triggers (high fat, spicy)
- Checks protein adequacy
- Checks micronutrient density
- **Output:** `{ scoreDelta, reasons, warnings, block }`

**Key Functions:**
```javascript
evaluateModern(user, food)           // Main function
checkBMICalories(user, food)         // BMI-based scoring
checkDiabetes(user, food)            // Diabetes safety
checkAcidReflux(user, food)          // GERD-friendly
checkProtein(user, food)             // Protein adequacy
checkMicronutrients(user, food)      // Nutrient density
```

**⚠️ MINOR OVERLAP** - Both files reference BMI and medical conditions, BUT:
- `assessment/modern.js`: **CALCULATES** BMI from height/weight
- `rules/modern.rules.js`: **USES** the already-calculated BMI to score foods

**❌ NO REAL DUPLICATION** - Different responsibilities

---

### 5. Special Files

#### `rules/safety.rules.js` (291 lines)
**Purpose:** Hard safety checks that BLOCK unsafe foods

**What it does:**
- Allergen blocking (nuts, dairy, gluten, soy, shellfish)
- Diabetes contraindications (very high carb foods)
- Acid reflux triggers (spicy, fried, acidic)
- Pregnancy/lactation warnings
- Medication interactions
- **Returns:** `block: true` for unsafe combinations

**Key Functions:**
```javascript
checkAllergies(user, food)           // Allergen blocking
checkDiabetesContraindications()     // Diabetes safety
checkAcidRefluxContraindications()   // GERD safety
checkPregnancyWarnings()             // Pregnancy safety
checkMedicationInteractions()        // Drug-food interactions
```

**❌ NO EQUIVALENT IN ASSESSMENT FOLDER** - Unique to food safety evaluation

---

#### `rules/ruleEngine.js` (63 lines)
**Purpose:** Common utilities for all rule files

**What it does:**
- Defines standard `RuleResult` format
- `createRuleResult()` - Factory function
- `mergeRuleResults()` - Combine multiple rules
- `clampScore()` - Limit score ranges

**❌ NO EQUIVALENT IN ASSESSMENT FOLDER** - Rule-specific utilities

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ONBOARDING (Once)                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Fills Questionnaire                                   │
│           ↓                                                 │
│  assessment/ayurveda.js    → Prakriti, Vikriti, Agni       │
│  assessment/unani.js       → Mizaj, Humors                 │
│  assessment/tcm.js         → TCM Patterns                  │
│  assessment/modern.js      → BMI, BMR, TDEE, Risk Flags    │
│           ↓                                                 │
│  SAVE TO DATABASE: User Health Profile                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. FOOD RECOMMENDATION (Every request)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LOAD FROM DATABASE: User Health Profile                   │
│           ↓                                                 │
│  For each food item in database:                           │
│           ↓                                                 │
│  rules/ayurveda.rules.js   → Score food for Ayurveda       │
│  rules/unani.rules.js      → Score food for Unani          │
│  rules/tcm.rules.js        → Score food for TCM            │
│  rules/modern.rules.js     → Score food for Modern         │
│  rules/safety.rules.js     → Check safety blocks           │
│           ↓                                                 │
│  scoring/scoreEngine.js    → Aggregate all scores          │
│           ↓                                                 │
│  RETURN: Ranked food list (50-100 score per food)          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Insights

### ✅ Clear Separation of Concerns

1. **Assessment Files:** "Who is the user?"
   - Input: Questionnaire responses
   - Output: Health profile
   - Runs: Once during onboarding

2. **Rules Files:** "Is this food compatible?"
   - Input: Health profile + Food item
   - Output: Compatibility score
   - Runs: Every food recommendation request

### ✅ No Functional Duplication

While both folders deal with the same medical systems (Ayurveda, Unani, TCM, Modern), they operate on different stages of the data pipeline:

- **Assessment:** User → Profile
- **Rules:** Profile + Food → Score

### ✅ Proper Architecture

This is actually a **good design pattern**:
- Separation of user profiling from food scoring
- Reusability (one profile, score thousands of foods)
- Maintainability (changes to scoring don't affect profiling)

---

## Conclusion

**NO DUPLICATION EXISTS**

The `assessment/` and `rules/` folders are:
- ✅ Complementary, not duplicative
- ✅ Following proper separation of concerns
- ✅ Part of a well-designed two-stage pipeline

The only minor overlap is that `rules/modern.rules.js` uses BMI calculated by `assessment/modern.js`, but this is **proper data reuse**, not duplication.

**Recommendation:** Keep both folders as-is. They serve different, essential purposes in the nutrition recommendation pipeline.
