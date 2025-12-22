const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runTest() {
    const client = await pool.connect();
    try {
        console.log('Starting full verification...');
        await client.query('BEGIN');

        // 1. Create Customer
        console.log('1. Creating Customer...');
        const custRes = await client.query(
            `INSERT INTO customers (email, company_name, type) 
             VALUES ($1, $2, $3) RETURNING id`,
            ['test_flow_' + Date.now() + '@example.com', 'Flow Test Corp', 'General']
        );
        const customerId = custRes.rows[0].id;
        console.log('   Customer created ID:', customerId);

        // 2. Create Quotation with Items
        console.log('2. Creating Quotation...');
        const quoteRef = `QT-TEST-${Date.now()}`;

        // Insert Quotation
        const quoteRes = await client.query(
            `INSERT INTO quotations (
                customer_id, status, show_total, customer_snapshot, total_amount, reference_number, quotation_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [
                customerId,
                'Draft',
                true,
                JSON.stringify({ name: 'Flow Test Corp', email: 'test@example.com' }),
                1000.00,
                quoteRef,
                quoteRef
            ]
        );
        const quoteId = quoteRes.rows[0].id;
        console.log('   Quotation created ID:', quoteId);

        // 2a. Get a real product ID
        console.log('2a. Fetching a real product ID...');
        const prodRes = await client.query(`SELECT id FROM products LIMIT 1`);
        if (prodRes.rows.length === 0) throw new Error('No products found in DB to test with');
        const productId = prodRes.rows[0].id;
        console.log('   Using Product ID:', productId);

        // 3. Insert Quotation Item
        console.log('3. Inserting Quotation Item...');
        await client.query(
            `INSERT INTO quotation_items (
                quotation_id, product_id, product_name, quantity, unit_price, total_price, line_total, mrp, discount
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                quoteId,
                productId, // Use real product ID
                'Test Product',
                2,
                500.00,
                1000.00,
                1000.00, // line_total
                600.00,
                10.00
            ]
        );
        console.log('   Item inserted successfully.');

        // 4. Verify Data retrieval
        console.log('4. Verifying Data...');
        const checkRes = await client.query(`SELECT * FROM quotations WHERE id = $1`, [quoteId]);
        if (checkRes.rows.length === 0) throw new Error('Quotation not found');

        const itemsRes = await client.query(`SELECT * FROM quotation_items WHERE quotation_id = $1`, [quoteId]);
        if (itemsRes.rows.length === 0) throw new Error('Items not found');
        console.log('   Verification successful.');

        // Cleanup
        await client.query('ROLLBACK'); // Rollback to not pollute DB
        console.log('Test completed successfully (Changes rolled back).');
        process.exit(0);

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Verification FAILED:', e);
        process.exit(1);
    } finally {
        client.release();
    }
}

runTest();
