const axios = require('axios');

// Test dashboard API
async function testDashboardAPI() {
  try {
    // You'll need a valid token - get one by logging in first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com', // Replace with a valid test user
      password: 'password123'     // Replace with the actual password
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
    
    // Call dashboard API
    const dashboardResponse = await axios.get('http://localhost:5000/api/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\n📊 Dashboard API Response:');
    console.log(JSON.stringify(dashboardResponse.data, null, 2));
    
    if (dashboardResponse.data.success) {
      console.log('\n📋 Summary Cards:');
      console.log(JSON.stringify(dashboardResponse.data.data.summaryCards, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDashboardAPI();
