# 🎯 NutriFusion Onboarding Flow - Implementation Guide

## 📋 Overview

The onboarding flow ensures every new user completes a medical assessment before accessing the dashboard, creating a personalized health profile for tailored nutrition recommendations.

---

## 🔄 User Flow

```
┌─────────────┐
│   REGISTER  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    LOGIN    │
└──────┬──────┘
       │
       ▼
   [CHECK STATUS]
       │
       ├─── hasCompletedAssessment = false ─────┐
       │                                        │
       │                                        ▼
       │                              ┌──────────────────┐
       │                              │   ONBOARDING     │
       │                              │  /onboarding     │
       │                              └────────┬─────────┘
       │                                       │
       │                                       │
       │                              ┌────────▼─────────┐
       │                              │ Welcome Screen   │
       │                              └────────┬─────────┘
       │                                       │
       │                              ┌────────▼─────────┐
       │                              │ Choose Framework │
       │                              │ (Ayurveda/Unani/ │
       │                              │  TCM/Modern)     │
       │                              └────────┬─────────┘
       │                                       │
       │                              ┌────────▼─────────┐
       │                              │ Assessment Form  │
       │                              │ (16-20 questions)│
       │                              └────────┬─────────┘
       │                                       │
       │                              ┌────────▼─────────┐
       │                              │ View Results     │
       │                              │ (Health Profile) │
       │                              └────────┬─────────┘
       │                                       │
       │                              [Mark hasCompletedAssessment = true]
       │                                       │
       ▼                                       ▼
┌──────────────────────────────────────────────┐
│              DASHBOARD                       │
│           /dashboard                         │
└──────────────────────────────────────────────┘
```

---

## 🏗️ Backend Implementation

### 1. **User Model Update**
**File:** `/backend/models/User.js`

```javascript
hasCompletedAssessment: {
  type: Boolean,
  default: false
},
preferredMedicalFramework: {
  type: String,
  enum: ['ayurveda', 'unani', 'tcm', 'modern'],
  default: null
}
```

### 2. **Login Response Enhancement**
**File:** `/backend/routes/auth.js`

```javascript
// Line 186-194
res.status(200).json({
  success: true,
  message: 'Login successful',
  data: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: 'user',
    hasCompletedAssessment: user.hasCompletedAssessment || false,
    preferredMedicalFramework: user.preferredMedicalFramework
  },
  token
});
```

### 3. **Assessment Submission Auto-Update**
**File:** `/backend/routes/assessments.js`

```javascript
// After saving assessment (Line 122-126)
await assessment.save();

// Mark user as having completed assessment
await User.findByIdAndUpdate(userId, {
  hasCompletedAssessment: true,
  preferredMedicalFramework: framework
});
```

---

## 🎨 Frontend Implementation

### 1. **AuthContext Update**
**File:** `/frontend/context/AuthContext.tsx`

```typescript
interface User {
  _id: string
  name?: string
  email: string
  role: 'user' | 'practitioner'
  hasCompletedAssessment?: boolean
  preferredMedicalFramework?: string
}
```

### 2. **Login Redirect Logic**
**File:** `/frontend/app/login/page.tsx`

```typescript
if (userRole === 'practitioner') {
  router.push('/practitioner')
} else {
  // Check if user has completed assessment
  if (!userData?.hasCompletedAssessment) {
    router.push('/onboarding')
  } else {
    router.push('/dashboard')
  }
}
```

### 3. **Register Redirect**
**File:** `/frontend/app/register/page.tsx`

```typescript
if (userRole === 'practitioner') {
  router.push('/practitioner')
} else {
  // New users always go to onboarding
  router.push('/onboarding')
}
```

### 4. **Onboarding Page**
**File:** `/frontend/app/onboarding/page.tsx`

**Features:**
- ✅ 4-step wizard (Welcome → Framework → Assessment → Results)
- ✅ Progress bar with percentage indicator
- ✅ Framework selection with visual cards
- ✅ Dynamic question rendering
- ✅ Assessment results display
- ✅ Auto-redirect to dashboard on completion
- ✅ Protection against re-entry if already completed

---

## 🔐 Route Protection

### Onboarding Page Behavior

```typescript
// Auto-redirect if assessment already completed
if (user?.hasCompletedAssessment) {
  router.push('/dashboard')
  return null
}
```

---

## 📊 Onboarding Steps Breakdown

### **Step 1: Welcome Screen**
- Shows what to expect
- Time estimate: 5-10 minutes
- Number of questions: 16-20
- Benefits listed with checkmarks

