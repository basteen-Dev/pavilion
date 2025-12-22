const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.warn('.env file not found at', envPath);
}

const { query } = require('../lib/simple-db');

async function inspectSchema() {
    console.log('Inspecting schema...');
    try {
        const banners = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'banners'
        `);

        const blogs = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'blog_posts'
        `);

        const output = {
            banners: banners.rows,
            blogs: blogs.rows
        };

        fs.writeFileSync(path.join(__dirname, '../inspect_output.txt'), JSON.stringify(output, null, 2));
        console.log('Inspection written to inspect_output.txt');

        process.exit(0);
    } catch (error) {
        console.error('Error inspecting schema:', error);
        process.exit(1);
    }
}

inspectSchema();
