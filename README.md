# 🥗 NutriFusion - Personalized Nutrition Platform

**Integrating Ancient Wisdom (Ayurveda, Unani, TCM) with Modern Nutritional Science**

A comprehensive nutrition management platform that combines traditional healing systems with evidence-based nutrition to deliver personalized diet plans.

---

## 🌟 Features

### For Practitioners
- **Patient Management** - Manage multiple patients with detailed health profiles
- **Custom Diet Plans** - Create personalized diet plans based on health conditions
- **Recipe Database** - Access 15+ pre-loaded recipes with complete nutrition data
- **Auto-Calculated Nutrition** - Automatic nutrition calculation from ingredients
- **Multi-System Integration** - Combine Ayurveda, Unani, TCM, and modern nutrition
- **Approval Workflow** - Editor → Approver → Active diet plan workflow

### For Patients/Users
- **Health Profile** - Track medical conditions, allergies, and dietary preferences
- **Personalized Plans** - Receive customized diet plans from practitioners
- **Recipe Access** - Browse recipes suitable for your health needs
- **Progress Tracking** - Monitor diet plan adherence and health outcomes

### For Admins
- **User Management** - Manage practitioners and patients
- **Food Database** - Complete CRUD for 33+ food items with nutrition data
- **Role-Based Access** - Admin, Approver, Editor, Viewer authority levels
- **Audit Logging** - Track all system modifications

---

## 🏗️ Architecture

### Backend (Layer 1 & 2 Complete)
- **Node.js** + **Express.js** - REST API framework
- **MongoDB Atlas** - Cloud database
- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control** - 4 authority levels

### Current Status
✅ **49 REST APIs** built and tested
- Layer 1: 33 APIs (Auth, Users, Practitioners, Health Profiles, Diet Plans)
- Layer 2: 12 APIs (Food Management, Recipe Management)
- Layer 3: 4 APIs (Intelligent Recommendations - Foods, Recipes, Meals, Daily Plans)

### Frontend (Layer 4 - Planned)
- React.js with modern UI/UX
- Practitioner and Patient dashboards
- Admin panel

---

## 📊 Database Schema

**8 Collections:**
1. **Users** - Patient accounts with health data
2. **Practitioners** - Healthcare provider accounts
3. **Health Profiles** - Detailed health conditions and preferences
4. **Diet Plans** - Customized meal plans with approval workflow
5. **Foods** - 33+ food items with multi-system nutrition data
6. **Recipes** - 15+ recipes with auto-calculated nutrition
7. **Audit Logs** - System activity tracking
8. **System Configs** - Application settings

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (Tested on v22.14.0)
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mosina003/Nutrifusion.git
cd Nutrifusion/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutrifusion
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
```

4. **Seed the database (optional)**
```bash
node scripts/seedRecipes.js
```

5. **Start the server**
```bash
npm start          # Production
npm run dev        # Development with nodemon
```

Server runs at: `http://localhost:5000`

---

## 📚 API Documentation

### Authentication
```bash
POST /api/auth/register  # Register new user/practitioner
POST /api/auth/login     # Login and get JWT token
GET  /api/auth/me        # Get current user info
```

### Food Management (Admin/Approver)
```bash
GET    /api/foods              # Get all foods
POST   /api/foods              # Create food (Admin only)
GET    /api/foods/:id          # Get single food
PUT    /api/foods/:id          # Update food (Admin only)
DELETE /api/foods/:id          # Delete food (Admin only)
POST   /api/foods/bulk         # Bulk create foods
GET    /api/foods/categories   # Get food categories
```

### Recipe Management
```bash
GET    /api/recipes        # Get all recipes
POST   /api/recipes        # Create recipe (auto-calc nutrition)
GET    /api/recipes/:id    # Get single recipe
PUT    /api/recipes/:id    # Update recipe
DELETE /api/recipes/:id    # Delete recipe
```

### Diet Plans
```bash
GET    /api/diet-plans           # Get all diet plans
POST   /api/diet-plans           # Create diet plan
GET    /api/diet-plans/:id       # Get single plan
PUT    /api/diet-plans/:id       # Update plan
DELETE /api/diet-plans/:id       # Delete plan
PUT    /api/diet-plans/:id/approve  # Approve plan
```

### Intelligent Recommendations (Layer 3)
```bash
GET    /api/recommendations/foods        # Personalized food recommendations
GET    /api/recommendations/recipes      # Personalized recipe recommendations
GET    /api/recommendations/meal/:time   # Meal-specific recommendations (Breakfast/Lunch/Dinner/Snack)
GET    /api/recommendations/dailyplan    # Complete daily meal plan
```

**[Full API Documentation](backend/POSTMAN_TESTING_GUIDE.md)**

**[Layer 3 Testing Guide](backend/LAYER3_TESTING_GUIDE.md)**

---

## 🧪 Testing

### Postman Testing
Complete testing guide with 15 step-by-step tests:
```bash
# See: backend/POSTMAN_TESTING_GUIDE.md
```

