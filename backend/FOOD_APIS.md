# Food Management APIs - Documentation

## Overview
Complete CRUD APIs for managing the food database. Restricted to **Admin and Approver roles** for create/update/delete operations.

---

## Authentication & Authorization

### Access Levels

| Operation | User | Practitioner (Viewer) | Practitioner (Editor) | Practitioner (Approver) | Admin |
|-----------|------|----------------------|----------------------|------------------------|-------|
| GET (View) | ❌ | ✅ | ✅ | ✅ | ✅ |
| POST (Create) | ❌ | ❌ | ❌ | ✅ | ✅ |
| PUT (Update) | ❌ | ❌ | ❌ | ✅ | ✅ |
| DELETE | ❌ | ❌ | ❌ | ✅ | ✅ |
| Bulk Create | ❌ | ❌ | ❌ | ✅ | ✅ |

**Admin bypass**: Admin practitioners automatically bypass authority checks.

---

## API Endpoints

### 1. Create Food Item

**POST** `/api/foods`

Create a new food item in the database.

**Authorization**: Admin or Approver only 🔒

**Request Body**:
```json
{
  "name": "Quinoa",
  "aliases": ["Kinwa", "Keen-wah"],
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
    "taste": ["Sweet", "Astringent"],
    "energy": "Cooling",
    "doshaEffect": {
      "vata": "Neutral",
      "pitta": "Decrease",
      "kapha": "Neutral"
    }
  },
  "tcm": {
    "nature": "Neutral",
    "flavor": ["Sweet"],
    "meridians": ["Spleen", "Stomach"]
  },
  "unani": {
    "temperament": "Cold",
    "quality": "Dry"
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Food item created successfully",
  "data": {
    "_id": "6957f3cb4d754243b83a6573",
    "name": "Quinoa",
    "aliases": ["Kinwa", "Keen-wah"],
    "category": "Grain",
    "modernNutrition": {...},
    "ayurveda": {...},
    "createdAt": "2026-01-06T10:00:00.000Z"
  }
}
```

**Validation**:
- `name` (required): String, must be unique (case-insensitive)
- `category` (required): String
- Duplicate names return 400 error

---

### 2. Get All Foods

**GET** `/api/foods`

Retrieve all food items with optional filtering.

**Authorization**: All authenticated users ✅

**Query Parameters**:
- `category` (optional): Filter by category
- `search` (optional): Search by name or aliases (case-insensitive)

**Examples**:
```
GET /api/foods
GET /api/foods?category=Grain
GET /api/foods?search=rice
GET /api/foods?category=Vegetable&search=green
```

**Response** (200):
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

---

### 3. Get Food Categories

**GET** `/api/foods/categories`

Get list of all unique food categories.

**Authorization**: All authenticated users ✅

**Response** (200):
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

### 4. Get Single Food

**GET** `/api/foods/:id`

Retrieve detailed information about a specific food item.

