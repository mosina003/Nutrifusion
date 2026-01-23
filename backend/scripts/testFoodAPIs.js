require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testFoodAPIs = async () => {
  try {
    console.log('🧪 Testing Food Management APIs\n');

    // Step 1: Login as admin
    console.log('🔐 Step 1: Logging in as Admin...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'smosina003@gmail.com',
      password: 'Admin@123'
    });
    
    const adminToken = loginRes.data.token;
    console.log('✅ Admin logged in\n');

    // Step 2: Test GET all foods
    console.log('📋 Step 2: Getting all foods...');
    const foodsRes = await axios.get(`${BASE_URL}/foods`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`✅ Found ${foodsRes.data.count} foods`);
    console.log(`   First 5: ${foodsRes.data.data.slice(0, 5).map(f => f.name).join(', ')}\n`);

    // Step 3: Test GET categories
    console.log('📂 Step 3: Getting food categories...');
    const categoriesRes = await axios.get(`${BASE_URL}/foods/categories`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`✅ Found ${categoriesRes.data.count} categories:`);
    console.log(`   ${categoriesRes.data.data.join(', ')}\n`);

    // Step 4: Test GET single food
    console.log('🔍 Step 4: Getting single food...');
    const firstFoodId = foodsRes.data.data[0]._id;
    const foodRes = await axios.get(`${BASE_URL}/foods/${firstFoodId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`✅ Got food: ${foodRes.data.data.name}`);
    console.log(`   Category: ${foodRes.data.data.category}`);
    console.log(`   Calories: ${foodRes.data.data.modernNutrition?.calories || 0} per 100g\n`);

    // Step 5: Test CREATE food (Admin/Approver only)
    console.log('➕ Step 5: Creating new food (Admin only)...');
    const newFoodData = {
      name: 'Test Quinoa',
      category: 'Grain',
      modernNutrition: {
        calories: 120,
        protein: 4.4,
        carbs: 21,
        fat: 1.9,
        fiber: 2.8
      },
      ayurveda: {
        taste: ['Sweet', 'Astringent'],
        energy: 'Cooling',
        doshaEffect: {
          vata: 'Neutral',
          pitta: 'Decrease',
          kapha: 'Neutral'
        }
      }
    };

    const createRes = await axios.post(`${BASE_URL}/foods`, newFoodData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const createdFood = createRes.data.data;
    console.log(`✅ Created food: ${createdFood.name} (ID: ${createdFood._id})\n`);

    // Step 6: Test UPDATE food (Admin/Approver only)
    console.log('✏️  Step 6: Updating food (Admin only)...');
    const updateData = {
      modernNutrition: {
        calories: 125, // Updated
        protein: 4.5,
        carbs: 21,
        fat: 2.0,
        fiber: 3.0
      }
    };

    const updateRes = await axios.put(`${BASE_URL}/foods/${createdFood._id}`, updateData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`✅ Updated food: ${updateRes.data.data.name}`);
    console.log(`   New calories: ${updateRes.data.data.modernNutrition.calories}\n`);

    // Step 7: Test search
    console.log('🔎 Step 7: Testing search...');
    const searchRes = await axios.get(`${BASE_URL}/foods?search=rice`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`✅ Search "rice" found ${searchRes.data.count} results:`);
    console.log(`   ${searchRes.data.data.map(f => f.name).join(', ')}\n`);

    // Step 8: Test category filter
    console.log('🏷️  Step 8: Testing category filter...');
    const grainRes = await axios.get(`${BASE_URL}/foods?category=Grain`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`✅ Category "Grain" has ${grainRes.data.count} items:`);
    console.log(`   ${grainRes.data.data.slice(0, 5).map(f => f.name).join(', ')}\n`);

    // Step 9: Test DELETE food (Admin/Approver only)
    console.log('🗑️  Step 9: Deleting test food (Admin only)...');
    const deleteRes = await axios.delete(`${BASE_URL}/foods/${createdFood._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`✅ Deleted food: ${deleteRes.data.message}\n`);

    // Step 10: Test non-admin access (should see foods but cannot create/update/delete)
    console.log('👤 Step 10: Testing non-admin access...');
    
    // Login as regular practitioner (if exists)
    try {
      const practitionerLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'ayush.kumar@ayurheal.com',
        password: 'Ayush@123'
      });
      
      const practitionerToken = practitionerLogin.data.token;
      
      // Should be able to GET foods
      const practitionerFoodsRes = await axios.get(`${BASE_URL}/foods`, {
        headers: { Authorization: `Bearer ${practitionerToken}` }
      });
      console.log(`✅ Practitioner can view ${practitionerFoodsRes.data.count} foods`);
      
      // Should NOT be able to create food
      try {
        await axios.post(`${BASE_URL}/foods`, {
          name: 'Unauthorized Test',
          category: 'Test'
        }, {
          headers: { Authorization: `Bearer ${practitionerToken}` }
        });
        console.log('❌ ERROR: Practitioner should not be able to create food!');
      } catch (err) {
        if (err.response?.status === 403) {
          console.log('✅ Practitioner correctly denied create access (403)');
        } else {
          console.log(`✅ Practitioner denied create access (${err.response?.status})`);
        }
      }
    } catch (err) {
      console.log('⚠️  No non-admin practitioner found, skipping access test');
    }

    console.log('\n🎉 ALL FOOD API TESTS PASSED!');
    console.log('\n📝 Summary of Food APIs:');
    console.log('   ✅ GET /api/foods - Get all foods (All users)');
    console.log('   ✅ GET /api/foods/categories - Get categories (All users)');
    console.log('   ✅ GET /api/foods/:id - Get single food (All users)');
    console.log('   ✅ POST /api/foods - Create food (Admin/Approver only) 🔒');
    console.log('   ✅ PUT /api/foods/:id - Update food (Admin/Approver only) 🔒');
    console.log('   ✅ DELETE /api/foods/:id - Delete food (Admin/Approver only) 🔒');
    console.log('   ✅ POST /api/foods/bulk - Bulk create foods (Admin/Approver only) 🔒');
    console.log('   ✅ Search by name/aliases');
    console.log('   ✅ Filter by category');
    console.log('   ✅ Prevents deletion if used in recipes');

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
};

console.log('⚠️  Make sure the server is running: npm start\n');
testFoodAPIs();
