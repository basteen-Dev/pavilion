const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const banners = await pool.query("SELECT id, title, created_at FROM banners ORDER BY created_at ASC");
        const collections = await pool.query("SELECT id, name, created_at FROM parent_collections ORDER BY created_at ASC");

        const output = {
            banners: banners.rows,
            collections: collections.rows
        };
        fs.writeFileSync('sort_check.json', JSON.stringify(output, null, 2));
        console.log('Sort check data written to sort_check.json');
    } catch (err) {
        fs.writeFileSync('sort_check_error.txt', err.stack);
    } finally {
        await pool.end();
    }
}

run();
