# NutriFusion - Multi-Medical Assessment Module

## 🎯 Overview

The Multi-Medical Assessment Module is a comprehensive, modular system that supports four distinct medical frameworks for personalized nutrition assessment:

- **Ayurveda** - Ancient Indian constitutional medicine
- **Unani** - Greco-Arabic temperament-based medicine
- **Traditional Chinese Medicine (TCM)** - Chinese pattern-based medicine
- **Modern Clinical Nutrition** - Evidence-based clinical assessment

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────┐
│         Framework Selection Layer          │
├─────────────────────────────────────────────┤
│         Dynamic Question Loader            │
├─────────────────────────────────────────────┤
│      Framework-Specific Scoring Engine     │
├─────────────────────────────────────────────┤
│           Profile Generator                │
├─────────────────────────────────────────────┤
│      Nutrition Recommendation Input        │
└─────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Node.js + Express
- MongoDB (Mongoose)
- Modular assessment engines
- RESTful API

**Frontend:**
- Next.js 14+ (App Router)
- React + TypeScript
- Tailwind CSS
- shadcn/ui components

## 📁 Project Structure

```
backend/
├── models/
│   └── Assessment.js                 # Assessment data model
├── services/
│   └── assessment/
│       ├── index.js                  # Assessment engine factory
│       ├── ayurveda.js              # Ayurveda scoring engine
│       ├── unani.js                 # Unani scoring engine
│       ├── tcm.js                   # TCM scoring engine
│       ├── modern.js                # Modern clinical engine
│       └── questionBanks.js         # Question databases
└── routes/
    └── assessments.js               # API endpoints

frontend/
├── app/
│   └── assessment/
│       └── page.tsx                 # Main assessment page
├── components/
│   └── assessment/
│       ├── FrameworkSelection.tsx   # Framework chooser
│       ├── AssessmentForm.tsx       # Question interface
│       └── AssessmentResults.tsx    # Results display
└── lib/
    └── api.ts                       # API integration
```

## 🌿 Framework Details

### 1. Ayurveda Module

**Purpose:** Identify Prakriti (constitution) through dosha analysis

**Questions:** 18 questions across 5 weighted categories
- Body Structure (weight: 2)
- Digestion & Metabolism (weight: 2)
- Energy Pattern (weight: 1)
- Emotional Traits (weight: 1)
- Sleep & Climate (weight: 1)

**Answer Format:**
```javascript
{
  option_text: "Thin, light frame",
  dosha: "vata" | "pitta" | "kapha",
  weight: 2
}
```

**Scoring Logic:**
```javascript
dosha_score += weight
```

**Output:**
```javascript
{
  primary_dosha: "vata",
  secondary_dosha: "pitta",
  vata_percentage: 45,
  pitta_percentage: 35,
  kapha_percentage: 20
}
```

### 2. Unani Module

**Purpose:** Identify Mizaj (temperament)

**Questions:** 16 questions across 5 categories
- Thermal Tendency
- Moisture Tendency
- Digestive Strength
- Emotional Nature
- Sleep Pattern

**Answer Format:**
```javascript
{
  heat: 1 or 0,
  cold: 1 or 0,
  dry: 1 or 0,
  moist: 1 or 0
}
```

**Mizaj Types:**
- Damvi (Hot + Moist)
- Safravi (Hot + Dry)
- Balghami (Cold + Moist)
- Saudavi (Cold + Dry)

**Classification Logic:**
```
IF heat > cold AND moist > dry → Damvi
IF heat > cold AND dry > moist → Safravi
IF cold > heat AND moist > dry → Balghami
IF cold > heat AND dry > moist → Saudavi
```

**Output:**
```javascript
{
  mizaj_type: "damvi",
  heat_score: 12,
  moisture_score: 8
}
```

### 3. Traditional Chinese Medicine (TCM)

**Purpose:** Identify dominant pattern imbalances

**Questions:** 18 questions across 5 categories
- Temperature Sensitivity
- Fluid Retention / Dryness
- Energy & Fatigue
- Emotional Pattern
- Digestive Pattern

**Patterns:**
- Yin Deficiency
- Yang Deficiency
- Heat Excess
- Damp Accumulation
- Qi Deficiency

**Answer Format:**
```javascript
{
  yin: 0-2,
  yang: 0-2,
  damp: 0-2,
  heat: 0-2,
  qi_deficiency: 0-2
}
```

**Output:**
```javascript
{
  dominant_pattern: "yin_deficiency",
  secondary_pattern: "qi_deficiency"
}
```

### 4. Modern Clinical Nutrition

**Purpose:** Generate evidence-based nutrition profile

**Questions:** 20 questions covering:
- Demographics (age, gender)
- Anthropometric (height, weight)
- Activity Level
- Medical Conditions
- Food Allergies
- Sleep Quality
- Stress Level
- Dietary Preferences

**Calculations:**
- **BMI:** weight / (height²)
- **BMR:** Mifflin-St Jeor Equation
- **TDEE:** BMR × Activity Multiplier
- **Macronutrient Distribution:** Based on goals & conditions

