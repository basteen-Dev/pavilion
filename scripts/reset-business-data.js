const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const { query } = require('../lib/simple-db');

async function resetBusinessData() {
    console.log('WARNING: This will delete all business data (Products, Orders, Customers, etc.)!');
    console.log('Admin users and roles will be preserved.');

    // Tables to truncate
    const tables = [
        'b2b_customers',    // Missed in previous run
        'categories',       // Cascades to sub_categories -> brands -> products -> various items
        'customers',        // Cascades to addresses, orders, quotations
        'orders',
        'quotations',
    ];

    try {
        for (const table of tables) {
            console.log(`Truncating ${table}...`);
            await query(`TRUNCATE TABLE ${table} CASCADE;`);
        }

        // Also delete users with role 'customer' to clean up login accounts
        console.log('Deleting customer users...');
        await query(`DELETE FROM users WHERE role = 'customer';`);

        console.log('Reset complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error resetting data:', err);
        process.exit(1);
    }
}

resetBusinessData();
