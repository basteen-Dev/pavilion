const { query } = require('./lib/simple-db');

async function checkSchema() {
    try {
        const tables = ['blogs', 'cms_pages'];
        for (const table of tables) {
            console.log(`Checking schema for ${table}:`);
            const res = await query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);
            console.log(res.rows.map(r => `${r.column_name}: ${r.data_type}`).join('\n'));
            console.log('---');
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkSchema();
