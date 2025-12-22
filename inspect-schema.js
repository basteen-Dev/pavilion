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

async function inspect() {
    try {
        const banners = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'banners'");
        console.log('--- BANNERS COLS ---');
        console.log(JSON.stringify(banners.rows));

        const collections = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'parent_collections'");
        console.log('\n--- COLLECTIONS COLS ---');
        console.log(JSON.stringify(collections.rows));

        const bannerData = await pool.query("SELECT id, title, created_at FROM banners ORDER BY id ASC LIMIT 5");
        console.log('\n--- BANNERS DATA ---');
        console.log(JSON.stringify(bannerData.rows));

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

inspect();
