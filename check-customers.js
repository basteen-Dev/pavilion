const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://root:gdF4CHLIrUX0JMFop11SW8tr9Y6Tk67d@dpg-d534alggjchc73eu0eeg-a.virginia-postgres.render.com/pavilion_npg7',
  ssl: { rejectUnauthorized: false }
});

async function checkCustomers() {
  try {
    const result = await pool.query('SELECT id, company_name FROM b2b_customers LIMIT 5');
    console.log('Available B2B customers:');
    result.rows.forEach(row => {
      console.log(`- ${row.id}: ${row.company_name}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCustomers();