**Authorization**: All authenticated users ✅

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "6957f3cb4d754243b83a6571",
    "name": "Rice",
    "aliases": ["White Rice", "Basmati"],
    "category": "Grain",
    "modernNutrition": {
      "calories": 130,
      "protein": 2.7,
      "carbs": 28,
      "fat": 0.3,
      "fiber": 0.4
    },
    "ayurveda": {
      "taste": ["Sweet"],
      "energy": "Cooling",
      "doshaEffect": {
        "vata": "Neutral",
        "pitta": "Decrease",
        "kapha": "Increase"
      }
    },
    "tcm": {
      "nature": "Neutral",
      "flavor": ["Sweet"],
      "meridians": ["Spleen", "Stomach"]
    },
    "createdAt": "2026-01-06T08:00:00.000Z",
    "updatedAt": "2026-01-06T08:00:00.000Z"
  }
}
```

**Error** (404):
```json
{
  "success": false,
  "message": "Food not found"
}
```

---

### 5. Update Food Item

**PUT** `/api/foods/:id`

Update an existing food item.

**Authorization**: Admin or Approver only 🔒

**Request Body** (partial updates supported):
```json
{
  "name": "Basmati Rice",
  "modernNutrition": {
    "calories": 130,
    "protein": 2.9,
    "carbs": 28,
    "fat": 0.3,
    "fiber": 0.5
  }
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Food item updated successfully",
  "data": {
    "_id": "6957f3cb4d754243b83a6571",
    "name": "Basmati Rice",
    "modernNutrition": {...},
    // ... updated fields
  }
}
```

**Features**:
- Partial updates: Only send fields you want to change
- Nested objects merge: `modernNutrition` merges with existing data
- Name uniqueness: Checks if new name conflicts with other foods
- Returns updated food item

**Error** (400):
```json
{
  "success": false,
  "message": "Food \"Basmati Rice\" already exists"
}
```

---

### 6. Delete Food Item

**DELETE** `/api/foods/:id`

Delete a food item from the database.

**Authorization**: Admin or Approver only 🔒

**Response** (200):
```json
{
  "success": true,
  "message": "Food item deleted successfully"
}
```

**Protection**: Cannot delete if used in recipes
```json
{
  "success": false,
  "message": "Cannot delete food. It is used in 5 recipe(s)",
  "recipesCount": 5
}
```

**Features**:
- Checks recipe dependencies before deletion
- Prevents accidental data corruption
- Returns recipe count if blocked

---

### 7. Bulk Create Foods

**POST** `/api/foods/bulk`

Create multiple food items in one request.

**Authorization**: Admin or Approver only 🔒

**Request Body**:
```json
{
  "foods": [
    {
      "name": "Black Pepper",
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
      "name": "Cardamom",
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

**Response** (201):
```json
{
  "success": true,
  "message": "2 food items created successfully",
  "count": 2,
  "data": [
    {
      "_id": "6957f3cb4d754243b83a6574",
      "name": "Black Pepper",
      ...
    },
    {
      "_id": "6957f3cb4d754243b83a6575",
      "name": "Cardamom",
      ...
    }
  ]
}
```

**Validation**:
- Each food must have `name` and `category`
- Checks for duplicate names
- All-or-nothing: If one fails, none are created

**Error** (400):
```json
{
  "success": false,
  "message": "Some foods already exist",
  "existingFoods": ["Black Pepper"]
}
```

---

## Data Schema

### Food Object
```javascript
{
  name: String (required),
  aliases: [String],
  category: String (required),
  
  modernNutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    micronutrients: {
      iron: Number,
      calcium: Number,
      vitaminC: Number,
      // ... more micronutrients
    }
  },
  
  ayurveda: {
    taste: [String],  // Sweet, Sour, Salty, Bitter, Pungent, Astringent
    energy: String,   // Heating, Cooling, Neutral
    doshaEffect: {
      vata: String,   // Increase, Decrease, Neutral
      pitta: String,
      kapha: String
    }
  },
  
  tcm: {
    nature: String,     // Hot, Warm, Neutral, Cool, Cold
    flavor: [String],   // Sweet, Sour, Bitter, Pungent, Salty
    meridians: [String] // Lung, Spleen, Stomach, etc.
  },
  
  unani: {
    temperament: String, // Hot, Cold, Wet, Dry
    quality: String      // Light, Heavy, etc.
  }
}
```

---

## Categories

Valid food categories:
- **Grain**: Rice, Wheat, Oats, Quinoa
- **Vegetable**: Carrot, Spinach, Broccoli, Cabbage
- **Fruit**: Apple, Banana, Orange, Mango
- **Dairy**: Milk, Curd, Ghee, Cheese
- **Meat**: Chicken, Fish, Lamb, Beef
- **Legume**: Lentils, Chickpeas, Moong Dal, Kidney Beans
- **Spice**: Turmeric, Cumin, Ginger, Pepper
- **Oil**: Coconut Oil, Olive Oil, Ghee, Sesame Oil
- **Nut**: Almonds, Cashews, Walnuts, Peanuts
- **Beverage**: Water, Tea, Coffee, Juice

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, duplicate name) |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Server Error |

---

## Examples

### Creating a New Spice
```bash
curl -X POST http://localhost:5000/api/foods \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cinnamon",
    "category": "Spice",
    "modernNutrition": {
      "calories": 247,
      "protein": 4,
      "carbs": 81,
      "fat": 1.2,
      "fiber": 53
    },
    "ayurveda": {
      "taste": ["Sweet", "Pungent"],
      "energy": "Heating",
      "doshaEffect": {
        "vata": "Decrease",
        "pitta": "Increase",
        "kapha": "Decrease"
      }
    }
  }'
```

### Searching for Foods
```bash
# Search by name
curl http://localhost:5000/api/foods?search=rice \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by category
curl http://localhost:5000/api/foods?category=Spice \
  -H "Authorization: Bearer YOUR_TOKEN"

# Combined
curl "http://localhost:5000/api/foods?category=Vegetable&search=green" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Updating Nutrition Data
```bash
curl -X PUT http://localhost:5000/api/foods/6957f3cb4d754243b83a6571 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "modernNutrition": {
      "calories": 135,
      "protein": 3.0
    }
  }'
