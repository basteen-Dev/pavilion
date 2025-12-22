const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('Relaxing phone constraint...');
    try {
        await pool.query(`ALTER TABLE customers ALTER COLUMN phone DROP NOT NULL`);
        console.log('phone is now nullable.');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrate();
