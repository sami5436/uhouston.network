import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const MAX_SIZE = 500 * 1024; // 500 KB

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: `Image must be under 500 KB (yours is ${Math.round(file.size / 1024)} KB)` },
                { status: 400 }
            );
        }

        const result = await put(`photos/${Date.now()}`, file, {
            access: 'public',
            addRandomSuffix: true,
            contentType: file.type,
        });

        return NextResponse.json({ url: result.url });
    } catch {
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
