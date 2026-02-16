# Assessment Module - API Testing Guide

## Quick Start Testing

### 1. Get Available Frameworks

```bash
GET http://localhost:5000/api/assessments/frameworks
```

**Expected Response:**
```json
{
  "success": true,
  "frameworks": [
    {
      "id": "ayurveda",
      "label": "Ayurveda",
      "description": "Ancient Indian system focusing on constitutional balance (Doshas)"
    },
    {
      "id": "unani",
      "label": "Unani",
      "description": "Greco-Arabic medicine focusing on temperament (Mizaj)"
    },
    {
      "id": "tcm",
      "label": "Traditional Chinese Medicine",
      "description": "Chinese system focusing on energy patterns and balance"
    },
    {
      "id": "modern",
      "label": "Modern Clinical Nutrition",
      "description": "Evidence-based nutrition with clinical calculations"
    }
  ]
}
```

### 2. Get Questions for a Framework

```bash
GET http://localhost:5000/api/assessments/questions/ayurveda
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "framework": "ayurveda",
  "questions": {
    "framework": "ayurveda",
    "totalQuestions": 18,
    "categories": { ... },
    "questions": [ ... ]
  }
}
```

### 3. Submit Ayurveda Assessment

```bash
POST http://localhost:5000/api/assessments/submit
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "framework": "ayurveda",
  "responses": {
    "ay_q1": { "text": "Thin, light frame", "dosha": "vata", "weight": 2 },
    "ay_q2": { "text": "Difficulty gaining weight", "dosha": "vata", "weight": 2 },
    "ay_q3": { "text": "Dry, rough skin", "dosha": "vata", "weight": 2 },
    "ay_q4": { "text": "Variable appetite", "dosha": "vata", "weight": 2 },
    "ay_q5": { "text": "Irregular digestion", "dosha": "vata", "weight": 2 },
    "ay_q6": { "text": "Irregular bowel", "dosha": "vata", "weight": 2 },
    "ay_q7": { "text": "Bursts of energy", "dosha": "vata", "weight": 1 },
    "ay_q8": { "text": "Quick bursts of activity", "dosha": "vata", "weight": 1 },
    "ay_q9": { "text": "Feel cold easily", "dosha": "vata", "weight": 1 },
    "ay_q10": { "text": "Quick thinking", "dosha": "vata", "weight": 1 },
    "ay_q11": { "text": "Become anxious", "dosha": "vata", "weight": 1 },
    "ay_q12": { "text": "Enthusiastic", "dosha": "vata", "weight": 1 },
    "ay_q13": { "text": "Light sleeper", "dosha": "vata", "weight": 1 },
    "ay_q14": { "text": "5-7 hours", "dosha": "vata", "weight": 1 },
    "ay_q15": { "text": "Cold, dry weather", "dosha": "vata", "weight": 1 },
    "ay_q16": { "text": "Dry, thin hair", "dosha": "vata", "weight": 2 },
    "ay_q17": { "text": "Fast speech", "dosha": "vata", "weight": 1 },
    "ay_q18": { "text": "Learn quickly", "dosha": "vata", "weight": 1 }
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Assessment completed successfully",
  "assessmentId": "507f1f77bcf86cd799439011",
  "results": {
    "framework": "ayurveda",
    "scores": {
      "primary_dosha": "vata",
      "secondary_dosha": null,
      "vata_percentage": 100,
      "pitta_percentage": 0,
      "kapha_percentage": 0,
      "raw_scores": {
        "vata": 23,
        "pitta": 0,
        "kapha": 0
      },
      "dosha_type": "Vata"
    },
    "healthProfile": { ... },
    "nutritionInputs": { ... }
  }
}
```

### 4. Submit Unani Assessment

```bash
POST http://localhost:5000/api/assessments/submit
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "framework": "unani",
  "responses": {
    "un_q1": { "text": "I feel warm/hot", "heat": 1, "cold": 0, "dry": 0, "moist": 0 },
    "un_q2": { "text": "Cool weather", "heat": 1, "cold": 0, "dry": 0, "moist": 0 },
    "un_q3": { "text": "Very thirsty", "heat": 1, "cold": 0, "dry": 1, "moist": 0 },
    "un_q4": { "text": "Reddish complexion", "heat": 1, "cold": 0, "dry": 0, "moist": 0 },
    "un_q5": { "text": "Dry skin", "heat": 0, "cold": 0, "dry": 1, "moist": 0 },
    "un_q6": { "text": "Sweat profusely", "heat": 1, "cold": 0, "dry": 0, "moist": 1 },
    "un_q7": { "text": "Dry nose/throat", "heat": 1, "cold": 0, "dry": 1, "moist": 0 },
    "un_q8": { "text": "Strong appetite", "heat": 1, "cold": 0, "dry": 1, "moist": 0 },
    "un_q9": { "text": "Fast digestion", "heat": 1, "cold": 0, "dry": 1, "moist": 0 },
    "un_q10": { "text": "Loose stools", "heat": 1, "cold": 0, "dry": 0, "moist": 1 },
    "un_q11": { "text": "Quick-tempered", "heat": 1, "cold": 0, "dry": 1, "moist": 0 },
    "un_q12": { "text": "Agitated", "heat": 1, "cold": 0, "dry": 1, "moist": 0 },
    "un_q13": { "text": "Outgoing", "heat": 1, "cold": 0, "dry": 0, "moist": 1 },
    "un_q14": { "text": "Light sleep", "heat": 1, "cold": 0, "dry": 1, "moist": 0 },
    "un_q15": { "text": "Less than 7 hours", "heat": 1, "cold": 0, "dry": 1, "moist": 0 },
    "un_q16": { "text": "Alert immediately", "heat": 1, "cold": 0, "dry": 0, "moist": 0 }
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "results": {
    "framework": "unani",
    "scores": {
      "mizaj_type": "safravi",
      "thermal_tendency": "hot",
      "thermal_score": 14,
      "moisture_tendency": "dry",
      "moisture_score": 8
    }
  }
}
```

