import { query } from '@/lib/simple-db';
import { NextResponse } from 'next/server';

const sendResponse = (data, status = 200) => NextResponse.json(data, { status });

// GET /api/customers
export async function getCustomers(searchParams) {
    try {
        const search = searchParams.get('search');
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        let queryStr = `SELECT * FROM customers WHERE 1=1`;
        const params = [];
        let paramCount = 1;

        if (search) {
            queryStr += ` AND (email ILIKE $${paramCount} OR company_name ILIKE $${paramCount} OR phone ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        if (type && type !== 'all') {
            queryStr += ` AND type = $${paramCount}`;
            params.push(type);
            paramCount++;
        }

        const countQueryStr = `SELECT COUNT(*) FROM (${queryStr}) as total`;

        queryStr += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
        params.push(limit, offset);

        const [results, countResult] = await Promise.all([
            query(queryStr, params),
            query(countQueryStr, params.slice(0, params.length - 2))
        ]);

        const total = parseInt(countResult.rows[0].count);

        return sendResponse({
            customers: results.rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return sendResponse({ error: 'Failed to fetch customers' }, 500);
    }
}

// POST /api/customers
export async function createCustomer(data) {
    try {
        const { name, email, phone, address, type, company_name, gst_number, primary_contact_name, primary_contact_email, primary_contact_phone } = data;

        if (!name || !email) {
            return sendResponse({ error: 'Name and Email are required' }, 400);
        }

        const result = await query(
            `INSERT INTO customers (
                email, phone, address, type, company_name, gst_number, 
                primary_contact_name, primary_contact_email, primary_contact_phone
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                email, phone || '', address || '',
                type || 'General', company_name || name || '', gst_number || '',
                primary_contact_name || '', primary_contact_email || '', primary_contact_phone || ''
            ]
        );

        return sendResponse(result.rows[0], 201);
    } catch (error) {
        // Handle unique email constraint if it exists
        if (error.code === '23505') {
            return sendResponse({ error: 'Customer with this email already exists' }, 409);
        }
        console.error('Error creating customer:', error);
        return sendResponse({ error: 'Failed to create customer' }, 500);
    }
}

// PUT /api/customers/[id]
export async function updateCustomer(id, data) {
    try {
        const { name, email, phone, address, type, company_name, gst_number, primary_contact_name, primary_contact_email, primary_contact_phone } = data;

        const result = await query(
            `UPDATE customers SET 
                email = COALESCE($1, email), 
                phone = COALESCE($2, phone),
                address = COALESCE($3, address),
                type = COALESCE($4, type),
                company_name = COALESCE($5, company_name),
                gst_number = COALESCE($6, gst_number),
                primary_contact_name = COALESCE($7, primary_contact_name),
                primary_contact_email = COALESCE($8, primary_contact_email),
                primary_contact_phone = COALESCE($9, primary_contact_phone),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $10 RETURNING *`,
            [email, phone, address, type, company_name || name, gst_number, primary_contact_name, primary_contact_email, primary_contact_phone, id]
        );

        if (result.rows.length === 0) return sendResponse({ error: 'Customer not found' }, 404);
        return sendResponse(result.rows[0]);
    } catch (error) {
        console.error('Error updating customer:', error);
        return sendResponse({ error: 'Failed to update customer' }, 500);
    }
}
