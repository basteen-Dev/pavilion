const { query } = require('../lib/simple-db');

async function inspectSchema() {
    try {
        console.log('--- Roles ---');
        const roles = await query('SELECT * FROM roles');
        console.table(roles.rows);

        console.log('\n--- Users First 5 ---');
        const users = await query('SELECT id, name, email, role_id FROM users LIMIT 5');
        console.table(users.rows);

        console.log('\n--- Users Table Columns ---');
        const userCols = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
        console.table(userCols.rows);

    } catch (err) {
        console.error('Error:', err);
    }
}

inspectSchema();
