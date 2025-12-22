const { getPool } = require('../lib/simple-db');

async function checkSchema() {
    const pool = getPool();
    try {
        const res = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'products'");
        console.log('Product Columns:', res.rows.map(r => `${r.column_name} (${r.data_type}, ${r.is_nullable})`));

        const imagesType = res.rows.find(r => r.column_name === 'images');
        console.log('Images column type:', imagesType);

        const sellingPrice = res.rows.find(r => r.column_name === 'selling_price');
        console.log('Selling Price column:', sellingPrice);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSchema();
