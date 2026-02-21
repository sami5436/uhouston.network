import { NextRequest, NextResponse } from 'next/server';
import { getSubmissions, setSubmissions, getMembers, setMembers, Member } from '@/lib/store';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function checkAuth(request: NextRequest): boolean {
    const password = request.headers.get('x-admin-password');
    return password === ADMIN_PASSWORD;
}

// GET - list all pending submissions
export async function GET(request: NextRequest) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const submissions = await getSubmissions();
        return NextResponse.json({ submissions });
    } catch (err) {
        console.error('GET /api/admin error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// POST - approve or reject a submission
export async function POST(request: NextRequest) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, action } = body;

        if (!id || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const submissions = await getSubmissions();
        const index = submissions.findIndex((s) => s.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        if (action === 'approve') {
            const submission = submissions[index];
            const newMember: Member = {
                id: submission.id,
                name: submission.name,
                website: submission.website,
                program: submission.program,
                year: submission.year,
                instagram: submission.instagram,
                twitter: submission.twitter,
                linkedin: submission.linkedin,
                connections: submission.connections,
            };

            const members = await getMembers();
            members.push(newMember);
            await setMembers(members);
        }

        // Remove from submissions
        submissions.splice(index, 1);
        await setSubmissions(submissions);

        return NextResponse.json({
            success: true,
            action,
            remaining: submissions.length
        });
    } catch (err) {
        console.error('POST /api/admin error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
