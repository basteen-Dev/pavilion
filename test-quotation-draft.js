const { Pool } = require('pg');
const { createToken } = require('./lib/auth');

const pool = new Pool({
  connectionString: 'postgresql://root:gdF4CHLIrUX0JMFop11SW8tr9Y6Tk67d@dpg-d534alggjchc73eu0eeg-a.virginia-postgres.render.com/pavilion_npg7',
  ssl: { rejectUnauthorized: false }
});

async function testQuotationDraft() {
  try {
    // Get admin user and create token
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@pavilion.com']);
    const user = userResult.rows[0];
    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    
    console.log('Testing quotation draft functionality...');
    
    // Test creating a draft quotation
    console.log('1. Creating draft quotation...');
    const createResponse = await fetch('http://localhost:3000/api/admin/quotations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_id: "247f8ab7-52b7-425c-a114-18cb19004ea0", // Use existing customer from customers table
        products: [
          {
            product_id: "41c5c9e9-ebd9-4999-bc5b-1096fe8d926e",
            name: "Kookaburra Tennis Pro 1",
            quantity: 2,
            custom_price: 4000
          }
        ],
        notes: "Test draft quotation"
      })
    });
    
    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log('Draft quotation created successfully!');
      const quotationId = createResult.quotation.id;
      console.log('Quotation ID:', quotationId);
      
      // Test getting the quotation details
      console.log('2. Getting quotation details...');
      const getResponse = await fetch(`http://localhost:3000/api/admin/quotations/${quotationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (getResponse.ok) {
        const getResult = await getResponse.json();
        console.log('Quotation details retrieved successfully!');
        console.log('Quotation status:', getResult.status);
        console.log('Number of items:', getResult.items.length);
      } else {
        console.log('Error getting quotation:', getResponse.status);
      }
      
      // Test updating quotation status from draft to sent
      console.log('3. Updating quotation status to sent...');
      const updateResponse = await fetch(`http://localhost:3000/api/admin/quotations/${quotationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'sent',
          notes: 'Updated notes for sent quotation'
        })
      });
      
      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        console.log('Quotation status updated successfully!');
        console.log('New status:', updateResult.quotation.status);
      } else {
        console.log('Error updating quotation:', updateResponse.status);
      }
      
    } else {
      console.log('Error creating quotation:', createResponse.status);
      const errorText = await createResponse.text();
      console.log('Error body:', errorText);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await pool.end();
  }
}

testQuotationDraft();
