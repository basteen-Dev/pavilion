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
    console.log('Starting CMS schema update...');

    try {
        // 1. Create banners table
        console.log('Creating/Updating banners table...');
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
            CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
            CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order);
        `);

        // 2. Ensure blog_posts table exists (User said it exists, but we ensure schema matches)
        console.log('Ensuring blog_posts table schema...');
        await query(`
            CREATE TABLE IF NOT EXISTS blog_posts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                slug VARCHAR(255) UNIQUE NOT NULL,
                title VARCHAR(500) NOT NULL,
                content TEXT,
                excerpt TEXT,
                image_url TEXT,
                author_id UUID REFERENCES users(id),
                published_at TIMESTAMP WITH TIME ZONE,
                is_active BOOLEAN DEFAULT true,
                tags JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
            CREATE INDEX IF NOT EXISTS idx_blog_posts_active ON blog_posts(is_active);
        `);

        // 3. Ensure cms_pages has content_blocks
        console.log('Updating cms_pages table...');
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

        await query(`
            ALTER TABLE cms_pages 
            ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS image_url TEXT;
        `);

        console.log('CMS Schema update completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating CMS schema:', error);
        process.exit(1);
    }
}

updateSchema();
