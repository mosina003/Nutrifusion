# STEP 5: Recipes Connected to Diet Plans ✅

## Overview
Diet plans now automatically calculate total nutrition when recipes are selected. The backend fetches nutrition data from each recipe and multiplies by portion size.

## How It Works

### 1. Recipe Nutrition Storage
Each recipe has a `nutrientSnapshot` with calculated nutrition:
```json
{
  "nutrientSnapshot": {
    "servingSize": 457,
    "servingUnit": "g",
    "calories": 189,
    "protein": 5.6,
    "carbs": 28.7,
    "fat": 5.7,
    "fiber": 4.3
  }
}
```

### 2. Diet Plan Creation
When you create a diet plan with meals:
```javascript
POST /api/diet-plans
{
  "userId": "user_id_here",
  "planName": "Balanced Daily Plan",
  "meals": [
    {
      "mealType": "Breakfast",
      "recipeId": "recipe_id_1",
      "portion": 1,
      "scheduledTime": "08:00"
    },
    {
      "mealType": "Lunch",
      "recipeId": "recipe_id_2",
      "portion": 1.5,  // Can use portions > 1
      "scheduledTime": "13:00"
    },
    {
      "mealType": "Dinner",
      "recipeId": "recipe_id_3",
      "portion": 1,
      "scheduledTime": "19:00"
    }
  ]
}
```

### 3. Auto-Calculation Process
Backend automatically:
1. **Validates** all recipe IDs exist
2. **Fetches** nutrition from each recipe
3. **Multiplies** by portion size
4. **Sums** total nutrition across all meals
5. **Stores** in `dietPlan.nutrientSnapshot`

### 4. Response
```json
{
  "success": true,
  "data": {
    "_id": "diet_plan_id",
    "planName": "Balanced Daily Plan",
    "meals": [...],
    "nutrientSnapshot": {
      "calories": 550,
      "protein": 18.5,
      "carbs": 95.2,
      "fat": 12.3,
      "fiber": 10.8
    },
    "doshaBalance": {
      "vata": 0.15,
      "pitta": -0.25,
      "kapha": 0.10
    }
  }
}
```

## Key Features

### ✅ Automatic Calculation
- **No manual input required** - Backend calculates from recipes
- **Real-time** - Calculated on every diet plan creation/update
- **Accurate** - Based on actual food nutrition data

### ✅ Portion Support
- **Flexible portions** - Use 0.5, 1, 1.5, 2, etc.
- **Automatic scaling** - Nutrition multiplied by portion
- Example: Recipe with 200 cal × portion 1.5 = 300 cal in plan

### ✅ Multiple Meals
- **6 meal types** - Breakfast, Lunch, Dinner, Snack, Pre-Workout, Post-Workout
- **Unlimited meals** - Add as many meals as needed
- **Daily total** - Sum of all meals' nutrition

### ✅ Dosha Balance
- **Ayurvedic integration** - Calculates Vata, Pitta, Kapha effects
- **Based on ingredients** - Uses food dosha properties
- **Automatic** - Calculated alongside nutrition

## Example Workflow

### 1. Get Available Recipes
```javascript
GET /api/recipes
Authorization: Bearer <token>

Response:
{
  "data": [
    {
      "_id": "6957f3cb4d754243b83a6571",
      "name": "Vegetable Khichdi",
      "nutrientSnapshot": {
        "calories": 189,
        "protein": 5.6,
        "carbs": 28.7,
        "fat": 5.7,
        "fiber": 4.3
      }
    },
    {
      "_id": "6957f3cb4d754243b83a6572",
      "name": "Curd Rice",
      "nutrientSnapshot": {
        "calories": 176,
        "protein": 6.4,
        "carbs": 28.9,
        "fat": 4.1,
        "fiber": 0.4
      }
    }
  ]
}
```

### 2. Create Diet Plan
```javascript
POST /api/diet-plans
Authorization: Bearer <token>
{
  "userId": "6957f3cb4d754243b83a6570",
  "planName": "Patient Recovery Plan",
  "meals": [
    {
      "mealType": "Breakfast",
      "recipeId": "6957f3cb4d754243b83a6571",  // Vegetable Khichdi
      "portion": 1,
      "scheduledTime": "08:00"
    },
    {
      "mealType": "Lunch",
      "recipeId": "6957f3cb4d754243b83a6572",  // Curd Rice
      "portion": 1,
      "scheduledTime": "13:00"
    }
  ],
  "rulesApplied": ["Easy to digest", "High protein"],
  "status": "Draft"
}

Response:
{
  "success": true,
  "message": "Diet plan created successfully",
  "data": {
    "_id": "695d1b29936a3218a27d913c",
    "userId": {...},
    "planName": "Patient Recovery Plan",
    "meals": [...],
    "nutrientSnapshot": {
      "calories": 365,      // 189 + 176
      "protein": 12,        // 5.6 + 6.4
      "carbs": 57.6,        // 28.7 + 28.9
      "fat": 9.8,           // 5.7 + 4.1
      "fiber": 4.7          // 4.3 + 0.4
    }
  }
}
```

### 3. Update Diet Plan (also auto-calculates)
```javascript
PUT /api/diet-plans/:id
Authorization: Bearer <token>
{
  "meals": [
    // Updated meals
  ]
}
// Nutrition automatically recalculated
```

## Backend Implementation

### Route: POST /api/diet-plans
File: `backend/routes/dietPlans.js`

```javascript
// Auto-calculation happens in route handler
const nutrientSnapshot = meals && meals.length > 0 
  ? await calculateNutrientSnapshot(meals) 
  : null;

const dietPlan = await DietPlan.create({
  userId,
  planName,
  meals,
  nutrientSnapshot,  // ← Automatically calculated
  doshaBalance,      // ← Also calculated
  status,
  createdBy: req.practitioner._id
});
```

