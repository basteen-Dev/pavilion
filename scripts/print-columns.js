const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const res = await pool.query("SELECT * FROM quotation_items LIMIT 0");
    res.fields.forEach(f => console.log(f.name));
    process.exit(0);
}

run();
