const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://root:gdF4CHLIrUX0JMFop11SW8tr9Y6Tk67d@dpg-d534alggjchc73eu0eeg-a.virginia-postgres.render.com/pavilion_npg7',
  ssl: { rejectUnauthorized: false }
});

async function testQuotation() {
  try {
    console.log('Testing quotation functionality...');
    
    // Check if admin user has MFA enabled
    const adminResult = await pool.query('SELECT email, mfa_enabled, mfa_secret FROM users WHERE email = $1', ['admin@pavilion.com']);
    if (adminResult.rows.length > 0) {
      console.log('Admin user MFA status:', adminResult.rows[0]);
    }
    
    // Check if B2B customer exists
    const customerResult = await pool.query('SELECT id, company_name FROM b2b_customers LIMIT 1');
    if (customerResult.rows.length > 0) {
      console.log('Found B2B customer:', customerResult.rows[0]);
    }
    
    // Check if products exist
    const productResult = await pool.query('SELECT id, name, dealer_price FROM products LIMIT 1');
    if (productResult.rows.length > 0) {
      console.log('Found product:', productResult.rows[0]);
    }
    
    console.log('Database check completed successfully');
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await pool.end();
  }
}

testQuotation();
