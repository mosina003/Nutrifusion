# JSON-Based Food Constitution System

## Overview

The NutriFusion platform now uses **JSON-based food data files** instead of MongoDB seeding for diet plan generation. This approach provides:

✅ **Separation of Concerns**: Food data is independent from database
✅ **Easy Updates**: Edit JSON files to add/modify foods without database migrations
✅ **Version Control**: Track food data changes in Git
✅ **Framework-Specific Data**: Each medical framework has its own food constitution file
✅ **Scalability**: Easy to manage hundreds/thousands of foods per framework

---

## Architecture

### File Structure

```
backend/
├── data/
│   ├── ayurveda_food_constitution.json    (50 foods - ACTIVE)
│   ├── unani_food_constitution.json       (3 sample foods)
│   ├── tcm_food_constitution.json         (3 sample foods)
│   └── modern_food_constitution.json      (3 sample foods)
│
├── services/intelligence/diet/
│   ├── ayurvedaDietEngine.js     → Loads ayurveda_food_constitution.json
│   ├── unaniDietEngine.js        → Loads unani_food_constitution.json
│   ├── tcmDietEngine.js          → Loads tcm_food_constitution.json
│   └── modernDietEngine.js       → Loads modern_food_constitution.json
│
└── scripts/
    └── clearFoodData.js          → Removes all foods from MongoDB
```

---

## Food Data Files

### 1. Ayurveda Food Constitution (`ayurveda_food_constitution.json`)

**Status**: ✅ 50 foods available

**Schema**:
```json
{
  "food_name": "Idli",
  "category": "grain",
  "preparation_methods": ["steamed", "fermented"],
  "rasa": ["sour", "sweet"],
  "virya": "cooling",
  "vipaka": "sweet",
  "guna": ["light", "soft"],
  "vata_effect": 0,
  "pitta_effect": 0,
  "kapha_effect": 1,
  "digestibility_score": 2,
  "ama_forming_potential": "low"
}
```

**Properties**:
- `vata_effect`, `pitta_effect`, `kapha_effect`: -1 (decrease), 0 (neutral), 1 (increase)
- `virya`: "heating" or "cooling"
- `rasa`: Array of tastes (sweet, sour, salty, pungent, bitter, astringent)
- `guna`: Array of qualities (heavy, light, oily, dry, hot, cold, etc.)

---

### 2. Unani Food Constitution (`unani_food_constitution.json`)

**Status**: ⚠️ 3 sample foods (needs expansion)

**Schema**:
```json
{
  "food_name": "Ginger",
  "category": "spice",
  "temperament": {
    "hot_level": 3,
    "cold_level": 0,
    "dry_level": 2,
    "moist_level": 0
  },
  "dominant_humor": "safra",
  "humor_effects": {
    "dam": 1,
    "safra": 2,
    "balgham": -2,
    "sauda": 0
  },
  "organ_affinity": ["معدہ (Stomach)", "پھیپھڑے (Lungs)"],
  "digestion_ease": "easy",
  "therapeutic_use": "Digestive stimulant, warms body"
}
```

**Properties**:
- `temperament`: 0-4 scale for hot, cold, dry, moist levels
- `humor_effects`: -2 to +2 effect on each humor (dam, safra, balgham, sauda)
- `digestion_ease`: "easy", "moderate", "hard"

---

### 3. TCM Food Constitution (`tcm_food_constitution.json`)

**Status**: ⚠️ 3 sample foods (needs expansion)

**Schema**:
```json
{
  "food_name": "Ginger (Fresh)",
  "category": "spice",
  "thermal_nature": "warm",
  "flavor": ["pungent"],
  "meridian": ["Lung", "Spleen", "Stomach"],
  "element_affinity": "Metal",
  "qi_effect": "moves",
  "blood_effect": "warms",
  "yin_yang_balance": "yang",
  "pattern_effects": {
    "qi_deficiency": 1,
    "blood_deficiency": 0,
    "yin_deficiency": -1,
    "yang_deficiency": 2,
    "qi_stagnation": 0,
    "blood_stasis": 0,
    "dampness": -2,
    "heat": -1,
    "cold": 2
  },
  "therapeutic_use": "Warms middle jiao, expels cold, stops nausea"
}
```

