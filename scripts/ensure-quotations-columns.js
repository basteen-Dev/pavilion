const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('Ensuring quotations table columns...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Add customer_snapshot if not exists
        await client.query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS customer_snapshot JSONB`);

        // Add show_total if not exists
        await client.query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS show_total BOOLEAN DEFAULT TRUE`);

        // Add reference_number if not exists
        await client.query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS reference_number VARCHAR(50)`);

        // Add status if not exists
        await client.query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Draft'`);

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
