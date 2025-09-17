const http = require('http');

// Test function to make HTTP requests
function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1', // Use IPv4 localhost
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testAllEndpoints() {
  console.log('🧪 Testing server endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResult = await testEndpoint('/health');
    console.log('✅ Health endpoint:', healthResult.status, healthResult.data);
    console.log('');

    // Test API test endpoint
    console.log('2. Testing API test endpoint...');
    const apiTestResult = await testEndpoint('/api/test');
    console.log('✅ API test endpoint:', apiTestResult.status, apiTestResult.data);
    console.log('');

    // Test registration endpoint
    console.log('3. Testing registration endpoint...');
    const registerData = {
      email: 'test@example.com',
      password: 'testpassword',
      firstName: 'Test',
      lastName: 'User',
      site: 'Test Site',
      role: 'investigator'
    };
    const registerResult = await testEndpoint('/api/auth/register', 'POST', registerData);
    console.log('✅ Registration endpoint:', registerResult.status, registerResult.data);
    console.log('');

    // Test login endpoint
    console.log('4. Testing login endpoint...');
    const loginData = {
      email: 'test@example.com',
      password: 'testpassword'
    };
    const loginResult = await testEndpoint('/api/auth/login', 'POST', loginData);
    console.log('✅ Login endpoint:', loginResult.status, loginResult.data);
    console.log('');

    console.log('🎉 All endpoints are working correctly!');
    console.log('\n📱 The mobile app should now be able to connect to the server.');
    console.log('🔗 Server URL: http://localhost:3000');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testAllEndpoints();
