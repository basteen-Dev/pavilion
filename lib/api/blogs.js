import { query } from '@/lib/simple-db';
import { NextResponse } from 'next/server';

const sendResponse = (data, status = 200) => {
    return NextResponse.json(data, { status });
};

export async function getBlogs(params) {
    const activeOnly = params.get('activeOnly') === 'true';
    const limit = params.get('limit') ? parseInt(params.get('limit')) : 20;

    let sql = 'SELECT id, slug, title, excerpt, image_url, published_at, is_active, created_at, tags FROM blog_posts';
    const values = [];

    if (activeOnly) {
        sql += ' WHERE is_active = true';
    }

    sql += ' ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT $1';
    values.push(limit);

    try {
        const result = await query(sql, values);
        return sendResponse(result.rows);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return sendResponse({ error: 'Failed to fetch blogs' }, 500);
    }
}

export async function getBlogBySlug(slug) {
    try {
        const result = await query('SELECT * FROM blog_posts WHERE slug = $1', [slug]);
        if (result.rows.length === 0) {
            return sendResponse({ error: 'Blog post not found' }, 404);
        }
        return sendResponse(result.rows[0]);
    } catch (error) {
        console.error('Error fetching blog by slug:', error);
        return sendResponse({ error: 'Failed to fetch blog post' }, 500);
    }
}

export async function createBlog(data) {
    const { slug, title, content, excerpt, image_url, published_at, is_active, tags } = data;

    try {
        const result = await query(
            `INSERT INTO blog_posts (slug, title, content, excerpt, image_url, published_at, is_active, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [slug, title, content, excerpt, image_url, published_at || new Date(), is_active ?? true, JSON.stringify(tags || [])]
        );
        return sendResponse(result.rows[0], 201);
    } catch (error) {
        console.error('Error creating blog:', error);
        return sendResponse({ error: 'Failed to create blog post' }, 500);
    }
}

export async function updateBlog(id, data) {
    const { slug, title, content, excerpt, image_url, published_at, is_active, tags } = data;

    try {
        const result = await query(
            `UPDATE blog_posts 
       SET slug = $1, title = $2, content = $3, excerpt = $4, image_url = $5, published_at = $6, is_active = $7, tags = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
            [slug, title, content, excerpt, image_url, published_at, is_active, JSON.stringify(tags || []), id]
        );

        if (result.rows.length === 0) {
            return sendResponse({ error: 'Blog post not found' }, 404);
        }

        return sendResponse(result.rows[0]);
    } catch (error) {
        console.error('Error updating blog:', error);
        return sendResponse({ error: 'Failed to update blog post' }, 500);
    }
}

export async function deleteBlog(id) {
    try {
        const result = await query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return sendResponse({ error: 'Blog post not found' }, 404);
        }
        return sendResponse({ success: true });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return sendResponse({ error: 'Failed to delete blog post' }, 500);
    }
}
