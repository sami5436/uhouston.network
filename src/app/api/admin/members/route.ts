import { NextRequest, NextResponse } from 'next/server';
import { getMembers, setMembers } from '@/lib/store';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function checkAuth(request: NextRequest): boolean {
    const password = request.headers.get('x-admin-password');
    return password === ADMIN_PASSWORD;
}

// GET - list all current members
export async function GET(request: NextRequest) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const members = await getMembers();
    return NextResponse.json({ members });
}

// PUT - update a member
export async function PUT(request: NextRequest) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id) {
        return NextResponse.json({ error: 'Member id required' }, { status: 400 });
    }

    const members = await getMembers();
    const index = members.findIndex(m => m.id === body.originalId || m.id === body.id);
    if (index === -1) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    members[index] = {
        id: body.id,
        name: body.name,
        website: body.website,
        program: body.program || undefined,
        year: body.year || undefined,
        profilePic: body.profilePic || undefined,
        instagram: body.instagram || undefined,
        twitter: body.twitter || undefined,
        linkedin: body.linkedin || undefined,
        connections: body.connections?.length ? body.connections : undefined,
    };

    await setMembers(members);
    return NextResponse.json({ success: true });
}

// DELETE - remove a member
export async function DELETE(request: NextRequest) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id) {
        return NextResponse.json({ error: 'Member id required' }, { status: 400 });
    }

    const members = await getMembers();
    const filtered = members.filter(m => m.id !== body.id);

    if (filtered.length === members.length) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    await setMembers(filtered);
    return NextResponse.json({ success: true });
}
