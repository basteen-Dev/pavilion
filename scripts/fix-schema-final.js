const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const { query } = require('../lib/simple-db');

async function fixSchemaFinal() {
    console.log('Fixing database schema with correct UUID types...');

    try {
        // 1. Create sub_categories table
        console.log('Creating sub_categories table...');
        // Note: category_id is UUID
        await query(`
      CREATE TABLE IF NOT EXISTS sub_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 2. Create index for sub_categories
        await query(`CREATE INDEX IF NOT EXISTS idx_sub_categories_category ON sub_categories(category_id);`);

        // 3. Update brands table columns
        console.log('Updating brands table...');
        // Check if columns exist first to avoid errors if they are partially there with wrong types
        // But IF NOT EXISTS handles existence. If they exist with wrong type, we might need to alter.
        // Let's assume they don't exist because previous scripts failed.

        await query(`
      ALTER TABLE brands 
      ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS sub_category_id INTEGER REFERENCES sub_categories(id) ON DELETE SET NULL;
    `);

        // 4. Update products table columns
        console.log('Updating products table...');
        // products.category_id is already there (UUID).
        // products.sub_category_id should be INTEGER (referencing sub_categories.id)
        await query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS sub_category_id INTEGER REFERENCES sub_categories(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS short_description TEXT,
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS dealer_price DECIMAL(10, 2);
    `);

        console.log('Schema fix completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing schema:', error);
        process.exit(1);
    }
}

fixSchemaFinal();
