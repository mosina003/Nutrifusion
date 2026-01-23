# Layer 2 APIs - Postman Testing Guide

Complete manual testing guide for all 12 Layer 2 APIs (Food Management + Recipe Management)

---

## Prerequisites

### 1. Start the Server
```bash
cd backend
npm start
```
Server should be running at: `http://localhost:5000`

### 2. Base URL
Set in Postman environment:
```
BASE_URL = http://localhost:5000/api
```

---

## Authentication Setup

### Test 1: Login as Admin
Get admin token for restricted operations.

**Request:**
```
POST {{BASE_URL}}/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "smosina003@gmail.com",
  "password": "Admin@123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "practitioner": {
    "_id": "...",
    "name": "Admin",
    "email": "smosina003@gmail.com",
    "role": "Admin"
  }
}
```

**Action:** 
- Copy the `token` value
- Save as Postman environment variable: `ADMIN_TOKEN`
- Or manually add to Authorization header in each request

---

## FOOD APIs (7 endpoints)

### Test 2: Get All Foods
View all foods in database.

**Request:**
```
GET {{BASE_URL}}/foods
```

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "count": 33,
  "data": [
    {
      "_id": "6957f3cb4d754243b83a6571",
      "name": "Rice",
      "category": "Grain",
      "modernNutrition": {
        "calories": 130,
        "protein": 2.7,
        "carbs": 28,
        "fat": 0.3,
        "fiber": 0.4
      },
      "createdAt": "2026-01-06T08:00:00.000Z"
    },
    // ... more foods
  ]
}
```

**Action:** Copy a `_id` value for Test 4

---

### Test 3: Get Food Categories
View all unique categories.

**Request:**
```
GET {{BASE_URL}}/foods/categories
```

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    "Grain",
    "Vegetable",
    "Fruit",
    "Dairy",
    "Meat",
    "Legume",
    "Spice",
    "Oil",
    "Nut",
    "Beverage"
  ]
}
```

---

### Test 4: Get Single Food
Get detailed food information.

**Request:**
```
GET {{BASE_URL}}/foods/6957f3cb4d754243b83a6571
```
*Replace with actual food ID from Test 2*

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "6957f3cb4d754243b83a6571",
    "name": "Rice",
    "aliases": [],
    "category": "Grain",
    "modernNutrition": {
      "calories": 130,
      "protein": 2.7,
      "carbs": 28,
      "fat": 0.3,
      "fiber": 0.4
    },
    "ayurveda": {},
    "tcm": {},
    "unani": {},
    "createdAt": "2026-01-06T08:00:00.000Z",
    "updatedAt": "2026-01-06T08:00:00.000Z"
  }
}
```

---

### Test 5: Search Foods
Search by name or aliases.

**Request:**
```
GET {{BASE_URL}}/foods?search=rice
```

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "name": "Rice",
      ...
    },
    {
      "name": "Curd Rice",
      ...
    }
  ]
}
```

**Other Search Examples:**
```
GET {{BASE_URL}}/foods?category=Spice
GET {{BASE_URL}}/foods?category=Vegetable&search=green
```

---

### Test 6: Create Food (Admin/Approver Only)
Create a new food item.

