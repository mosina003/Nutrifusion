const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

// Load all models
require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const practitionerRoutes = require('./routes/practitioners');
const healthProfileRoutes = require('./routes/healthProfiles');
const foodRoutes = require('./routes/foods');
const recipeRoutes = require('./routes/recipes');
const dietPlanRoutes = require('./routes/dietPlans');
const recommendationRoutes = require('./routes/recommendations');
const assessmentRoutes = require('./routes/assessments');

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: '🥗 NutriFusion API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      practitioners: '/api/practitioners',
      healthProfiles: '/api/health-profiles',
      foods: '/api/foods',
      recipes: '/api/recipes',
      dietPlans: '/api/diet-plans',
      recommendations: '/api/recommendations',
      assessments: '/api/assessments'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/practitioners', practitionerRoutes);
app.use('/api/health-profiles', healthProfileRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/diet-plans', dietPlanRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/assessments', assessmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}\n`);
});
