const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const { query } = require('../lib/simple-db');

async function updateSchemaCascadeQuotes() {
    console.log('Updating schema with ON DELETE CASCADE for Quotes and Orders...');

    const updateConstraint = async (table, column, refTable, constraintName) => {
        console.log(`Updating ${table}.${column} -> ${refTable} (Constraint: ${constraintName})`);

        try {
            // Drop existing constraint
            await query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${constraintName};`);

            // Add new constraint with CASCADE
            await query(`
            ALTER TABLE ${table} 
            ADD CONSTRAINT ${constraintName} 
            FOREIGN KEY (${column}) 
            REFERENCES ${refTable}(id) 
            ON DELETE CASCADE;
        `);
            console.log(`Successfully updated ${table} constraint.`);
        } catch (error) {
            console.error(`Error updating ${table} constraint:`, error.message);
            // Don't exit on error, try next one
        }
    };

    try {
        // 1. Quotation Items -> Products
        // The error confirmed the name: quotation_items_product_id_fkey
        await updateConstraint('quotation_items', 'product_id', 'products', 'quotation_items_product_id_fkey');

        // 2. Order Items -> Products (if exists)
        // Assuming standard naming: order_items_product_id_fkey
        // checking if table exists first prevents crash? No, the try/catch inside helper handles it.
        await updateConstraint('order_items', 'product_id', 'products', 'order_items_product_id_fkey');

        // 3. Cart Items -> Products (if exists, good practice)
        // await updateConstraint('cart_items', 'product_id', 'products', 'cart_items_product_id_fkey');

        console.log('Schema update completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateSchemaCascadeQuotes();
