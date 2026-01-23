# NutriFusion Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Then edit `.env` with your MongoDB connection string:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutrifusion
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For Windows (if installed as service)
net start MongoDB

# Or using mongod
mongod
```

### 4. Initialize Database & Seed Data
Run the database initialization script to create collections and seed initial data:
```bash
npm run seed
```

This will create all 8 collections:
- ✅ users
- ✅ healthprofiles
- ✅ practitioners
- ✅ foods
- ✅ recipes
- ✅ dietplans
- ✅ auditlogs
- ✅ medicalconditions

And seed sample data including:
- 5 medical conditions (Diabetes, Hypertension, IBS, etc.)
- 5 sample foods (Rice, Spinach, Turmeric, Ghee, Ginger) with complete traditional properties

### 5. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## Project Structure
```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── User.js              # User schema
│   ├── HealthProfile.js     # Health profile schema
│   ├── Practitioner.js      # Practitioner schema
│   ├── Food.js              # Food items schema
│   ├── Recipe.js            # Recipe schema
│   ├── DietPlan.js          # Diet plan schema
│   ├── AuditLog.js          # Audit log schema
│   ├── MedicalCondition.js  # Medical condition schema
│   └── index.js             # Model exports
├── scripts/
│   └── seedDatabase.js      # Database initialization
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── server.js                # Express server
```

## API Endpoints (Coming Soon)
Routes will be added in next phase:
- `/api/auth` - Authentication
- `/api/users` - User management
- `/api/foods` - Food database
- `/api/recipes` - Recipe management
- `/api/diet-plans` - Diet plan generation
- `/api/practitioners` - Practitioner portal

## Collections Schema Overview

### 1. Users
Stores user profiles with traditional constitutional assessments (Prakriti, Mizaj).

### 2. Health Profiles
Tracks user health metrics, lifestyle, and digestion indicators.

### 3. Practitioners
Manages Ayurvedic, Unani, TCM, and modern practitioners.

### 4. Foods
Unified food database with both modern nutrition and traditional properties.

### 5. Recipes
Custom and system-generated recipes with ingredient tracking.

### 6. Diet Plans
Personalized meal plans with rule-based and ML-driven recommendations.

### 7. Audit Logs
Tracks all system changes for compliance and security.

### 8. Medical Conditions
Database of conditions with traditional and modern perspectives.

## Next Steps
1. ✅ Database models created
2. ✅ Initial data seeded
3. 🔄 Create API routes
4. 🔄 Implement authentication
5. 🔄 Build recommendation engine
6. 🔄 Add frontend integration