**Request:**
```
POST {{BASE_URL}}/foods
```

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Test Quinoa",
  "aliases": ["Kinwa"],
  "category": "Grain",
  "modernNutrition": {
    "calories": 120,
    "protein": 4.4,
    "carbs": 21,
    "fat": 1.9,
    "fiber": 2.8,
    "micronutrients": {
      "iron": 1.5,
      "calcium": 17
    }
  },
  "ayurveda": {
    "rasa": ["Sweet", "Astringent"],
    "guna": ["Light", "Dry"],
    "virya": "Cold",
    "vipaka": "Sweet",
    "doshaEffect": {
      "vata": "Neutral",
      "pitta": "Decrease",
      "kapha": "Neutral"
    }
  },
  "tcm": {
    "thermalNature": "Neutral",
    "flavor": ["Sweet"],
    "meridian": ["Spleen", "Stomach"]
  },
  "unani": {
    "temperament": {
      "heat": "Cold",
      "moisture": "Dry"
    },
    "digestionEase": "Easy"
  }
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Food item created successfully",
  "data": {
    "_id": "695d1b29936a3218a27d913d",
    "name": "Test Quinoa",
    "aliases": ["Kinwa"],
    "category": "Grain",
    "modernNutrition": {...},
    "ayurveda": {...},
    "createdAt": "2026-01-06T10:30:00.000Z"
  }
}
```

**Action:** Copy the `_id` for Tests 7 and 8

**Error Cases:**
- Duplicate name → 400: "Food \"Test Quinoa\" already exists"
- Missing name → 400: "Please provide food name and category"
- No token → 401: "Not authorized"
- Non-admin → 403: "Access denied. Requires Approver authority"

---

### Test 7: Update Food (Admin/Approver Only)
Update existing food.

**Request:**
```
PUT {{BASE_URL}}/foods/695d1b29936a3218a27d913d
```
*Use ID from Test 6*

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "modernNutrition": {
    "calories": 125,
    "protein": 4.5,
    "carbs": 21,
    "fat": 2.0,
    "fiber": 3.0
  }
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Food item updated successfully",
  "data": {
    "_id": "695d1b29936a3218a27d913d",
    "name": "Test Quinoa",
    "modernNutrition": {
      "calories": 125,
      "protein": 4.5,
      "carbs": 21,
      "fat": 2.0,
      "fiber": 3.0,
      "micronutrients": {
        "iron": 1.5,
        "calcium": 17
      }
    },
    ...
  }
}
```

---

### Test 8: Delete Food (Admin/Approver Only)
Delete a food item.

**Request:**
```
DELETE {{BASE_URL}}/foods/695d1b29936a3218a27d913d
```
*Use ID from Test 6*

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Food item deleted successfully"
}
```

**Error Case - Food Used in Recipe:**
```json
{
  "success": false,
  "message": "Cannot delete food. It is used in 5 recipe(s)",
  "recipesCount": 5
}
```

---

### Test 9: Bulk Create Foods (Admin/Approver Only)
Create multiple foods at once.

**Request:**
```
POST {{BASE_URL}}/foods/bulk
```

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "foods": [
    {
      "name": "Test Black Pepper",
      "category": "Spice",
      "modernNutrition": {
        "calories": 251,
        "protein": 10,
        "carbs": 64,
        "fat": 3.3,
        "fiber": 25
      }
    },
    {
      "name": "Test Cardamom",
      "category": "Spice",
      "modernNutrition": {
        "calories": 311,
        "protein": 11,
        "carbs": 68,
        "fat": 6.7,
        "fiber": 28
      }
    }
  ]
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "2 food items created successfully",
  "count": 2,
  "data": [
    {
      "_id": "...",
      "name": "Test Black Pepper",
      ...
    },
    {
      "_id": "...",
      "name": "Test Cardamom",
      ...
    }
  ]
}
```

**Cleanup:** Delete these test foods using Test 8

---

## RECIPE APIs (5 endpoints)

### Test 10: Get All Recipes
View all recipes (public + own recipes).

