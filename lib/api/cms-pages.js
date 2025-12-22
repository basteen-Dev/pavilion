import { query } from '@/lib/simple-db';
import { NextResponse } from 'next/server';

const sendResponse = (data, status = 200) => {
    return NextResponse.json(data, { status });
};

export async function getCMSPages(params) {
    let sql = 'SELECT id, slug, title, is_active, updated_at FROM cms_pages ORDER BY title ASC';

    try {
        const result = await query(sql);
        return sendResponse(result.rows);
    } catch (error) {
        console.error('Error fetching CMS pages:', error);
        return sendResponse({ error: 'Failed to fetch CMS pages' }, 500);
    }
}

export async function getCMSPageBySlug(slug) {
    try {
        const result = await query('SELECT * FROM cms_pages WHERE slug = $1', [slug]);
        if (result.rows.length === 0) {
            return sendResponse({ error: 'Page not found' }, 404);
        }
        return sendResponse(result.rows[0]);
    } catch (error) {
        console.error('Error fetching CMS page by slug:', error);
        return sendResponse({ error: 'Failed to fetch CMS page' }, 500);
    }
}

export async function createCMSPage(data) {
    const { slug, title, content, meta_title, meta_description, is_active, content_blocks } = data;

    try {
        const result = await query(
            `INSERT INTO cms_pages (slug, title, content, meta_title, meta_description, is_active, content_blocks)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [slug, title, content, meta_title, meta_description, is_active ?? true, JSON.stringify(content_blocks || [])]
        );
        return sendResponse(result.rows[0], 201);
    } catch (error) {
        console.error('Error creating CMS page:', error);
        return sendResponse({ error: 'Failed to create CMS page' }, 500);
    }
}

export async function updateCMSPage(id, data) {
    const { slug, title, content, meta_title, meta_description, is_active, content_blocks } = data;

    try {
        const result = await query(
            `UPDATE cms_pages 
       SET slug = $1, title = $2, content = $3, meta_title = $4, meta_description = $5, is_active = $6, content_blocks = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
            [slug, title, content, meta_title, meta_description, is_active, JSON.stringify(content_blocks || []), id]
        );

        if (result.rows.length === 0) {
            return sendResponse({ error: 'Page not found' }, 404);
        }

        return sendResponse(result.rows[0]);
    } catch (error) {
        console.error('Error updating CMS page:', error);
        return sendResponse({ error: 'Failed to update CMS page' }, 500);
    }
}

export async function deleteCMSPage(id) {
    try {
        const result = await query('DELETE FROM cms_pages WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return sendResponse({ error: 'Page not found' }, 404);
        }
        return sendResponse({ success: true });
    } catch (error) {
        console.error('Error deleting CMS page:', error);
        return sendResponse({ error: 'Failed to delete CMS page' }, 500);
    }
}
