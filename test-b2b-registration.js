async function testB2BRegistration() {
  try {
    console.log('Testing B2B registration...');
    
    const response = await fetch('http://localhost:3000/api/b2b/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'testb2b@example.com',
        password: 'test123456',
        name: 'Test B2B User',
        phone: '9876543210',
        company_name: 'Test B2B Company',
        gstin: '123456789012345',
        business_type: 'Retail',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('B2B registration successful!');
      console.log('Result:', JSON.stringify(result, null, 2));
    } else {
      console.log('Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error body:', errorText);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testB2BRegistration();