### 5. Submit Modern Clinical Assessment

```bash
POST http://localhost:5000/api/assessments/submit
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "framework": "modern",
  "responses": {
    "age": { "value": 30 },
    "gender": { "value": "male" },
    "height": { "value": 175 },
    "weight": { "value": 75 },
    "activity_level": { "value": "moderately_active" },
    "medical_conditions": { "value": ["none"] },
    "allergies": { "value": ["none"] },
    "dietary_preference": { "value": "balanced" },
    "goals": { "value": ["maintain_weight", "general_health"] },
    "sleep_quality": { "value": "good" },
    "sleep_duration": { "value": "7-8" },
    "stress_level": { "value": "moderate" },
    "hydration": { "value": "6-8" },
    "meal_frequency": { "value": "3" },
    "eating_patterns": { "value": ["none"] },
    "digestion_issues": { "value": ["none"] },
    "supplements": { "value": ["multivitamin"] },
    "physical_limitations": { "value": ["none"] },
    "medications": { "value": ["none"] },
    "typical_day": { "value": "mixed" }
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "results": {
    "framework": "modern",
    "scores": {
      "bmi": 24.5,
      "bmi_category": "normal",
      "bmr": 1720,
      "tdee": 2666,
      "recommended_calories": 2666,
      "macro_split": {
        "protein": { "percent": 25, "grams": 167, "calories": 668 },
        "carbs": { "percent": 45, "grams": 300, "calories": 1200 },
        "fats": { "percent": 30, "grams": 89, "calories": 801 }
      },
      "risk_flags": []
    }
  }
}
```

### 6. Get User Assessment History

```bash
GET http://localhost:5000/api/assessments/user
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

### 7. Get Active Assessment

```bash
GET http://localhost:5000/api/assessments/active/ayurveda
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

### 8. Get Assessment by ID

```bash
GET http://localhost:5000/api/assessments/{assessmentId}
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

### 9. Validate Responses

```bash
POST http://localhost:5000/api/assessments/validate
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "framework": "ayurveda",
  "responses": {
    "ay_q1": { "dosha": "vata", "weight": 2 }
  }
}
```

### 10. Delete Assessment

```bash
DELETE http://localhost:5000/api/assessments/{assessmentId}
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

## Testing Scenarios

### Scenario 1: Complete Ayurveda Flow
1. Get frameworks
2. Get Ayurveda questions
3. Submit all 18 responses
4. Verify dosha calculation
5. Check health profile generation

### Scenario 2: Mixed Dosha Assessment
Submit responses with varied dosha scores:
- 40% Vata, 35% Pitta, 25% Kapha
- Verify secondary dosha is identified

### Scenario 3: Modern Clinical with Health Conditions
Submit assessment with:
- BMI > 30 (obesity)
- Diabetes
- High blood pressure
- Verify risk flags are generated

### Scenario 4: TCM Pattern Analysis
Submit responses indicating:
- Yin deficiency symptoms
- Secondary Qi deficiency
- Verify pattern identification

## Error Testing

### Missing Required Fields
```json
{
  "framework": "ayurveda"
  // Missing responses
}
```
**Expected:** 400 Bad Request

### Invalid Framework
```json
{
  "framework": "invalid_framework",
  "responses": {}
}
```
**Expected:** 400 Bad Request

### Incomplete Responses
```json
{
  "framework": "ayurveda",
  "responses": {
    "ay_q1": { "dosha": "vata", "weight": 2 }
    // Only 1 of 18 questions
  }
}
```
**Expected:** 400 Bad Request with validation errors

### Unauthorized Access
```bash
GET /api/assessments/questions/ayurveda
# No Authorization header
```
**Expected:** 401 Unauthorized

## Performance Testing

### Load Test
- Submit 100 concurrent assessments
- Verify response times < 2 seconds
- Check database connection pool

### Stress Test
- Submit assessments with maximum response sizes
- Verify system handles large payloads
- Check memory usage

## Integration Testing

1. Register new user
2. Login and get token
3. Complete assessment
4. Verify assessment appears in user profile
5. Verify assessment influences diet recommendations
6. Submit new assessment and verify previous is deactivated

---

**Happy Testing! 🧪**
