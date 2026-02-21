import { NextRequest, NextResponse } from 'next/server';
import { getSubmissions, setSubmissions } from '@/lib/store';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name || !body.name.trim()) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        if (!body.website || !body.website.trim()) {
            return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
        }

        const id = body.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const connections = body.connections
            ? body.connections.split(',').map((c: string) => c.trim()).filter((c: string) => c)
            : [];

        const submission = {
            id,
            name: body.name.trim(),
            website: body.website.trim(),
            program: body.program?.trim() || undefined,
            year: body.year?.trim() || undefined,
            instagram: body.instagram?.trim() || undefined,
            twitter: body.twitter?.trim() || undefined,
            linkedin: body.linkedin?.trim() || undefined,
            connections: connections.length > 0 ? connections : undefined,
            submittedAt: new Date().toISOString(),
        };

        const submissions = await getSubmissions();
        submissions.push(submission);
        await setSubmissions(submissions);

        return NextResponse.json({ success: true, id: submission.id });
    } catch {
        return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
    }
}