**Properties**:
- `thermal_nature`: "hot", "warm", "neutral", "cool", "cold"
- `flavor`: Array of ["sweet", "sour", "bitter", "pungent", "salty"]
- `pattern_effects`: -2 to +2 effect on each TCM pattern

---

### 4. Modern Food Constitution (`modern_food_constitution.json`)

**Status**: ⚠️ 3 sample foods (needs expansion)

**Schema**:
```json
{
  "food_name": "Ginger",
  "category": "spice",
  "calories": 80,
  "protein": 1.8,
  "carbs": 18,
  "fat": 0.8,
  "fiber": 2,
  "glycemic_index": 15,
  "micronutrients": {
    "iron": 0.6,
    "calcium": 16,
    "magnesium": 43,
    "potassium": 415,
    "vitamin_c": 5,
    "vitamin_b6": 0.16
  },
  "health_conditions": {
    "diabetes": 1,
    "hypertension": 0,
    "heart_disease": 1,
    "kidney_disease": 0,
    "digestive_issues": 2,
    "autoimmune": 1,
    "metabolic_syndrome": 1,
    "inflammation": 2
  },
  "allergen_info": "none",
  "therapeutic_use": "Anti-inflammatory, aids digestion, nausea relief"
}
```

**Properties**:
- Macros: calories, protein, carbs, fat, fiber (per 100g)
- `glycemic_index`: 0-100
- `health_conditions`: -2 (avoid), -1 (caution), 0 (neutral), 1 (helpful), 2 (highly beneficial)
- `allergen_info`: "gluten", "dairy", "nuts", "shellfish", "soy", "eggs", "none"

---

## How It Works

### Loading Process

1. **First Request**: Diet engine loads JSON file into memory
2. **Caching**: Data cached for subsequent requests (singleton pattern)
3. **Transformation**: JSON format converted to internal engine format
4. **Scoring**: Foods scored based on user assessment
5. **Ranking**: Foods categorized and returned

### Example Flow (Ayurveda)

```javascript
// User completes Ayurveda assessment
const assessmentResult = {
  prakriti: { vata: 40, pitta: 35, kapha: 25 },
  vikriti: { vata: 60, pitta: 20, kapha: 20 },
  agni: 'Variable',
  dominant_dosha: 'vata',
  severity: 2
};

// Diet plan service calls engine
const dietPlan = await ayurvedaDietPlanService.generateDietPlan(assessmentResult);

// Engine loads from JSON (if not cached)
✅ Loaded 50 Ayurveda foods from JSON

// Scores and returns
// {
//   highly_recommended: [ ... 15 foods ],
//   moderate: [ ... 20 foods ],
//   avoid: [ ... 15 foods ],
//   7_day_plan: { ... }
// }
```

---

## Database Cleanup

### Clear Existing Food Data

Before using the JSON system, clear the database:

```bash
cd backend
node scripts/clearFoodData.js
```

Output:
```
🗑️  Starting food data cleanup...
✅ Connected to MongoDB
📊 Found 8 foods in database
🗑️  Deleted 8 food documents
📊 Remaining foods: 0

✅ SUCCESS: All food data cleared from database
💡 System will now use JSON files for food data
```

---

## Adding New Foods

### Ayurveda Example

Add to `backend/data/ayurveda_food_constitution.json`:

