const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function inspectSchema() {
    try {
        console.log('Inspecting customers table schema...');
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'customers'
            ORDER BY ordinal_position;
        `);

        if (res.rows.length === 0) {
            console.log('Table "customers" not found or has no columns.');
        } else {
            console.table(res.rows);
        }
        process.exit(0);
    } catch (err) {
        console.error('Error inspecting schema:', err);
        process.exit(1);
    }
}

inspectSchema();
