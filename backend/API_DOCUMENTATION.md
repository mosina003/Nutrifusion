# NutriFusion API Documentation - Layer 1

## 🔐 Authentication & Authorization

### Roles
1. **User** - End users who receive diet plans
2. **Practitioner** - Healthcare professionals who create/manage diet plans
   - **Viewer** - Can view user data and diet plans
   - **Editor** - Can create and edit diet plans
   - **Approver** - Can approve diet plans (highest authority)

### Token Format
All authenticated requests require Bearer token:
```
Authorization: Bearer <jwt_token>
```

---

## 📍 API Endpoints

### **Authentication Routes** (`/api/auth`)

#### 1. Register User
```http
POST /api/auth/register/user
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 30,
  "gender": "Male",
  "height": 175,
  "weight": 70,
  "dietaryPreference": "Vegetarian",
  "allergies": ["Peanuts"],
  "chronicConditions": []
}
```

#### 2. Register Practitioner
```http
POST /api/auth/register/practitioner
```
**Body:**
```json
{
  "name": "Dr. Smith",
  "email": "dr.smith@example.com",
  "password": "password123",
  "type": "Ayurvedic",
  "specialization": ["Panchakarma", "Nutrition"],
  "licenseNumber": "AYU12345"
}
```

#### 3. Login User
```http
POST /api/auth/login/user
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### 4. Login Practitioner
```http
POST /api/auth/login/practitioner
```
**Body:**
```json
{
  "email": "dr.smith@example.com",
  "password": "password123"
}
```

#### 5. Get Current User/Practitioner
```http
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

---

### **User Routes** (`/api/users`)

#### 1. Get My Profile
```http
GET /api/users/me
Headers: Authorization: Bearer <user_token>
```

#### 2. Update My Profile
```http
PUT /api/users/me
Headers: Authorization: Bearer <user_token>
```
**Body:**
```json
{
  "age": 31,
  "weight": 72,
  "allergies": ["Peanuts", "Shellfish"],
  "medicinePreference": ["Ayurveda", "Modern"]
}
```

#### 3. Submit Prakriti Assessment (Self)
```http
POST /api/users/me/prakriti
Headers: Authorization: Bearer <user_token>
```
**Body:**
```json
{
  "vata": 40,
  "pitta": 35,
  "kapha": 25
}
```

#### 4. Get User by ID (Practitioner Only)
```http
GET /api/users/:userId
Headers: Authorization: Bearer <practitioner_token>
```

---

### **Health Profile Routes** (`/api/health-profiles`)

#### 1. Create Health Profile
```http
POST /api/health-profiles
Headers: Authorization: Bearer <token>
```
**Body (User creates own):**
```json
{
  "lifestyle": {
    "activityLevel": "Moderate",
    "sleepHours": 7,
    "stressLevel": "Medium"
  },
  "digestionIndicators": {
    "appetite": "Normal",
    "bowelRegularity": "Regular",
    "bloating": false,
    "acidReflux": false
  }
}
```

**Body (Practitioner creates for user):**
```json
{
  "userId": "user_id_here",
  "bmi": 23.5,
  "chronicConditions": ["condition_id_1"],
  "lifestyle": {...},
  "digestionIndicators": {...}
}
```

#### 2. Get My Health Profiles
```http
GET /api/health-profiles/me
Headers: Authorization: Bearer <user_token>
```

#### 3. Get Latest Health Profile
```http
GET /api/health-profiles/me/latest
Headers: Authorization: Bearer <user_token>
```

#### 4. Get User's Health Profiles (Practitioner)
```http
GET /api/health-profiles/user/:userId
Headers: Authorization: Bearer <practitioner_token>
```

#### 5. Update Health Profile
```http
PUT /api/health-profiles/:id
Headers: Authorization: Bearer <token>
```

---

### **Practitioner Routes** (`/api/practitioners`)

#### 1. Get All Practitioners
```http
GET /api/practitioners?verified=true&type=Ayurvedic
Headers: Authorization: Bearer <token>
```

#### 2. Verify Practitioner (Admin)
```http
PUT /api/practitioners/:id/verify
Headers: Authorization: Bearer <admin_token>
```

#### 3. Update Authority Level (Admin)
```http
PUT /api/practitioners/:id/authority
Headers: Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "authorityLevel": "Approver"
}
```

#### 4. Get My Assigned Users
```http
GET /api/practitioners/me/users
Headers: Authorization: Bearer <practitioner_token>
```

#### 5. Get Health Profiles of My Users
```http
GET /api/practitioners/me/health-profiles?userId=user_id
Headers: Authorization: Bearer <practitioner_token>
```

#### 6. Confirm User's Prakriti (Editor+)
```http
PUT /api/practitioners/me/users/:userId/prakriti
Headers: Authorization: Bearer <practitioner_token>
```
**Body:**
```json
{
  "vata": 45,
  "pitta": 30,
  "kapha": 25
}
```
**Note:** Requires **Editor** or **Approver** authority

---

