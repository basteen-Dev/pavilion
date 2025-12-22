const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const { query } = require('../lib/simple-db');

async function updateSchemaBrands() {
    console.log('Updating brands schema...');

    try {
        // 1. Add category_id and sub_category_id to brands table
        console.log('Adding columns to brands table...');
        await query(`
      ALTER TABLE brands 
      ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id),
      ADD COLUMN IF NOT EXISTS sub_category_id INTEGER REFERENCES sub_categories(id);
    `);

        // 2. Create indexes for performance
        console.log('Creating indexes...');
        await query(`
      CREATE INDEX IF NOT EXISTS idx_brands_category ON brands(category_id);
      CREATE INDEX IF NOT EXISTS idx_brands_sub_category ON brands(sub_category_id);
    `);

        console.log('Brands schema update completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating brands schema:', error);
        process.exit(1);
    }
}

updateSchemaBrands();