### Automated Testing
```bash
node scripts/testFoodAPIs.js
node scripts/testDietPlanAPI.js
```

---

## 🔐 Security Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Password Hashing** - bcryptjs with salt rounds
- ✅ **Role-Based Access Control** - 4 authority levels
  - Admin (full access, bypasses checks)
  - Approver (can approve diet plans, manage foods)
  - Editor (can create/edit diet plans)
  - Viewer (read-only access)
- ✅ **Verified Account Requirement** - Critical actions require verification
- ✅ **Audit Logging** - All CUD operations logged
- ✅ **Input Validation** - Mongoose schema validation
- ✅ **Protected Routes** - Middleware-based access control

---

## 📦 Tech Stack

**Backend:**
- Node.js v22.14.0
- Express.js 4.18.2
- MongoDB + Mongoose 8.0.0
- JWT (jsonwebtoken 9.0.2)
- bcryptjs 2.4.3
- CORS, dotenv, validator

**Development:**
- Nodemon 3.0.1
- Postman (API testing)

**Deployment:** (Planned)
- Docker
- AWS/Heroku/Vercel

---

## 🗂️ Project Structure

```
Nutrifusion/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js              # Authentication & RBAC
│   │   └── auditLog.js          # Audit logging
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Practitioner.js      # Practitioner schema
│   │   ├── HealthProfile.js     # Health profile schema
│   │   ├── DietPlan.js          # Diet plan schema
│   │   ├── Food.js              # Food schema
│   │   ├── Recipe.js            # Recipe schema
│   │   ├── AuditLog.js          # Audit log schema
│   │   └── SystemConfig.js      # System config schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User management
│   │   ├── practitioners.js     # Practitioner management
│   │   ├── healthProfiles.js    # Health profiles
│   │   ├── dietPlans.js         # Diet plans
│   │   ├── foods.js             # Food management
│   │   ├── recipes.js           # Recipe management
│   │   └── recommendations.js   # Intelligent recommendations (Layer 3)
│   ├── services/
│   │   ├── nutritionCalculator.js  # Nutrition calculation service
│   │   └── intelligence/        # Layer 3: Recommendation Engine
│   │       ├── rules/           # Rule engines (Ayurveda, Unani, TCM, Modern, Safety)
│   │       ├── scoring/         # Score aggregation engine
│   │       ├── recommendation/  # Food & recipe recommendation engines
│   │       └── explainability/  # Human-readable explanations
│   ├── scripts/
│   │   ├── seedRecipes.js       # Seed foods & recipes
│   │   ├── testFoodAPIs.js      # Food API tests
│   │   └── testDietPlanAPI.js   # Diet plan tests
│   ├── server.js                # Express server
│   ├── package.json             # Dependencies
│   ├── POSTMAN_TESTING_GUIDE.md # Layer 1 & 2 testing
│   ├── LAYER3_TESTING_GUIDE.md  # Layer 3 testing scenarios
│   └── .env.example             # Environment template
├── frontend/ (Planned - Layer 4)
├── .gitignore
├── COMMIT_GUIDE.md              # Daily commit templates
└── README.md
```

---

## 🎯 Roadmap

### ✅ Phase 1: Backend Layer 1 (Complete)
- Authentication & Authorization
- User & Practitioner Management
- Health Profiles
- Diet Plans with Approval Workflow

### ✅ Phase 2: Backend Layer 2 (Complete)
- Food Database (33 items)
- Recipe Management (15 recipes)
- Auto-calculated Nutrition
- Search & Filter

### ✅ Phase 3: Backend Layer 3 (Complete)
- **Intelligent Recommendation Engine**
- Rule-based scoring (5 medical systems)
- Ayurveda dosha compatibility
- Unani Mizaj balancing
- TCM Yin-Yang balancing
- Modern nutrition science
- Safety contraindications
- Personalized food/recipe recommendations
- Meal-specific recommendations
- Daily meal plan generation
- Human-readable explanations

### 🔄 Phase 4: Frontend (In Progress)
- React.js UI
- Practitioner Dashboard
- Patient Dashboard
- Admin Panel

### 📋 Phase 5: Advanced Features (Planned)
- Meal Planning Automation
- Grocery List Generation
- Progress Tracking & Analytics
- Mobile App (React Native)
- Third-party Integrations (wearables, food APIs)

---

## 🧑‍💻 Contributors

- **Mosina** - [@mosina003](https://github.com/mosina003) - Full Stack Development

---

## 📄 License

This project is licensed under the ISC License.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact

**Mosina**
- GitHub: [@mosina003](https://github.com/mosina003)
- Email: smosina003@gmail.com

---

## 🙏 Acknowledgments

- Ayurvedic principles from classical texts
- Traditional Chinese Medicine (TCM) reference materials
- Unani medicine documentation
- USDA Nutrition Database

---

**Built with ❤️ for better health through personalized nutrition**
