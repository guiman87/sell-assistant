import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;
    
    // Determine upload directory - must match the upload route logic
    // In production (Add-on), this should be /data/uploads
    // In development, it defaults to public/uploads for backward compatibility or local testing
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public/uploads');
    const filepath = path.join(uploadDir, filename);

    if (!existsSync(filepath)) {
        return new NextResponse('File not found', { status: 404 });
    }

    try {
        const fileBuffer = await readFile(filepath);
        // Determine content type based on extension
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        if (ext === '.png') contentType = 'image/png';
        if (ext === '.webp') contentType = 'image/webp';
        if (ext === '.gif') contentType = 'image/gif';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error reading file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
