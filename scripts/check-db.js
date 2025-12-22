const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const { query } = require('../lib/simple-db');

async function checkSchema() {
    console.log('Checking database schema...');
    try {
        // Check tables
        const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Tables:', tables.rows.map(r => r.table_name));

        // Check columns in products
        const productColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `);
        console.log('Product Columns:', productColumns.rows.map(r => r.column_name));

        // Check columns in specific tables
        const subCatColumns = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sub_categories'
    `);
        console.log('Sub-category Columns:', subCatColumns.rows.map(r => r.column_name));

        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
