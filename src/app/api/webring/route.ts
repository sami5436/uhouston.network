import { NextRequest, NextResponse } from 'next/server';
import { getMembers } from '@/lib/store';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user');

    const members = await getMembers();
    const user = userId ? members.find(m => m.id === userId) : null;

    let targetMembers;

    if (user && user.connections && user.connections.length > 0) {
        targetMembers = members.filter(m =>
            user.connections!.includes(m.id) && m.website && m.website.trim()
        );
    } else {
        targetMembers = members.filter(m =>
            m.website && m.website.trim() && m.id !== userId
        );
    }

    return NextResponse.json({
        members: targetMembers.map(m => ({
            id: m.id,
            name: m.name,
            website: m.website,
        })),
    }, {
        headers: corsHeaders,
    });
}