```

---

## Testing

### Automated Test
```bash
# Start server
npm start

# In another terminal
node scripts/testFoodAPIs.js
```

### Manual Test (Postman/Thunder Client)
1. **Login as Admin**
   - POST `/api/auth/login`
   - Email: `smosina003@gmail.com`
   - Password: `Admin@123`
   - Copy token from response

2. **Get All Foods**
   - GET `/api/foods`
   - Header: `Authorization: Bearer <token>`

3. **Create Food**
   - POST `/api/foods`
   - Header: `Authorization: Bearer <admin_token>`
   - Body: Food JSON

4. **Test Access Control**
   - Login as Viewer practitioner
   - Try to create food → Should get 403

---

## Security Features

1. **Role-Based Access Control**
   - View: All authenticated users
   - Create/Update/Delete: Admin and Approver only

2. **Data Integrity**
   - Unique name validation (case-insensitive)
   - Cannot delete foods used in recipes
   - Prevents orphaned recipe ingredients

3. **Audit Logging**
   - All CUD operations logged via `auditLog` middleware
   - Tracks who made changes and when

4. **Verification Required**
   - Only verified practitioners can modify foods
   - Prevents unverified accounts from data manipulation

---

## Integration with Other APIs

### Used By Recipes
```javascript
// Recipe references foods in ingredients
{
  "ingredients": [
    {
      "foodId": "6957f3cb4d754243b83a6571", // References Food._id
      "quantity": 100,
      "unit": "g"
    }
  ]
}
```

### Used By Nutrition Calculator
```javascript
// Fetches food nutrition for calculations
const food = await Food.findById(ingredient.foodId);
const nutrition = food.modernNutrition;
```

---

## Database State

### Current Foods (33 total)

**Grains**: Rice, Wheat Flour, Oats, Jaggery
**Legumes**: Moong Dal
**Vegetables**: Mixed Vegetables, Carrot, Pumpkin, Bottle Gourd, Cabbage, Broccoli, Beans, Spinach, Beetroot, Steamed Vegetables
**Dairy**: Curd, Milk, Ghee
**Spices**: Turmeric, Salt, Cumin, Ginger, Coriander, Mustard Seeds, Pepper
**Oils**: Coconut Oil, Oil
**Nuts**: Coconut (grated), Seeds Mix
**Fruits**: Apple, Lemon Juice
**Beverages**: Water, Vegetable Soup Base

---

## Future Enhancements

- [ ] Food image upload
- [ ] Seasonal availability tracking
- [ ] Price/cost data
- [ ] Serving size recommendations
- [ ] Alternative food suggestions
- [ ] Import from nutrition databases
- [ ] Export to CSV/Excel
- [ ] Batch update operations
- [ ] Food versioning history

---

## Status: ✅ COMPLETE

All Food Management APIs are implemented and tested.

**Total Food APIs**: 7 endpoints
- 3 public (GET operations)
- 4 restricted (Create, Update, Delete, Bulk - Admin/Approver only)
