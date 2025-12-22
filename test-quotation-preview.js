const { Pool } = require('pg');
const { createToken } = require('./lib/auth');

const pool = new Pool({
  connectionString: 'postgresql://root:gdF4CHLIrUX0JMFop11SW8tr9Y6Tk67d@dpg-d534alggjchc73eu0eeg-a.virginia-postgres.render.com/pavilion_npg7',
  ssl: { rejectUnauthorized: false }
});

async function testQuotationPreview() {
  try {
    // Get admin user and create token
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@pavilion.com']);
    const user = userResult.rows[0];
    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    
    console.log('Testing quotation preview with admin token...');
    
    // Test the quotation preview by simulating the API call
    const response = await fetch('http://localhost:3000/api/admin/quotations/preview', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_id: "247f8ab7-52b7-425c-a114-18cb19004ea0",
        products: [
          {
            product_id: "41c5c9e9-ebd9-4999-bc5b-1096fe8d926e",
            quantity: 2,
            custom_price: 4000
          }
        ],
        notes: "Test quotation preview",
        valid_until: "2025-12-31"
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Quotation preview successful!');
      console.log('Preview data:', JSON.stringify(result, null, 2));
    } else {
      console.log('Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error body:', errorText);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await pool.end();
  }
}

testQuotationPreview();
