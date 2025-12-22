const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://root:gdF4CHLIrUX0JMFop11SW8tr9Y6Tk67d@dpg-d534alggjchc73eu0eeg-a.virginia-postgres.render.com/pavilion_npg7',
  ssl: { rejectUnauthorized: false }
});

async function checkCustomersTable() {
  try {
    // Check if customers table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'customers'
      )
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('Customers table exists');
      
      // Get customers table schema
      const schemaResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'customers' 
        ORDER BY ordinal_position
      `);
      
      console.log('Customers table schema:');
      schemaResult.rows.forEach(row => {
        console.log(`- ${row.column_name} (${row.data_type})`);
      });
      
      // Get sample data
      const dataResult = await pool.query('SELECT * FROM customers LIMIT 5');
      console.log('Sample customers data:');
      dataResult.rows.forEach(row => {
        console.log(`- ${row.id}: ${row.name || row.email || 'No name'}`);
      });
      
    } else {
      console.log('Customers table does not exist');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCustomersTable();