```json
{
  "food_name": "Basmati Rice",
  "category": "grain",
  "preparation_methods": ["boiled", "steamed"],
  "rasa": ["sweet"],
  "virya": "cooling",
  "vipaka": "sweet",
  "guna": ["light", "soft"],
  "vata_effect": -1,
  "pitta_effect": -1,
  "kapha_effect": 1,
  "digestibility_score": 2,
  "ama_forming_potential": "low"
}
```

### Unani Example

Add to `backend/data/unani_food_constitution.json`:

```json
{
  "food_name": "Dates",
  "category": "fruit",
  "temperament": {
    "hot_level": 2,
    "cold_level": 0,
    "dry_level": 0,
    "moist_level": 2
  },
  "dominant_humor": "dam",
  "humor_effects": {
    "dam": 2,
    "safra": 0,
    "balgham": 0,
    "sauda": 0
  },
  "organ_affinity": ["جگر (Liver)", "دماغ (Brain)"],
  "digestion_ease": "moderate",
  "therapeutic_use": "Energy, strength, brain tonic"
}
```

---

## Benefits of JSON System

### 1. **Easy Collaboration**
- Medical experts can edit JSON files directly
- No database access required
- Clear, readable format

### 2. **Version Control**
- Track changes in Git
- Revert to previous versions
- Review food data changes in PRs

### 3. **Scalability**
- Add 100s of foods without database migrations
- Framework-specific data isolation
- Easy to maintain per-framework food lists

### 4. **Testing**
- Create test food sets easily
- Swap between different food datasets
- No database dependency for testing

### 5. **Deployment**
- No database seeding scripts needed
- Files deploy with codebase
- Consistent across environments

---

## Next Steps

### Expand Food Databases

1. **Unani**: Expand from 3 → 50+ foods
2. **TCM**: Expand from 3 → 50+ foods  
3. **Modern**: Expand from 3 → 50+ foods

### Add Food Properties

- Seasonal availability
- Regional variants
- Preparation methods
- Contraindications
- Therapeutic combinations

### Create Food Management Tools

- Admin UI for adding foods
- Validation tools
- Import/export utilities
- Bulk editing capabilities

---

## Technical Notes

### Memory Usage
- Each JSON file loads once and caches
- Ayurveda (50 foods) ≈ 50KB in memory
- All 4 frameworks (200 foods) ≈ 200KB total
- Negligible impact on server performance

### Performance
- JSON parsing: ~1-5ms (first load only)
- In-memory access: <1ms (subsequent requests)
- No database queries for food data
- Faster than MongoDB fetching

### File Size Limits
- Recommended: <1000 foods per file
- Max: ~5000 foods per file
- Beyond that: Consider splitting by category or region

---

## Migration Summary

### Before (MongoDB)
```javascript
// Seed foods to database
await Food.insertMany(sampleFoods);

// Query during diet plan generation
const foods = await Food.find({ verified: true });
```

### After (JSON)
```javascript
// Foods stored in JSON files
// backend/data/ayurveda_food_constitution.json

// Load during diet plan generation
const foods = loadAyurvedaFoods(); // From file
```

---

## Troubleshooting

### Issue: Foods not loading

**Solution**: Check file exists
```bash
ls backend/data/*.json
```

### Issue: Invalid JSON

**Solution**: Validate JSON syntax
```bash
node -e "JSON.parse(require('fs').readFileSync('backend/data/ayurveda_food_constitution.json'))"
```

### Issue: Wrong food count

**Solution**: Count foods in file
```powershell
(Get-Content "backend/data/ayurveda_food_constitution.json" | ConvertFrom-Json).Count
```

---

## Conclusion

The JSON-based food system provides a **clean, maintainable, and scalable** approach to managing food data across 4 medical nutrition frameworks. You can now easily expand each framework's food database by editing the corresponding JSON file.

**Current Status**:
- ✅ Ayurveda: 50 foods
- ⚠️ Unani: 3 foods (expand with your data)
- ⚠️ TCM: 3 foods (expand with your data)
- ⚠️ Modern: 3 foods (expand with your data)
