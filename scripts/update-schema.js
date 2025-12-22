const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.warn('.env file not found at', envPath);
}

const { query } = require('../lib/simple-db');

async function updateSchema() {
    console.log('Starting schema update...');

    try {
        // 1. Create sub_categories table
        console.log('Creating sub_categories table...');
        await query(`
      CREATE TABLE IF NOT EXISTS sub_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 2. Update categories table (add image if missing)
        console.log('Updating categories table...');
        await query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);

        // 3. Update brands table (add image if missing)
        console.log('Updating brands table...');
        await query(`
      ALTER TABLE brands 
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS logo_url TEXT;
    `);

        // 4. Update products table
        console.log('Updating products table...');
        await query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS sub_category_id INTEGER REFERENCES sub_categories(id),
      ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS short_description TEXT,
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS dealer_price DECIMAL(10, 2);
    `);

        // 5. Ensure indexes for performance
        console.log('Creating indexes...');
        await query(`
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_sub_category ON products(sub_category_id);
      CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
      CREATE INDEX IF NOT EXISTS idx_sub_categories_category ON sub_categories(category_id);
    `);

        console.log('Schema update completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();
