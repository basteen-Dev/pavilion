const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://root:gdF4CHLIrUX0JMFop11SW8tr9Y6Tk67d@dpg-d534alggjchc73eu0eeg-a.virginia-postgres.render.com/pavilion_npg7',
  ssl: { rejectUnauthorized: false }
});

async function checkQuotationItemsSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'quotation_items' 
      ORDER BY ordinal_position
    `);
    
    console.log('Quotation items table schema:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkQuotationItemsSchema();
