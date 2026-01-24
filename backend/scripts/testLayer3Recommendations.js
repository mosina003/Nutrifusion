/**
 * Quick Test Script for Layer 3 Recommendation Engine
 * Tests all 4 recommendation APIs
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
let authToken = null;

// Test user credentials (create this user first or use existing)
const testUser = {
  email: 'test.patient@example.com',
  password: 'Test@1234',
  // For registration
  fullName: 'Test Patient',
  age: 35,
  gender: 'Female',
  BMI: 24,
  prakriti: { vata: 25, pitta: 50, kapha: 25 }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, useAuth = true) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: useAuth && authToken ? { Authorization: `Bearer ${authToken}` } : {}
  };

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Test 1: Login
async function testLogin() {
  log.section('TEST 1: Login');
  log.info(`Attempting login with ${testUser.email}`);

  const result = await apiRequest('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  }, false);

  if (result.success && result.data.token) {
    authToken = result.data.token;
    log.success('Login successful');
    log.info(`User: ${result.data.user.fullName}`);
    return true;
  } else {
    log.error('Login failed');
    console.log('Error:', result.error);
    return false;
  }
}

// Test 2: Food Recommendations
async function testFoodRecommendations() {
  log.section('TEST 2: Food Recommendations');
  
  const result = await apiRequest('GET', '/recommendations/foods?limit=5&minScore=40');

  if (result.success) {
    const { recommendations, summary } = result.data.data;
    
    log.success(`Found ${recommendations.length} food recommendations`);
    log.info(`Average Score: ${summary.averageScore}/100`);
    log.info(`Dominant Dosha: ${summary.userProfile.dominantDosha}`);
    
    console.log('\nTop 3 Recommendations:');
    recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`\n${i + 1}. ${rec.name} (${rec.category})`);
      console.log(`   Score: ${rec.finalScore}/100`);
      console.log(`   Reasons: ${rec.reasons.slice(0, 2).join(', ')}`);
      if (rec.warnings.length > 0) {
        console.log(`   Warnings: ${rec.warnings.join(', ')}`);
      }
    });
    
    return true;
  } else {
    log.error('Food recommendations failed');
    console.log('Error:', result.error);
    return false;
  }
}

// Test 3: Recipe Recommendations
async function testRecipeRecommendations() {
  log.section('TEST 3: Recipe Recommendations');
  
  const result = await apiRequest('GET', '/recommendations/recipes?limit=5&minScore=40');

  if (result.success) {
    const { recommendations, summary } = result.data.data;
    
    log.success(`Found ${recommendations.length} recipe recommendations`);
    log.info(`Average Score: ${summary.averageScore}/100`);
    log.info(`Average Prep Time: ${summary.averagePrepTime} minutes`);
    
    console.log('\nTop 3 Recipes:');
    recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`\n${i + 1}. ${rec.name}`);
      console.log(`   Score: ${rec.finalScore}/100`);
      console.log(`   Time: ${rec.prepTime + rec.cookTime} min total`);
      console.log(`   Nutrition: ${rec.nutritionSummary.calories} cal, ${rec.nutritionSummary.protein}g protein`);
      console.log(`   Reasons: ${rec.reasons.slice(0, 2).join(', ')}`);
    });
    
    return true;
  } else {
    log.error('Recipe recommendations failed');
    console.log('Error:', result.error);
    return false;
  }
}

// Test 4: Meal-Specific Recommendations
async function testMealRecommendations() {
  log.section('TEST 4: Meal-Specific Recommendations');
  
  const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  
  for (const mealTime of meals) {
    log.info(`Testing ${mealTime} recommendations...`);
    
    const result = await apiRequest('GET', `/recommendations/meal/${mealTime}?limit=3&type=both`);

    if (result.success) {
      const { recommendations, summary } = result.data.data;
      
      log.success(`${mealTime}: ${recommendations.length} options (Avg Score: ${summary.averageScore}/100)`);
      
      console.log(`   Top pick: ${recommendations[0]?.name} (${recommendations[0]?.finalScore}/100)`);
    } else {
      log.error(`${mealTime} recommendations failed`);
    }
  }
  
  return true;
}

// Test 5: Daily Meal Plan
async function testDailyPlan() {
  log.section('TEST 5: Daily Meal Plan');
  
  const result = await apiRequest('GET', '/recommendations/dailyplan');

  if (result.success) {
    const { dailyPlan, totalNutrition, summary } = result.data.data;
    
    log.success('Daily meal plan generated');
    log.info(`Total Calories: ${totalNutrition.calories} cal`);
    log.info(`Total Protein: ${totalNutrition.protein}g`);
    
    console.log('\nMeal Plan:');
    console.log(`Breakfast: ${dailyPlan.breakfast.length} options`);
    dailyPlan.breakfast.forEach((meal, i) => {
      console.log(`  ${i + 1}. ${meal.name} (Score: ${meal.finalScore}/100)`);
    });
    
    console.log(`\nLunch: ${dailyPlan.lunch.length} options`);
    dailyPlan.lunch.forEach((meal, i) => {
      console.log(`  ${i + 1}. ${meal.name} (Score: ${meal.finalScore}/100)`);
    });
    
    console.log(`\nDinner: ${dailyPlan.dinner.length} options`);
    dailyPlan.dinner.forEach((meal, i) => {
      console.log(`  ${i + 1}. ${meal.name} (Score: ${meal.finalScore}/100)`);
    });
    
    console.log(`\nSnacks: ${dailyPlan.snacks.length} options`);
    dailyPlan.snacks.slice(0, 3).forEach((meal, i) => {
      console.log(`  ${i + 1}. ${meal.name} (Score: ${meal.finalScore}/100)`);
    });
    
    return true;
  } else {
    log.error('Daily plan generation failed');
    console.log('Error:', result.error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════╗`);
  console.log(`║  NutriFusion Layer 3 - Recommendation Engine Test Suite   ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  log.info('Starting test suite...');
  log.info(`Base URL: ${BASE_URL}`);

  // Check if server is running
  try {
    await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    log.success('Server is running');
  } catch (error) {
    log.error('Server is not running. Please start the server with: npm start');
    return;
  }

  // Run tests
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    log.error('Cannot proceed without authentication. Please check credentials.');
    return;
  }

  await testFoodRecommendations();
  await testRecipeRecommendations();
  await testMealRecommendations();
  await testDailyPlan();

  // Summary
  log.section('TEST SUMMARY');
  log.success('All Layer 3 recommendation tests completed!');
  log.info('Check the output above for detailed results.');
  
  console.log(`\n${colors.cyan}Next Steps:`);
  console.log(`1. Test with different user profiles (Vata, Kapha dominance)`);
  console.log(`2. Test with medical conditions (Diabetes, Acid Reflux)`);
  console.log(`3. Test with allergies and dietary preferences`);
  console.log(`4. Review LAYER3_TESTING_GUIDE.md for comprehensive scenarios${colors.reset}\n`);
}

// Run tests
runAllTests().catch(error => {
  log.error('Test suite failed with error:');
  console.error(error);
});
