const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function query(text) {
    try {
        await pool.query(text);
    } catch (error) {
        if (error.code === '42701') { // duplicate_column
            console.log('  -> Column already exists (skipped)');
            return;
        }
        console.error('Query error:', error.message);
    }
}

async function migrate() {
    console.log('Starting Quotation & Customer Schema Update...');

    try {
        // 1. Customers Table Updates
        console.log('Updating customers table...');

        // Check if customers table exists, if not create it (it should exist based on previous context, but good to be safe or just alter)
        // Assuming it basically exists with id, name, email etc. 
        // We will just add columns.

        await query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'General'`);
        await query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS primary_contact_name TEXT`);
        await query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS primary_contact_email TEXT`);
        await query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS primary_contact_phone TEXT`);
        await query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS company_name TEXT`);
        await query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS gst_number TEXT`);

        console.log('- Verified customers columns');

        // 2. Quotations Table Updates
        console.log('Updating quotations table...');

        // Check/Create quotations table if not exists (it might not exist properly yet or be very basic)
        // Let's ensure the base table exists first.
        await query(`
            CREATE TABLE IF NOT EXISTS quotations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
                total_amount NUMERIC(15, 2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft'`);
        await query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS show_total BOOLEAN DEFAULT TRUE`);
        await query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS customer_snapshot JSONB`);
        await query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS reference_number TEXT`); // User friendly ID e.g. QT-1001

        // 3. Quotation Items Table (Ensure it exists)
        await query(`
            CREATE TABLE IF NOT EXISTS quotation_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
                product_id UUID REFERENCES products(id) ON DELETE SET NULL,
                product_name TEXT, -- Snapshot in case product deleted
                quantity INTEGER DEFAULT 1,
                unit_price NUMERIC(15, 2), -- Price at time of quote
                total_price NUMERIC(15, 2)
            )
        `);

        // Add additional columns to items if needed
        await query(`ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS variant_info JSONB`); // Size/Color selected

        console.log('- Verified quotations schema');

        console.log('Migration complete.');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
