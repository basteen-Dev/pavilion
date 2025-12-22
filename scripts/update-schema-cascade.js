const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const { query } = require('../lib/simple-db');

async function updateSchemaCascade() {
    console.log('Updating schema with ON DELETE CASCADE and fixing brands...');

    try {
        // 1. Fix brands table (Add image_url if missing)
        console.log('Checking brands table for image_url...');
        await query(`
      ALTER TABLE brands 
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);

        // 2. Helper to safe drop and add FK
        const updateConstraint = async (table, column, refTable, constraintName) => {
            console.log(`Updating ${table}.${column} -> ${refTable} (Constraint: ${constraintName})`);

            // Drop existing constraint
            await query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${constraintName};`);

            // Add new constraint with CASCADE
            // Note: Assuming ID types match (UUID/UUID or INT/INT). 
            // We verified categories.id is UUID. 
            // sub_categories.id is SERIAL (INT). 
            // brands.id is UUID.

            await query(`
            ALTER TABLE ${table} 
            ADD CONSTRAINT ${constraintName} 
            FOREIGN KEY (${column}) 
            REFERENCES ${refTable}(id) 
            ON DELETE CASCADE;
        `);
        };

        // 3. Update Constraints
        // 3a. Sub-categories -> Categories (UUID)
        await updateConstraint('sub_categories', 'category_id', 'categories', 'sub_categories_category_id_fkey');

        // 3b. Brands -> Categories (UUID)
        await updateConstraint('brands', 'category_id', 'categories', 'brands_category_id_fkey');

        // 3c. Brands -> Sub-categories (INT)
        await updateConstraint('brands', 'sub_category_id', 'sub_categories', 'brands_sub_category_id_fkey');

        // 3d. Products -> Categories (UUID)
        await updateConstraint('products', 'category_id', 'categories', 'products_category_id_fkey');

        // 3e. Products -> Sub-categories (INT)
        await updateConstraint('products', 'sub_category_id', 'sub_categories', 'products_sub_category_id_fkey');

        // 3f. Products -> Brands (UUID)
        await updateConstraint('products', 'brand_id', 'brands', 'products_brand_id_fkey');

        console.log('Schema update completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateSchemaCascade();
