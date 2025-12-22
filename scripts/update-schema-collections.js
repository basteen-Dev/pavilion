const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const { query } = require('../lib/simple-db');

async function updateSchemaCollections() {
    console.log('Updating schema for Parent Collections...');

    try {
        // 1. Create parent_collections table
        console.log('Creating parent_collections table...');
        await query(`
      CREATE TABLE IF NOT EXISTS parent_collections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        image_desktop TEXT,
        image_mobile TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 2. Add parent_collection_id to categories table
        console.log('Adding parent_collection_id column to categories...');
        // check if exists first to allow re-running
        const checkCol = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='categories' AND column_name='parent_collection_id'
    `);

        if (checkCol.rows.length === 0) {
            await query(`
        ALTER TABLE categories 
        ADD COLUMN parent_collection_id UUID REFERENCES parent_collections(id) ON DELETE SET NULL;
      `);
            console.log('Column added.');
        } else {
            console.log('Column already exists.');
        }

        // 3. Create index for performance
        await query(`
      CREATE INDEX IF NOT EXISTS idx_categories_parent_collection 
      ON categories(parent_collection_id);
    `);

        console.log('Schema update complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateSchemaCollections();