**Request:**
```
GET {{BASE_URL}}/recipes
```

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "6957f3cb4d754243b83a6580",
      "name": "Vegetable Khichdi",
      "description": "Healing khichdi with mixed vegetables",
      "ingredients": [
        {
          "foodId": {
            "_id": "...",
            "name": "Rice",
            "category": "Grain"
          },
          "quantity": 50,
          "unit": "g"
        }
      ],
      "nutrientSnapshot": {
        "servingSize": 457,
        "servingUnit": "g",
        "calories": 189,
        "protein": 5.6,
        "carbs": 28.7,
        "fat": 5.7,
        "fiber": 4.3
      },
      "cookingMethod": {
        "type": "Boiled",
        "description": "...",
        "duration": 25
      },
      "tags": ["Vata Balancing", "Easy to Digest"],
      "difficulty": "Easy",
      "prepTime": 10,
      "cookTime": 25,
      "isPublic": true
    }
  ]
}
```

**Action:** Copy a recipe `_id` for Test 12

---

### Test 11: Filter Recipes
Filter by tags, difficulty, or public status.

**Request:**
```
GET {{BASE_URL}}/recipes?tags=Vata Balancing
```

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Other Filter Examples:**
```
GET {{BASE_URL}}/recipes?difficulty=Easy
GET {{BASE_URL}}/recipes?isPublic=true
GET {{BASE_URL}}/recipes?tags=Pitta Soothing,Easy to Digest
```

---

### Test 12: Get Single Recipe
Get detailed recipe with populated ingredients.

**Request:**
```
GET {{BASE_URL}}/recipes/6957f3cb4d754243b83a6580
```
*Use ID from Test 10*

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "6957f3cb4d754243b83a6580",
    "name": "Vegetable Khichdi",
    "description": "Healing khichdi with mixed vegetables",
    "ingredients": [
      {
        "foodId": {
          "_id": "...",
          "name": "Rice",
          "category": "Grain",
          "modernNutrition": {...}
        },
        "quantity": 50,
        "unit": "g"
      }
    ],
    "nutrientSnapshot": {...},
    "cookingMethod": {...},
    "tags": ["Vata Balancing"],
    "difficulty": "Easy",
    "prepTime": 10,
    "cookTime": 25,
    "servings": 1,
    "isPublic": true,
    "createdBy": {
      "type": "System",
      "id": null
    }
  }
}
```

---

### Test 13: Create Recipe
Create a new recipe with auto-calculated nutrition.

**Preparation:** Get food IDs first
```
GET {{BASE_URL}}/foods?search=rice
GET {{BASE_URL}}/foods?search=dal
GET {{BASE_URL}}/foods?search=ghee
```
Copy `_id` values for each food.

**Request:**
```
POST {{BASE_URL}}/recipes
```

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Test Simple Khichdi",
  "description": "A simple test recipe",
  "ingredients": [
    {
      "foodId": "PASTE_RICE_ID_HERE",
      "quantity": 100,
      "unit": "g"
    },
    {
      "foodId": "PASTE_DAL_ID_HERE",
      "quantity": 50,
      "unit": "g"
    },
    {
      "foodId": "PASTE_GHEE_ID_HERE",
      "quantity": 5,
      "unit": "g"
    }
  ],
  "cookingMethod": {
    "type": "Boiled",
    "description": "Cook rice and dal together until soft",
    "duration": 20
  },
  "tags": ["Test", "Simple"],
  "difficulty": "Easy",
  "prepTime": 5,
  "cookTime": 20,
  "servings": 1,
  "isPublic": false
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Recipe created successfully",
  "data": {
    "_id": "695d1b29936a3218a27d913e",
    "name": "Test Simple Khichdi",
    "ingredients": [...],
    "nutrientSnapshot": {
      "servingSize": 155,
      "servingUnit": "g",
      "calories": 195,
      "protein": 5.2,
      "carbs": 34,
      "fat": 4.8,
      "fiber": 2.9
    },
    "createdBy": {
      "type": "Practitioner",
      "id": "..."
    }
  }
}
```

**Note:** Nutrition is automatically calculated from ingredients!

**Action:** Copy the recipe `_id` for Tests 14 and 15

---

### Test 14: Update Recipe
Update recipe details. Nutrition auto-recalculates if ingredients change.

**Request:**
```
PUT {{BASE_URL}}/recipes/695d1b29936a3218a27d913e
```
*Use ID from Test 13*

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Body (raw JSON) - Update description and tags:**
```json
{
  "description": "An updated simple test recipe",
  "tags": ["Test", "Updated", "Simple"],
  "isPublic": true
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Recipe updated successfully",
  "data": {
    "_id": "695d1b29936a3218a27d913e",
    "name": "Test Simple Khichdi",
    "description": "An updated simple test recipe",
    "tags": ["Test", "Updated", "Simple"],
    "isPublic": true,
    ...
  }
}
```

**Update with New Ingredients (recalculates nutrition):**
```json
{
  "ingredients": [
    {
      "foodId": "PASTE_RICE_ID_HERE",
      "quantity": 150,
      "unit": "g"
    },
    {
      "foodId": "PASTE_DAL_ID_HERE",
      "quantity": 75,
      "unit": "g"
    }
  ]
}
```

---

### Test 15: Delete Recipe
Delete a recipe (only creator can delete).

**Request:**
```
DELETE {{BASE_URL}}/recipes/695d1b29936a3218a27d913e
```
*Use ID from Test 13*

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Recipe deleted successfully"
}
```

