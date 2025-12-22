const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('Ensuring quotation_items table columns...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Add total_price if not exists
        await client.query(`ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS total_price NUMERIC(15, 2) DEFAULT 0`);

        // Ensure mrp and discount exist (already added in previous steps, but good to double check)
        await client.query(`ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS mrp NUMERIC(15, 2) DEFAULT 0`);
        await client.query(`ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS discount NUMERIC(5, 2) DEFAULT 0`);

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
    } finally {
        client.release();
        process.exit(0);
    }
}

migrate();