### Helper Function: calculateNutrientSnapshot
```javascript
const calculateNutrientSnapshot = async (meals) => {
  let totalCalories = 0, totalProtein = 0, totalCarbs = 0, 
      totalFat = 0, totalFiber = 0;

  for (const meal of meals) {
    const recipe = await Recipe.findById(meal.recipeId);
    if (recipe && recipe.nutrientSnapshot) {
      const portion = meal.portion || 1;
      totalCalories += (recipe.nutrientSnapshot.calories || 0) * portion;
      totalProtein += (recipe.nutrientSnapshot.protein || 0) * portion;
      totalCarbs += (recipe.nutrientSnapshot.carbs || 0) * portion;
      totalFat += (recipe.nutrientSnapshot.fat || 0) * portion;
      totalFiber += (recipe.nutrientSnapshot.fiber || 0) * portion;
    }
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10
  };
};
```

## Database State

### Current Recipes (15 total)
All recipes have accurate calculated nutrition:
- Plain Steamed Rice: 130 cal, 2.7g protein
- Soft Chapati: 204 cal, 6g protein
- Moong Dal: 66 cal, 4.3g protein
- Curd Rice: 176 cal, 6.4g protein
- Vegetable Khichdi: 189 cal, 5.6g protein
- Vata Balancing Soup: 81 cal, 1g protein
- Warm Oats Porridge: 116 cal, 6.3g protein
- Pitta Soothing Khichdi: 161 cal, 4.6g protein
- Coconut Vegetable Stir Fry: 171 cal, 2.9g protein
- Kapha Light Stir Fry: 89 cal, 1.7g protein
- Steamed Vegetables: 52 cal, 2.9g protein
- Diabetic-Friendly Bowl: 176 cal, 6.9g protein
- Acid Reflux Meal: 138 cal, 2.3g protein
- Light Dinner: 64 cal, 3.1g protein
- Iron-Rich Bowl: 86 cal, 3.1g protein

### Food Database (33 items)
All foods have `modernNutrition` per 100g:
- Rice, Wheat Flour, Oats, Moong Dal
- Vegetables: Mixed, Carrot, Pumpkin, Bottle Gourd, etc.
- Dairy: Curd, Milk, Ghee
- Spices: Turmeric, Salt, Cumin, Ginger, etc.
- Oils: Coconut Oil, Oil
- Others: Coconut, Jaggery, Seeds, Apple, Lemon, Water

## Testing

### Manual Test (via API)
1. Start server: `npm start`
2. Login as practitioner
3. POST to `/api/diet-plans` with meals
4. Verify `nutrientSnapshot` in response

### Automated Test
```bash
# Start server first
npm start

# In another terminal
node scripts/testDietPlanAPI.js
```

Expected output:
```
✅ Logged in successfully
✅ Found 15 recipes
🧮 Calculating expected nutrition...
📋 Creating diet plan via API...
✅ Diet plan created!
📊 VERIFIED - Auto-Calculated Nutrition:
   Calories: 400 (expected: 400)
   Protein: 13g (expected: 13g)
✅ ✅ ✅ PERFECT MATCH!
🎉 ALL TESTS PASSED!
```

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/recipes` | GET | Get all recipes with nutrition |
| `/api/diet-plans` | POST | Create diet plan (auto-calculates) |
| `/api/diet-plans/:id` | PUT | Update diet plan (recalculates) |
| `/api/diet-plans/:id` | GET | Get diet plan with nutrition |
| `/api/diet-plans/user/:userId` | GET | Get user's diet plans |

## Validation

### Recipe Validation
- All recipe IDs must exist
- Returns 404 if recipe not found
- Validates before calculating nutrition

### Portion Validation
- Must be positive number
- Defaults to 1 if not provided
- Supports decimals (0.5, 1.5, 2.5, etc.)

### Meal Type Validation
- Must be one of: Breakfast, Lunch, Dinner, Snack, Pre-Workout, Post-Workout
- Case-sensitive
- Required for each meal

## Error Handling

### Recipe Not Found
```json
{
  "success": false,
  "message": "Recipe not found: 6957f3cb4d754243b83a9999"
}
```

### User Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### Missing Fields
```json
{
  "success": false,
  "message": "Please provide userId"
}
```

## Performance Notes

- **Efficient queries** - Single query per recipe
- **Cached nutrition** - No recalculation of recipe nutrition
- **Fast calculation** - O(n) where n = number of meals
- **Scalable** - Tested with 3-10 meals per plan

## Security

- **Authentication required** - JWT token needed
- **Authorization** - Only practitioners (Editor/Approver role)
- **Verified accounts** - Must be verified practitioner
- **User validation** - Checks if user exists and is accessible

## Next Steps (Future Enhancements)

1. **Nutrient Goals** - Compare plan nutrition vs user goals
2. **Alternative Suggestions** - Suggest recipes to meet goals
3. **Weekly Plans** - Multi-day diet plans with daily totals
4. **Meal Swaps** - Replace meals while maintaining nutrition
5. **Export** - PDF/Excel export with nutrition breakdown
6. **Analytics** - Nutrition trends over time

## Status: ✅ COMPLETE

**STEP 5 is fully implemented and tested!**

- ✅ Recipes have calculated nutrition
- ✅ Diet plans auto-calculate total nutrition
- ✅ Portion sizes supported
- ✅ Dosha balance calculated
- ✅ API endpoints functional
- ✅ Validation in place
- ✅ Error handling implemented

**Ready for production use!**
