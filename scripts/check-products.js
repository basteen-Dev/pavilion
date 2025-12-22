require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: { rejectUnauthorized: false } // Disable SSL for local check
});

async function check() {
    try {
        console.log('Checking "products" table schema...');
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'products'
        `);

        console.table(res.rows.map(r => ({
            col: r.column_name,
            type: r.data_type,
            null: r.is_nullable,
            def: r.column_default
        })));

        // Check if there are any rows with null selling_price
        const nulls = await pool.query('SELECT count(*) FROM products WHERE selling_price IS NULL');
        console.log('Rows with NULL selling_price:', nulls.rows[0].count);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
