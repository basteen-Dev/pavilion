const { Pool } = require('pg');
require('dotenv').config();

// Try to use DATABASE_URL from process.env (loaded from .env)
console.log('Using connection string:', process.env.DATABASE_URL ? 'Found' : 'Missing');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testCreateCustomer() {
    try {
        console.log('Attempting to create a test customer...');
        const res = await pool.query(
            `INSERT INTO customers (
                email, type, company_name, gst_number, primary_contact_name
            ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            ['test_fix_' + Date.now() + '@example.com', 'General', 'Test Company Fix', 'GST123', 'Contact Name']
        );
        console.log('Customer created successfully:', res.rows[0]);

        // Clean up
        await pool.query('DELETE FROM customers WHERE id = $1', [res.rows[0].id]);
        console.log('Test customer deleted.');
        process.exit(0);
    } catch (err) {
        console.error('Failed to create customer:', err.message);
        console.error('Detail:', err.detail);
        console.error('Column:', err.column);
        console.error('Code:', err.code);
        process.exit(1);
    }
}

testCreateCustomer();
