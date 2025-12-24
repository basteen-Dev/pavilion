require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('--- Starting Migration ---');

        // 1. Add last_active_at column
        console.log('Adding last_active_at column...');
        await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    `);

        // 2. Ensure Superadmin has role_id
        console.log('Fixing Superadmin role_id...');
        // Find superadmin role id
        const roleRes = await client.query("SELECT id FROM roles WHERE name = 'superadmin'");
        if (roleRes.rows.length > 0) {
            const roleId = roleRes.rows[0].id;
            // Update users with email containing 'admin' and null role_id
            await client.query(`
            UPDATE users 
            SET role_id = $1, role = 'superadmin' 
            WHERE (email LIKE '%admin%' OR role = 'superadmin') AND role_id IS NULL
        `, [roleId]);
        }

        console.log('Migration Complete');
    } catch (err) {
        console.error('Migration Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
