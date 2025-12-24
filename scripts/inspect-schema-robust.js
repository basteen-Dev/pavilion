require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function inspect() {
    try {
        const client = await pool.connect();
        console.log('Connected to DB');

        // Check Roles
        console.log('\n--- Roles Content ---');
        const roles = await client.query('SELECT * FROM roles');
        console.table(roles.rows);

        // Check Users Columns
        console.log('\n--- Users Columns ---');
        const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
        console.table(cols.rows);

        // Check Users Content (sample)
        console.log('\n--- Users Content (First 3) ---');
        const users = await client.query('SELECT id, name, email, role_id FROM users LIMIT 3');
        // Note: avoided selecting 'role' column in case it doesn't exist, to prevent crash.
        // If it exists, it will show up in 'Users Columns'.
        console.table(users.rows);

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

inspect();
