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
        const banners = await pool.query("SELECT * FROM banners LIMIT 1");
        const colsB = banners.rows[0] ? Object.keys(banners.rows[0]) : [];

        const collections = await pool.query("SELECT * FROM parent_collections LIMIT 1");
        const colsC = collections.rows[0] ? Object.keys(collections.rows[0]) : [];

        const output = `BANNERS: ${colsB.join(', ')}\nCOLLECTIONS: ${colsC.join(', ')}`;
        fs.writeFileSync('schema_info.txt', output);
        console.log('Schema info written to schema_info.txt');
    } catch (err) {
        fs.writeFileSync('schema_info_error.txt', err.stack);
    } finally {
        await pool.end();
    }
}

run();
