# 🧪 NutriFusion API Testing Guide

## 📋 Complete API List - Layer 1

### Base URL
```
http://localhost:5000
```

---

## 🔐 **1. AUTHENTICATION APIs**

### 1.1 Register User
**POST** `/api/auth/register/user`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please complete your profile.",
  "data": {
    "_id": "user_id_here",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

> **Note:** After registration, use PUT `/api/users/me` to complete your profile with name, age, gender, height, weight, etc.

---

### 1.2 Register Practitioner
**POST** `/api/auth/register/practitioner`

**Body:**
```json
{
  "email": "ayush@clinic.com",
  "password": "practitioner123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Practitioner registered successfully. Please complete your profile.",
  "data": {
    "_id": "practitioner_id",
    "email": "ayush@clinic.com",
    "verified": false,
    "authorityLevel": "Viewer",
    "role": "practitioner"
  },
  "token": "jwt_token_here"
}
```

> **Note:** After registration, use PUT `/api/practitioners/me` to complete your profile with name, type, specialization, and license number.

---

### 1.3 Login (User or Practitioner)
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "user_id",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

> **⚠️ IMPORTANT:** Copy the `token` from login response and use it in Authorization header for all protected routes.

---

## 👤 **2. USER APIs**

**All routes require:** `Authorization: Bearer <token>`

### 2.1 Get My Profile
**GET** `/api/users/me`

**Headers:**
```
Authorization: Bearer <userToken>
```

---

### 2.2 Update My Profile
**PUT** `/api/users/me`

**Body:**
```json
{
  "name": "John Doe",
  "age": 30,
  "gender": "Male",
  "height": 175,
  "weight": 72,
  "dietaryPreference": "Vegetarian",
  "allergies": ["Peanuts", "Shellfish"],
  "medicinePreference": ["Ayurveda", "Modern"],
  "consent": {
    "traditionalMedicine": true,
    "modernMedicine": true,
    "dataUsage": true
  }
}
```

> **Use this endpoint to complete your profile after registration.**

---

### 2.3 Update Prakriti (Self-Assessment)
**PUT** `/api/users/me/prakriti`

**Body:**
```json
{
  "vata": 35,
  "pitta": 45,
  "kapha": 20,
  "source": "Questionnaire"
}
```

---

### 2.4 Update Mizaj
**PUT** `/api/users/me/mizaj`

**Body:**
```json
{
  "heat": "Hot",
  "moisture": "Dry"
}
```

---

### 2.5 Get Verified Practitioners
**GET** `/api/users/practitioners/verified`

Returns list of verified practitioners that users can choose from.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "practitioner_id_1",
      "name": "Dr. Ayush Kumar",
      "email": "ayush@clinic.com",
      "type": "Ayurvedic",
      "specialization": ["Panchakarma", "Diet Therapy"]
    }
  ]
}
```

---

### 2.6 Assign Practitioner
**PUT** `/api/users/me/practitioner`

**Body:**
```json
{
  "practitionerId": "practitioner_id_here"
}
```

User chooses and assigns a verified practitioner to manage their health.

---

### 2.7 Remove Practitioner
**DELETE** `/api/users/me/practitioner`

Remove currently assigned practitioner.

---

## 👨‍⚕️ **3. PRACTITIONER APIs**

### 3.1 Get All Practitioners (Admin)
**GET** `/api/practitioners?verified=false&type=Ayurvedic`

**Headers:**
```
Authorization: Bearer <practitionerToken>
```

---

### 3.2 Get My Practitioner Profile
**GET** `/api/practitioners/me`

---

### 3.3 Update My Practitioner Profile
**PUT** `/api/practitioners/me`

**Headers:**
```
Authorization: Bearer <practitionerToken>
```

**Body:**
```json
{
  "name": "Dr. Ayush Kumar",
  "type": "Ayurvedic",
  "specialization": ["Panchakarma", "Diet Therapy", "Herbal Medicine"],
  "licenseNumber": "AYU2024001"
}
```

> **Use this endpoint to complete your practitioner profile after registration.**

**Practitioner Types:**
- Ayurvedic
- Unani
- Siddha
- TCM
- Modern
- Nutritionist

---

### 3.4 Verify Practitioner (Admin Only)
**PATCH** `/api/practitioners/:id/verify`

**Body:**
```json
{
  "verified": true
}
```

---

### 3.4 Set Authority Level (Admin Only)
**PATCH** `/api/practitioners/:id/authority`

**Body:**
```json
{
  "authorityLevel": "Approver"
}
```

**Authority Levels:**
- `Viewer` - Can only view
- `Editor` - Can create and edit
- `Approver` - Can approve diet plans

---

### 3.5 Get Assigned Users
**GET** `/api/practitioners/me/users`

Returns all users assigned to this practitioner.

---

### 3.6 Get User Health Profile (Practitioner)
**GET** `/api/practitioners/users/:userId/profile`

View complete health profile of assigned user.

---

### 3.7 Confirm User Prakriti (Practitioner)
**PUT** `/api/practitioners/me/users/:userId/prakriti`

**Body:**
```json
{
  "vata": 30,
  "pitta": 50,
  "kapha": 20
}
```

This changes prakriti status from "Estimated" → "Confirmed"

> **Note:** Requires Editor or Approver authority level.

---

## 🏥 **4. HEALTH PROFILE APIs**

### 4.1 Create Health Profile
**POST** `/api/health-profiles`

**Headers:**
```
Authorization: Bearer <userToken>
```

**Body:**
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

---

### 4.2 Get My Health Profiles
**GET** `/api/health-profiles/me`

Returns all health profile records for logged-in user.

---

### 4.3 Get Latest Health Profile
**GET** `/api/health-profiles/me/latest`

Returns most recent health profile.

---

### 4.4 Update Health Profile
**PUT** `/api/health-profiles/:id`

**Body:**
```json
{
  "lifestyle": {
    "activityLevel": "Active",
    "sleepHours": 8,
    "stressLevel": "Low"
  }
}
```

---

### 4.5 Delete Health Profile
**DELETE** `/api/health-profiles/:id`

---

### 4.6 Get Health Profile by User (Practitioner)
**GET** `/api/health-profiles/user/:userId`

Practitioner can view user's health profiles.

---

## 🍽️ **5. DIET PLAN APIs**

### 5.1 Create Diet Plan (Practitioner - Editor/Approver)
**POST** `/api/diet-plans`

**Headers:**
```
Authorization: Bearer <practitionerToken>
```

**Body (Option 1 - Empty meals for testing):**
```json
{
  "userId": "user_id_here",
  "planName": "Week 1 - Pitta Balancing",
  "meals": [],
  "validFrom": "2026-01-02",
  "validTo": "2026-01-09"
}
```

**Body (Option 2 - With actual recipe IDs):**
```json
{
  "userId": "user_id_here",
  "planName": "Week 1 - Pitta Balancing",
  "meals": [
    {
      "mealType": "Breakfast",
      "recipeId": "actual_recipe_id_from_database",
      "portion": 1,
      "scheduledTime": "08:00"
    },
    {
      "mealType": "Lunch",
      "recipeId": "actual_recipe_id_from_database",
      "portion": 1.5,
      "scheduledTime": "13:00"
    },
    {
      "mealType": "Dinner",
      "recipeId": "actual_recipe_id_from_database",
      "portion": 1,
      "scheduledTime": "19:00"
    }
  ],
  "validFrom": "2026-01-02",
  "validTo": "2026-01-09"
}
```

> **Note:** Use actual recipe IDs from your database, not placeholder text. Recipes will be created in Layer 2.

**Meal Types:**
- Breakfast, Lunch, Dinner, Snack, Pre-Workout, Post-Workout

---

### 5.2 Get My Diet Plans (User)
**GET** `/api/diet-plans/me`

---

### 5.3 Get Active Diet Plan (User)
**GET** `/api/diet-plans/me/active`

Returns currently active diet plan (status = "Active")

---

### 5.4 Get Diet Plan by ID
**GET** `/api/diet-plans/:id`

---

### 5.5 Update Diet Plan (Practitioner - Editor/Approver)
**PUT** `/api/diet-plans/:id`

**Body (Option 1 - Update plan name only):**
```json
{
  "planName": "Week 1 - Updated"
}
```

**Body (Option 2 - Update with meals - requires actual recipe IDs):**
```json
{
  "planName": "Week 1 - Updated",
  "meals": [
    {
      "mealType": "Breakfast",
      "recipeId": "actual_recipe_id_from_database",
      "portion": 1.5
    }
  ]
}
```

> **Note:** To update meals, use actual recipe IDs from database, not placeholders. Or update plan name/dates without touching meals.

---

### 5.6 Approve Diet Plan (Practitioner - Approver Only)
**PUT** `/api/diet-plans/:id/approve`

Changes status from "Draft" → "Active"

**Response:**
```json
{
  "success": true,
  "message": "Diet plan approved successfully",
  "data": {
    "_id": "plan_id",
    "status": "Active",
    "approvedBy": "practitioner_id",
    "approvedAt": "2026-01-02T10:30:00.000Z"
  }
}
```

---

### 5.7 Archive Diet Plan (Practitioner)
**DELETE** `/api/diet-plans/:id`

Changes status to "Archived" (does not delete, just archives)

---

### 5.8 Get Diet Plans by User (Practitioner)
**GET** `/api/diet-plans/user/:userId`

View all diet plans for specific user.

---

### 5.9 Get Diet Plans Created by Me (Practitioner)
**GET** `/api/diet-plans/practitioner/me`

View all diet plans created by logged-in practitioner.

> **Note:** This route may not be implemented yet.

---

## 📊 **Summary of APIs Built**

| Module | Total APIs | Key Features |
|--------|-----------|--------------|
| **Authentication** | 3 | Register User/Practitioner (email+password only), Login |
| **Users** | 7 | Profile CRUD, Prakriti, Mizaj updates, Practitioner assignment |
| **Practitioners** | 8 | CRUD, Profile Update, Verification, Authority, User Management |
| **Health Profiles** | 6 | CRUD, User/Practitioner views |
| **Diet Plans** | 9 | CRUD, Approval workflow, Archive |
| **TOTAL** | **33 APIs** | ✅ |

---

## 🧪 **How to Test in Postman**

### Method 1: Import Collection (Easiest)
1. Open Postman
2. Click **Import**
3. Select `NutriFusion_API_Collection.postman_collection.json`
4. All APIs will be loaded with sample requests

### Method 2: Manual Testing

#### Step 1: Register a User
```
POST http://localhost:5000/api/auth/register/user
```
Copy the `token` from response.

#### Step 2: Set Authorization Header
For all protected routes, add header:
```
Authorization: Bearer <paste_token_here>
```

#### Step 3: Test User APIs
```
GET http://localhost:5000/api/users/me
```

#### Step 4: Register a Practitioner
```
POST http://localhost:5000/api/auth/register/practitioner
```
Copy practitioner token.

#### Step 5: Create Health Profile
```
POST http://localhost:5000/api/health-profiles
Authorization: Bearer <user_token>
```

#### Step 6: Test Practitioner APIs
```
GET http://localhost:5000/api/practitioners/me
Authorization: Bearer <practitioner_token>
```

---

## 🔑 **Testing RBAC (Role-Based Access Control)**

### Test 1: User tries to access practitioner route
```
GET http://localhost:5000/api/practitioners/me
Authorization: Bearer <user_token>
```
**Expected:** ❌ 403 Forbidden

### Test 2: Viewer tries to create diet plan
```
POST http://localhost:5000/api/diet-plans
Authorization: Bearer <viewer_practitioner_token>
```
**Expected:** ❌ 403 Forbidden (requires Editor/Approver)

### Test 3: Editor tries to approve diet plan
```
PATCH http://localhost:5000/api/diet-plans/:id/approve
Authorization: Bearer <editor_token>
```
**Expected:** ❌ 403 Forbidden (requires Approver)

---

## 🔍 **Audit Logs**

Every action is logged in the `auditlogs` collection:
- CREATE operations
- UPDATE operations
- APPROVE operations
- ARCHIVE operations

You can query MongoDB to see logs:
```javascript
db.auditlogs.find().sort({ timestamp: -1 }).limit(10)
```

---

## ✅ **What's Working Now**

- ✅ JWT Authentication
- ✅ Role-Based Access Control (User, Practitioner, Admin)
- ✅ Authority Levels (Viewer, Editor, Approver)
- ✅ Practitioner Verification Workflow
- ✅ User → Health Profile Linking
- ✅ Manual Diet Plan Creation
- ✅ Diet Plan Approval Workflow
- ✅ Audit Logging on all mutations
- ✅ Prakriti Confirmation by Practitioner

---

## 🚀 **Next Layer (Layer 2)**

After testing Layer 1, we'll build:
- 🔹 Recipe Management APIs
- 🔹 Food Database APIs
- 🔹 Nutrient Calculator
- 🔹 Dosha Balance Calculator
- 🔹 Rule Engine for Traditional Medicine Logic
