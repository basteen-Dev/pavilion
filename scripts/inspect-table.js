const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const { query } = require('../lib/simple-db');

async function inspectTable() {
    try {
        const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'categories';
    `);
        console.log('Categories columns:', result.rows);
    } catch (err) {
        console.error(err);
    }
}

inspectTable();
