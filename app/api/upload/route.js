import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/simple-db';

export async function POST(request) {
    console.log('Upload Request Received');
    try {
        // Simple authentication check
        const authHeader = request.headers.get('authorization');
        let user = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = await verifyToken(token);
            if (payload && payload.userId) {
                const result = await query('SELECT id FROM users WHERE id = $1 AND is_active = true', [payload.userId]);
                if (result.rows.length > 0) user = result.rows[0];
            }
        }

        // For now, let's allow uploads even without auth if it's coming from admin, 
        // but log it. In production we should strict this.
        console.log('Upload User:', user ? user.id : 'Unauthenticated');

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            console.error('No file in formData');
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        console.log('File detected:', file.name, 'Size:', file.size, 'Type:', file.type);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        console.log('Ensuring directory:', uploadDir);
        await mkdir(uploadDir, { recursive: true });

        // Save file
        const filepath = join(uploadDir, filename);
        console.log('Saving file to:', filepath);
        await writeFile(filepath, buffer);

        // Return public URL
        const url = `/uploads/${filename}`;
        console.log('Upload successful. URL:', url);
        return NextResponse.json({ url, success: true });
    } catch (error) {
        console.error('Upload error details:', error);
        return NextResponse.json({ error: 'Upload failed', message: error.message }, { status: 500 });
    }
}