### **Step 2: Framework Selection**
Four medical frameworks available:
1. **Ayurveda** 🍃 - Dosha-based holistic nutrition
2. **Unani** ❤️ - Mizaj temperament balancing
3. **Traditional Chinese Medicine (TCM)** ☯️ - Yin/Yang pattern analysis
4. **Modern Evidence-Based** 💡 - Clinical nutrition science

### **Step 3: Assessment Form**
- Dynamic question rendering based on framework
- Progress tracking (Question X of Y)
- Visual indicators for answered questions
- Navigation between questions
- Back button to change framework
- Validation before submission

### **Step 4: Results Display**
- Framework-specific health profile
- Scores and metrics
- Nutrition recommendations
- "Continue to Dashboard" button

---

## 🎯 Key Features

### ✅ Smart Redirects
- New users → Onboarding
- Returning users (completed) → Dashboard
- Already completed → Cannot re-enter onboarding

### ✅ State Management
- `hasCompletedAssessment` flag in database
- `preferredMedicalFramework` stored for future use
- User object updated in AuthContext

### ✅ UX Enhancements
- Visual progress indicators
- Step-by-step guidance
- Clear call-to-actions
- Responsive design
- Loading states
- Error handling

---

## 🧪 Testing the Flow

### Test Case 1: New User Registration
```bash
1. Register new user at /register
2. Expected: Auto-redirect to /onboarding
3. Complete welcome screen
4. Select a framework
5. Answer all questions
6. View results
7. Expected: Button appears to go to dashboard
8. Expected: User.hasCompletedAssessment = true in DB
```

### Test Case 2: Returning User Login
```bash
1. Login with user who completed assessment
2. Expected: Direct redirect to /dashboard
3. Try navigating to /onboarding
4. Expected: Auto-redirect back to /dashboard
```

### Test Case 3: New User Login Before Completing
```bash
1. Register but close browser before finishing onboarding
2. Login again
3. Expected: Redirect to /onboarding
4. Expected: Start from welcome screen
```

---

## 🔧 API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login/user` | POST | Login + get hasCompletedAssessment |
| `/api/auth/register/user` | POST | Create account |
| `/api/assessments/frameworks` | GET | List available frameworks |
| `/api/assessments/questions/:framework` | GET | Get questions for framework |
| `/api/assessments/submit` | POST | Submit responses + mark completed |

---

## 📝 Database Schema Changes

```javascript
// User collection
{
  _id: ObjectId,
  email: String,
  password: String,
  hasCompletedAssessment: Boolean,  // ← NEW
  preferredMedicalFramework: String, // ← NEW
  // ... other fields
}

// Assessment collection (already exists)
{
  userId: ObjectId,
  framework: String,
  responses: Object,
  scores: Object,
  healthProfile: Object,
  nutritionInputs: Object,
  isActive: Boolean,
  completedAt: Date
}
```

---

## 🚀 Deployment Checklist

- [x] Backend: User model updated with new fields
- [x] Backend: Auth routes return assessment status
- [x] Backend: Assessment submission marks user complete
- [x] Frontend: AuthContext includes new user fields
- [x] Frontend: Login redirects based on assessment status
- [x] Frontend: Register redirects to onboarding
- [x] Frontend: Onboarding page created with full flow
- [x] Frontend: Assessment form handles submission
- [ ] Test all flows end-to-end
- [ ] Update environment variables if needed
- [ ] Database migration (if production data exists)

---

## 🎨 UI/UX Highlights

### Design Principles
- **Progressive Disclosure**: One step at a time
- **Visual Feedback**: Progress bars, checkmarks, color coding
- **Error Prevention**: Validation before advancing
- **Flexibility**: Back navigation allowed
- **Clarity**: Clear instructions and expectations

### Color Scheme
- Primary: Green/Blue gradient (health & vitality)
- Success: Green accents
- Progress: Blue indicators
- Neutral: Gray backgrounds

---

## 🔄 Future Enhancements

1. **Retake Assessment**: Allow users to update their health profile
2. **Multiple Frameworks**: Let users try different frameworks
3. **Progress Save**: Save partial responses if user leaves
4. **Email Notifications**: Send assessment summary via email
5. **PDF Export**: Download health profile as PDF
6. **Practitioner Review**: Flag for practitioner validation

---

## 📞 Support

For issues or questions about the onboarding flow:
1. Check backend logs for assessment submission errors
2. Verify JWT token includes user data
3. Ensure MongoDB connection is active
4. Check browser console for frontend errors
5. Validate API responses in Network tab

---

**Status:** ✅ Implementation Complete
**Last Updated:** February 16, 2026
**Version:** 1.0.0
