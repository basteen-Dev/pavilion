const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const { query } = require('../lib/simple-db');

async function updateBrandConstraints() {
    console.log('Relaxing brand name/slug uniqueness constraints...');

    try {
        // 1. Drop existing global unique constraints
        console.log('Dropping existing unique constraints...');
        // We try to drop known names or by column. 
        // Constraint names usually: brands_name_key, brands_slug_key (if auto-created)

        // Attempt to drop constraints safely
        await query(`ALTER TABLE brands DROP CONSTRAINT IF EXISTS brands_name_key;`);
        await query(`ALTER TABLE brands DROP CONSTRAINT IF EXISTS brands_slug_key;`);

        // 2. Add new scoped unique constraints
        // (name, sub_category_id) and (slug, sub_category_id)
        // If sub_category_id is NULL (category only brand), we should also consider that?
        // Postgres treats NULLs as distinct so multiple (Name, NULL) can exist. 
        // To enforcing uniqueness even for NULLs (i.e. per category), we might need COALESCE or partial indexes. 
        // But for now, standard composite unique is likely what the user expects for sub-categories. 
        // The user specifically mentioned "different sub category".

        console.log('Adding scoped unique constraints...');
        await query(`
        CREATE UNIQUE INDEX IF NOT EXISTS brands_name_sub_category_idx 
        ON brands (name, sub_category_id);
    `);

        await query(`
        CREATE UNIQUE INDEX IF NOT EXISTS brands_slug_sub_category_idx 
        ON brands (slug, sub_category_id);
    `);

        console.log('Constraints updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating brand constraints:', error);
        process.exit(1);
    }
}

updateBrandConstraints();
