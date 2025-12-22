const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined
});

async function relaxConstraint() {
    try {
        console.log('Relaxing constraint on selling_price...');
        // Alter column to drop NOT NULL if it exists
        await pool.query('ALTER TABLE products ALTER COLUMN selling_price DROP NOT NULL');
        console.log('Constraint relaxed (nullable).');

        // Also set default to 0 if not set
        await pool.query('ALTER TABLE products ALTER COLUMN selling_price SET DEFAULT 0');
        console.log('Default value set to 0.');

        process.exit(0);
    } catch (e) {
        console.error(e);
        // If it fails due to connection, we can't do much, but we tried.
        process.exit(1);
    }
}

relaxConstraint();
