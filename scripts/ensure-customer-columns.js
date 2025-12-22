const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('Ensuring customer table columns...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Add company_name if not exists
        await client.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS company_name VARCHAR(255)`);

        // Add type if not exists
        await client.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'General'`);

        // Add gst_number if not exists
        await client.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS gst_number VARCHAR(50)`);

        // Add primary_contact_name if not exists
        await client.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS primary_contact_name VARCHAR(255)`);

        // Add primary_contact_email if not exists
        await client.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS primary_contact_email VARCHAR(255)`);

        // Add primary_contact_phone if not exists
        await client.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS primary_contact_phone VARCHAR(50)`);

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