**Output:**
```javascript
{
  bmi: 23.5,
  bmr: 1650,
  tdee: 2310,
  recommended_calories: 1960,
  macro_split: {
    protein: { percent: 25, grams: 122 },
    carbs: { percent: 45, grams: 220 },
    fats: { percent: 30, grams: 65 }
  },
  risk_flags: []
}
```

## 🔌 API Endpoints

### Framework Information

```http
GET /api/assessments/frameworks
```
Returns list of available frameworks

### Questions

```http
GET /api/assessments/questions/:framework
```
Get questions for specific framework

**Parameters:**
- `framework`: ayurveda | unani | tcm | modern

### Submit Assessment

```http
POST /api/assessments/submit
```

**Body:**
```json
{
  "framework": "ayurveda",
  "responses": {
    "ay_q1": { "dosha": "vata", "weight": 2 },
    "ay_q2": { "dosha": "pitta", "weight": 2 }
  }
}
```

**Response:**
```json
{
  "success": true,
  "assessmentId": "...",
  "results": {
    "framework": "ayurveda",
    "scores": { ... },
    "healthProfile": { ... },
    "nutritionInputs": { ... }
  }
}
```

### User Assessments

```http
GET /api/assessments/user/:userId?
```
Get assessment history

```http
GET /api/assessments/active/:framework?
```
Get active assessment

```http
GET /api/assessments/:assessmentId
```
Get specific assessment

```http
DELETE /api/assessments/:assessmentId
```
Delete assessment

### Validation

```http
POST /api/assessments/validate
```
Validate responses before submission

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### API Testing with Postman

1. Import collection from `backend/NutriFusion_API_Collection.postman_collection.json`
2. Test assessment endpoints sequentially:
   - Get frameworks
   - Get questions
   - Submit assessment
   - Retrieve results

### Frontend Testing

```bash
cd frontend
npm run dev
```

Navigate to: `http://localhost:3000/assessment`

## 🔒 Validation Rules

### Question Validation

- All questions marked as `required: true` must be answered
- Numeric inputs must be within specified ranges
- Single-select questions require one selection
- Multi-select allows multiple selections

### Response Validation

```javascript
// Example validation for Ayurveda
{
  dosha: 'vata' | 'pitta' | 'kapha',  // Required
  weight: number,                      // Required, > 0
}

// Example validation for Modern
{
  value: number | string | array,     // Required
  validation: {
    min: 100,
    max: 250
  }
}
```

### Data Integrity

- Previous assessments auto-deactivated when new one submitted
- Only one active assessment per framework per user
- Normalized scores prevent data inconsistencies
- Tie-breaking logic for equal scores

## 📊 Data Models

### Assessment Schema

```javascript
{
  userId: ObjectId,
  framework: String,
  responses: Map,
  scores: Object,
  healthProfile: Object,
  nutritionInputs: Object,
  completedAt: Date,
  isActive: Boolean,
  timestamps: true
}
```

### Indexes
- `userId + framework`
- `isActive`

## 🎨 UI Components

### FrameworkSelection
- Displays 4 framework cards
- Visual indicators (icons, colors)
- Selection state management
- Responsive grid layout

### AssessmentForm
- Progress tracking
- Question-by-question navigation
- Dynamic input types
- Answer validation
- Auto-save responses

### AssessmentResults
- Framework-specific result display
- Visual data presentation
- Actionable recommendations
- Download/share options

## 🚀 Deployment

### Environment Variables

```env
# Backend
MONGODB_URI=mongodb://localhost:27017/nutrifusion
PORT=5000
JWT_SECRET=your_secret_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Build Commands

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run build
npm start
```

## 🔐 Security Considerations

- **Authentication Required:** All assessment endpoints require valid JWT
- **Authorization:** Users can only access their own assessments
- **Input Validation:** Server-side validation on all submissions
- **Data Privacy:** Health data encrypted at rest
- **CORS Protection:** Configured for specific origins only

## 🧩 Extension Points

### Adding New Frameworks

1. Create engine in `backend/services/assessment/{framework}.js`
2. Add questions to `questionBanks.js`
3. Update framework list in factory
4. Create frontend result component
5. Update API documentation

### Custom Scoring Logic

Each engine is independent and can implement custom:
- Scoring algorithms
- Validation rules
- Output formats
- Recommendation logic

## 📈 Future Enhancements

- [ ] Multi-language support
- [ ] Voice-guided assessments
- [ ] PDF report generation
- [ ] Practitioner collaboration tools
- [ ] Progress tracking over time
- [ ] AI-enhanced recommendations
- [ ] Genetic data integration
- [ ] Wearable device sync

## 🤝 Contributing

1. Follow existing patterns for consistency
2. Add tests for new features
3. Update documentation
4. Ensure backward compatibility
5. Follow naming conventions

## 📝 License

Copyright © 2024 NutriFusion. All rights reserved.

## 📧 Support

For issues or questions:
- GitHub Issues: [Create Issue]
- Email: support@nutrifusion.com
- Documentation: [Wiki]

---

**Built with ❤️ for personalized nutrition**
