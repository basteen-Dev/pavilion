const { Pool } = require('pg');
const { createToken } = require('./lib/auth');

const pool = new Pool({
  connectionString: 'postgresql://root:gdF4CHLIrUX0JMFop11SW8tr9Y6Tk67d@dpg-d534alggjchc73eu0eeg-a.virginia-postgres.render.com/pavilion_npg7',
  ssl: { rejectUnauthorized: false }
});

async function debugQuotationUpdate() {
  try {
    // Get admin user and create token
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@pavilion.com']);
    const user = userResult.rows[0];
    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    
    console.log('Testing quotation update with detailed error info...');
    
    // Test updating quotation status
    const quotationId = "5b425fcf-b253-4bbe-8625-7c6e0383f2d2";
    
    try {
      const response = await fetch(`http://localhost:3000/api/admin/quotations/${quotationId}`, {
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
      
      if (response.ok) {
        const result = await response.json();
        console.log('Quotation status updated successfully!');
        console.log('New status:', result.quotation.status);
      } else {
        console.log('Error updating quotation:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('Error body:', errorText);
      }
      
    } catch (error) {
      console.error('Fetch error:', error.message);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await pool.end();
  }
}

debugQuotationUpdate();
