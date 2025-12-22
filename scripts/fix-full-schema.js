const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const { query } = require('../lib/simple-db');

async function fixSchema() {
    console.log('Fixing database schema...');

    try {
        // 1. Create sub_categories table if not exists
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

        // 2. Create index for sub_categories
        await query(`CREATE INDEX IF NOT EXISTS idx_sub_categories_category ON sub_categories(category_id);`);

        // 3. Update brands table columns
        console.log('Updating brands table...');
        await query(`
      ALTER TABLE brands 
      ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS sub_category_id INTEGER REFERENCES sub_categories(id) ON DELETE SET NULL;
    `);

        // 4. Update products table columns
        console.log('Updating products table...');
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

        // 5. Fix Foreign Key Constraints if needed (Optional, but good for safety)
        // We can't easily ALTER CONSTRAINT in postgres without dropping it first.
        // For now, ensuring the tables exist is the priority.

        console.log('Schema fix completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing schema:', error);
        process.exit(1);
    }
}

fixSchema();
