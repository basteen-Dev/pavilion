const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkSorting() {
    try {
        console.log('--- Banners ---');
        const banners = await pool.query('SELECT id, title, display_order FROM banners ORDER BY id ASC');
        console.log(JSON.stringify(banners.rows, null, 2));

        console.log('\n--- Collections ---');
        const collections = await pool.query('SELECT id, name, slug FROM parent_collections ORDER BY id ASC');
        console.log(JSON.stringify(collections.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkSorting();
