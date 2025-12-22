const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('Updating Quotation Items Schema...');
    try {
        await pool.query(`ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS mrp NUMERIC(15, 2) DEFAULT 0`);
        await pool.query(`ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS discount NUMERIC(5, 2) DEFAULT 0`);
        console.log('Added mrp and discount columns to quotation_items');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
