const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Try loading .env or .env.local manually if dotenv fails or just to be sure
const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(envLocalPath)) {
    require('dotenv').config({ path: envLocalPath });
} else {
    require('dotenv').config({ path: envPath });
}

if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not defined in environment variables.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function query(text) {
    try {
        return await pool.query(text);
    } catch (error) {
        // Ignore "column already exists" errors if we use simple ALTER TABLE
        if (error.code === '42701') {
            console.log('  -> Column already exists (skipped)');
            return;
        }
        console.error('Query error:', error.message);
        throw error;
    }
}

async function safeAddColumn(table, column, type, defaultVal = null) {
    console.log(`Adding ${column} to ${table}...`);
    try {
        let queryStr = `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type}`;
        if (defaultVal !== null) {
            queryStr += ` DEFAULT ${defaultVal}`;
        }
        await query(queryStr);
        console.log(`- Added/Verified ${column}`);
    } catch (e) {
        console.error(`- Failed to add ${column}:`, e.message);
    }
}

async function migrate() {
    console.log('Starting product schema update (v2)...');

    try {
        await safeAddColumn('products', 'a_plus_content', 'TEXT');
        await safeAddColumn('products', 'is_discontinued', 'BOOLEAN', 'FALSE');
        await safeAddColumn('products', 'is_quote_hidden', 'BOOLEAN', 'FALSE');
        await safeAddColumn('products', 'buy_url', 'TEXT');
        await safeAddColumn('products', 'tax_class', 'TEXT');
        await safeAddColumn('products', 'hsn_code', 'TEXT');
        await safeAddColumn('products', 'selling_price', 'NUMERIC(10, 2)', '0');

        console.log('Updating NULL selling_price...');
        await query(`UPDATE products SET selling_price = mrp_price WHERE selling_price IS NULL OR selling_price = 0`);

        console.log('Schema update complete.');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
