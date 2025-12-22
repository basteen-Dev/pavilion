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

async function updateSchema() {
    console.log('Starting Robust CMS schema update...');

    try {
        // 1. Create banners table
        console.log('Handling banners table...');
        await query(`
            CREATE TABLE IF NOT EXISTS banners (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255),
                desktop_image_url TEXT NOT NULL,
                mobile_image_url TEXT,
                link TEXT,
                display_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Ensure indexes
        await query(`CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order);`);


        // 2. Handle blog_posts table
        console.log('Handling blog_posts table...');
        // First create if it completely doesn't exist
        await query(`
            CREATE TABLE IF NOT EXISTS blog_posts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Now add columns one by one if they don't exist
        const columns = [
            { name: 'slug', type: 'VARCHAR(255) UNIQUE' }, // Note: UNIQUE constraint in ADD COLUMN might fail if duplicates exist, but we assume empty or valid
            { name: 'title', type: 'VARCHAR(500)' },
            { name: 'content', type: 'TEXT' },
            { name: 'excerpt', type: 'TEXT' },
            { name: 'image_url', type: 'TEXT' },
            { name: 'author_id', type: 'UUID' }, // Constraint can be added separately
            { name: 'published_at', type: 'TIMESTAMP WITH TIME ZONE' },
            { name: 'is_active', type: 'BOOLEAN DEFAULT true' },
            { name: 'tags', type: "JSONB DEFAULT '[]'::jsonb" }
        ];

        for (const col of columns) {
            try {
                // Check if column exists
                const check = await query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'blog_posts' AND column_name = $1
                `, [col.name]);

                if (check.rows.length === 0) {
                    console.log(`Adding ${col.name} to blog_posts...`);
                    await query(`ALTER TABLE blog_posts ADD COLUMN ${col.name} ${col.type}`);

                    // Specific fix for NOT NULL on title if we just added it
                    if (col.name === 'title' || col.name === 'slug') {
                        // We don't enforce NOT NULL immediately to avoid error on existing rows
                    }
                }
            } catch (err) {
                console.warn(`Warning adding column ${col.name}:`, err.message);
            }
        }

        // Add constraints if missing (ignoring errors if they exist)
        try { await query('ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug)'); } catch (e) { }
        try { await query('CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)'); } catch (e) { }
        try { await query('CREATE INDEX IF NOT EXISTS idx_blog_posts_active ON blog_posts(is_active)'); } catch (e) { }


        // 3. Handle cms_pages table
        console.log('Handling cms_pages table...');
        await query(`
            CREATE TABLE IF NOT EXISTS cms_pages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                slug VARCHAR(255) UNIQUE NOT NULL,
                title VARCHAR(500) NOT NULL,
                content TEXT,
                meta_title VARCHAR(500),
                meta_description TEXT,
                meta_keywords TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Add content_blocks and image_url
        const cmsColumns = [
            { name: 'content_blocks', type: "JSONB DEFAULT '[]'::jsonb" },
            { name: 'image_url', type: 'TEXT' }
        ];

        for (const col of cmsColumns) {
            try {
                const check = await query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'cms_pages' AND column_name = $1
                `, [col.name]);
                if (check.rows.length === 0) {
                    console.log(`Adding ${col.name} to cms_pages...`);
                    await query(`ALTER TABLE cms_pages ADD COLUMN ${col.name} ${col.type}`);
                }
            } catch (err) {
                console.warn(`Warning adding column ${col.name} to cms_pages:`, err.message);
            }
        }

        console.log('CMS Schema update completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating CMS schema:', error);
        process.exit(1);
    }
}

updateSchema();
