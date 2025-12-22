const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://root:gdF4CHLIrUX0JMFop11SW8tr9Y6Tk67d@dpg-d534alggjchc73eu0eeg-a.virginia-postgres.render.com/pavilion_npg7',
  ssl: { rejectUnauthorized: false }
});

async function checkCustomerTables() {
  try {
    console.log('=== CHECKING CUSTOMER TABLES ===\n');
    
    // Check customers table
    console.log('1. CUSTOMERS TABLE:');
    const customers = await pool.query('SELECT id, company_name, email FROM customers LIMIT 5');
    customers.rows.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.company_name || customer.email}`);
      console.log(`      ID: ${customer.id}`);
      console.log(`      Email: ${customer.email}`);
      console.log('');
    });
    
    // Check b2b_customers table
    console.log('2. B2B_CUSTOMERS TABLE:');
    const b2bCustomers = await pool.query('SELECT id, company_name, user_id FROM b2b_customers LIMIT 5');
    b2bCustomers.rows.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.company_name}`);
      console.log(`      ID: ${customer.id}`);
      console.log(`      User ID: ${customer.user_id}`);
      console.log('');
    });
    
    // Check which customer ID is causing the error
    console.log('3. CHECKING PROBLEMATIC CUSTOMER ID:');
    const problematicId = '3ce80d33-e4a2-49ee-9f9e-24a6aa11073b';
    
    const customerCheck = await pool.query('SELECT * FROM customers WHERE id = $1', [problematicId]);
    console.log(`Customer ID ${problematicId} in customers table:`, customerCheck.rows.length > 0 ? 'FOUND' : 'NOT FOUND');
    
    const b2bCustomerCheck = await pool.query('SELECT * FROM b2b_customers WHERE id = $1', [problematicId]);
    console.log(`Customer ID ${problematicId} in b2b_customers table:`, b2bCustomerCheck.rows.length > 0 ? 'FOUND' : 'NOT FOUND');
    
    if (b2bCustomerCheck.rows.length > 0) {
      console.log('B2B Customer details:', b2bCustomerCheck.rows[0]);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCustomerTables();
