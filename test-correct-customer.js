const { Pool } = require('pg');
const { createToken } = require('./lib/auth');

const pool = new Pool({
  connectionString: 'postgresql://root:gdF4CHLIrUX0JMFop11SW8tr9Y6Tk67d@dpg-d534alggjchc73eu0eeg-a.virginia-postgres.render.com/pavilion_npg7',
  ssl: { rejectUnauthorized: false }
});

async function testQuotationWithCorrectCustomer() {
  try {
    // Get admin user and create token
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@pavilion.com']);
    const user = userResult.rows[0];
    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    
    console.log('Testing quotation creation with correct customer...');
    
    // Test creating a draft quotation with correct customer ID
    const response = await fetch('http://localhost:3000/api/admin/quotations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_id: '247f8ab7-52b7-425c-a114-18cb19004ea0', // Use correct customer ID from customers table
        products: [
          {
            product_id: '41c5c9e9-ebd9-4999-bc5b-1096fe8d926e',
            name: 'Kookaburra Tennis Pro 1',
            quantity: 2,
            custom_price: 4000
          }
        ],
        notes: 'Test quotation with correct customer',
        show_total: true
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Quotation created successfully!');
      console.log('Quotation ID:', result.quotation.id);
      console.log('Status:', result.quotation.status);
    } else {
      console.log('Error:', response.status);
      const errorText = await response.text();
      console.log('Error body:', errorText);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await pool.end();
  }
}

testQuotationWithCorrectCustomer();