**Error - Not Creator:**
```json
{
  "success": false,
  "message": "Not authorized to delete this recipe"
}
```

---

## Testing Checklist

Use this checklist to track your testing progress:

### Food APIs
- [ ] Test 1: Login as Admin ✓
- [ ] Test 2: Get All Foods ✓
- [ ] Test 3: Get Food Categories ✓
- [ ] Test 4: Get Single Food ✓
- [ ] Test 5: Search Foods ✓
- [ ] Test 6: Create Food (Admin only) ✓
- [ ] Test 7: Update Food (Admin only) ✓
- [ ] Test 8: Delete Food (Admin only) ✓
- [ ] Test 9: Bulk Create Foods (Admin only) ✓

### Recipe APIs
- [ ] Test 10: Get All Recipes ✓
- [ ] Test 11: Filter Recipes ✓
- [ ] Test 12: Get Single Recipe ✓
- [ ] Test 13: Create Recipe (with auto-calc nutrition) ✓
- [ ] Test 14: Update Recipe ✓
- [ ] Test 15: Delete Recipe ✓

---

## Quick Reference

### Environment Variables (Postman)
```
BASE_URL = http://localhost:5000/api
ADMIN_TOKEN = (paste token from login)
```

### Admin Credentials
```
Email: smosina003@gmail.com
Password: Admin@123
```

### Common Error Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (no token or invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Server Error

### Authorization Header Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Tips for Postman

### 1. Create Collection
- New Collection: "NutriFusion - Layer 2 APIs"
- Add folders: "Food APIs" and "Recipe APIs"
- Save all 15 tests in respective folders

### 2. Use Variables
Set collection variables:
- `base_url`: `http://localhost:5000/api`
- `admin_token`: (paste after login)
- `food_id`: (save from create response)
- `recipe_id`: (save from create response)

Access with `{{base_url}}`, `{{admin_token}}`, etc.

### 3. Save Responses
Use Postman's "Tests" tab to auto-save IDs:
```javascript
// In Test 6 (Create Food)
var jsonData = pm.response.json();
pm.collectionVariables.set("food_id", jsonData.data._id);
```

### 4. Pre-request Script for Auth
Add to collection pre-request script:
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.collectionVariables.get('admin_token')
});
```

---

## Troubleshooting

### Issue: 401 Unauthorized
**Solution:** 
1. Check token is correctly copied
2. Token might have expired (24h validity)
3. Re-login to get new token

### Issue: 403 Forbidden
**Solution:**
1. Ensure logged in as Admin/Approver
2. Check practitioner role: `POST /api/auth/me`
3. Verify account is verified

### Issue: 404 Not Found
**Solution:**
1. Check API endpoint URL is correct
2. Verify server is running on port 5000
3. Check resource ID exists in database

### Issue: 500 Server Error
**Solution:**
1. Check server console for error details
2. Verify MongoDB connection is active
3. Check all required fields are provided

### Issue: Cannot Delete Food
**Solution:**
- Food is used in recipes
- First delete or update recipes using that food
- Or use a different test food that's not in use

---

## Expected Test Duration

- Setup (server + login): **2 minutes**
- Food APIs (Tests 2-9): **10-15 minutes**
- Recipe APIs (Tests 10-15): **10-15 minutes**
- **Total: ~30 minutes**

---

## Success Criteria

All 15 tests should:
✅ Return expected status codes
✅ Return data in correct format
✅ Auto-calculate nutrition for recipes
✅ Enforce access control (Admin/Approver only)
✅ Validate required fields
✅ Handle errors gracefully

---

## Next Steps After Testing

1. ✅ Verify all 12 Layer 2 APIs working
2. ✅ Test with different user roles (Viewer, Editor)
3. ✅ Export Postman collection for team
4. ✅ Move to Layer 3 (Frontend development)

---

**Happy Testing! 🚀**