### **Recipe Routes** (`/api/recipes`)

#### 1. Create Recipe
```http
POST /api/recipes
Headers: Authorization: Bearer <token>
```
**Body:**
```json
{
  "name": "Khichdi",
  "description": "Traditional Ayurvedic comfort food",
  "ingredients": [
    {
      "foodId": "rice_food_id",
      "quantity": 100,
      "unit": "g"
    },
    {
      "foodId": "moong_dal_food_id",
      "quantity": 50,
      "unit": "g"
    }
  ],
  "cookingMethod": {
    "type": "Boiled",
    "description": "Cook rice and dal together until soft",
    "duration": 30
  },
  "tags": ["Ayurvedic", "Easy Digestion", "Vegetarian"],
  "difficulty": "Easy",
  "prepTime": 10,
  "cookTime": 30,
  "servings": 2,
  "isPublic": true
}
```

#### 2. Get All Recipes
```http
GET /api/recipes?isPublic=true&tags=Ayurvedic&difficulty=Easy
Headers: Authorization: Bearer <token>
```

#### 3. Get Single Recipe
```http
GET /api/recipes/:id
Headers: Authorization: Bearer <token>
```

#### 4. Update Recipe
```http
PUT /api/recipes/:id
Headers: Authorization: Bearer <token>
```

#### 5. Delete Recipe
```http
DELETE /api/recipes/:id
Headers: Authorization: Bearer <token>
```

---

### **Diet Plan Routes** (`/api/diet-plans`)

#### 1. Create Diet Plan (Editor/Approver)
```http
POST /api/diet-plans
Headers: Authorization: Bearer <practitioner_token>
```
**Body:**
```json
{
  "userId": "user_id_here",
  "planName": "7-Day Vata Balancing Plan",
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
      "portion": 1.5,
      "scheduledTime": "13:00"
    },
    {
      "mealType": "Dinner",
      "recipeId": "recipe_id_3",
      "portion": 1,
      "scheduledTime": "19:00"
    }
  ],
  "rulesApplied": [
    "Avoid cold foods for Vata",
    "Warm, cooked meals preferred"
  ],
  "validFrom": "2026-01-01",
  "validTo": "2026-01-07",
  "status": "Draft"
}
```

**Response includes:**
- Auto-calculated `nutrientSnapshot` (calories, protein, carbs, fat, fiber)
- Auto-calculated `doshaBalance` (vata, pitta, kapha scores)

#### 2. Get All Diet Plans
```http
GET /api/diet-plans?userId=user_id&status=Active
Headers: Authorization: Bearer <token>
```

#### 3. Get Single Diet Plan
```http
GET /api/diet-plans/:id
Headers: Authorization: Bearer <token>
```

#### 4. Update Diet Plan (Editor/Approver)
```http
PUT /api/diet-plans/:id
Headers: Authorization: Bearer <practitioner_token>
```

#### 5. Approve Diet Plan (Approver Only)
```http
PUT /api/diet-plans/:id/approve
Headers: Authorization: Bearer <practitioner_token>
```
**Note:** Requires **Approver** authority level

#### 6. Archive Diet Plan
```http
DELETE /api/diet-plans/:id
Headers: Authorization: Bearer <practitioner_token>
```

#### 7. Get Active Diet Plan for User
```http
GET /api/diet-plans/user/:userId/active
Headers: Authorization: Bearer <token>
```

---

## 🔒 Authorization Matrix

| Endpoint | User | Viewer | Editor | Approver |
|----------|------|--------|--------|----------|
| Register/Login | ✅ | ✅ | ✅ | ✅ |
| View own profile | ✅ | N/A | N/A | N/A |
| Submit self Prakriti | ✅ | N/A | N/A | N/A |
| View user profiles | ❌ | ✅ | ✅ | ✅ |
| Confirm Prakriti | ❌ | ❌ | ✅ | ✅ |
| Create diet plan | ❌ | ❌ | ✅ | ✅ |
| Edit diet plan | ❌ | ❌ | ✅ | ✅ |
| Approve diet plan | ❌ | ❌ | ❌ | ✅ |
| Create recipe | ✅ | ✅ | ✅ | ✅ |

---

## 📊 Audit Logging

All CREATE, UPDATE, APPROVE, DELETE operations are automatically logged in the `auditlogs` collection with:
- Entity type and ID
- Action performed
- User who performed it
- Timestamp
- IP address and user agent

---

## 🚀 Getting Started

1. **Start server:**
```bash
npm run dev
```

2. **Test endpoints:** Use Postman or any API client

3. **Sample workflow:**
   1. Register practitioner → Wait for admin verification
   2. Register user → Login
   3. User submits Prakriti assessment
   4. Practitioner confirms Prakriti
   5. Create health profile
   6. Create recipes
   7. Create diet plan
   8. Approver approves diet plan
   9. User views active diet plan

---

## ✅ Layer 1 Complete!

All foundational APIs for authentication, RBAC, user management, practitioner workflows, and manual diet plan creation are now implemented.
