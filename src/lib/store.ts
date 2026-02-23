import { put, list } from '@vercel/blob';

export interface Member {
    id: string;
    name: string;
    website: string;
    program?: string;
    year?: string;
    profilePic?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    connections?: string[];
}

export interface Connection {
    fromId: string;
    toId: string;
}

export interface Submission extends Member {
    submittedAt: string;
}

const MEMBERS_BLOB = 'members.json';
const SUBMISSIONS_BLOB = 'submissions.json';

// ---- Blob helpers ----

// Cache download URLs for the lifetime of the function instance.
// Warm serverless instances reuse this, skipping the list() lookup on repeat calls.
const urlCache: Record<string, string> = {};

async function readBlob<T>(filename: string, fallback: T[]): Promise<T[]> {
    try {
        let downloadUrl = urlCache[filename];

        if (!downloadUrl) {
            const { blobs } = await list({ prefix: filename });
            if (blobs.length === 0) return fallback;
            downloadUrl = blobs[0].downloadUrl;
            urlCache[filename] = downloadUrl;
        }

        const res = await fetch(downloadUrl);
        if (!res.ok) return fallback;
        return await res.json();
    } catch (err) {
        console.error(`readBlob(${filename}) error:`, err);
        return fallback;
    }
}

async function writeBlob<T>(filename: string, data: T[]): Promise<void> {
    const result = await put(filename, JSON.stringify(data), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
        allowOverwrite: true,
    });
    // Keep cache in sync so the next read skips list()
    urlCache[filename] = result.downloadUrl;
}

// ---- Members ----

export async function getMembers(): Promise<Member[]> {
    return readBlob<Member>(MEMBERS_BLOB, []);
}

export async function setMembers(members: Member[]): Promise<void> {
    await writeBlob(MEMBERS_BLOB, members);
}

// ---- Submissions ----

export async function getSubmissions(): Promise<Submission[]> {
    return readBlob<Submission>(SUBMISSIONS_BLOB, []);
}

export async function setSubmissions(submissions: Submission[]): Promise<void> {
    await writeBlob(SUBMISSIONS_BLOB, submissions);
}

// ---- Connection helpers ----

export function getConnections(members: Member[]): Connection[] {
    const connections: Connection[] = [];
    const memberIds = new Set(members.map(m => m.id));

    members.forEach(member => {
        if (member.connections) {
            member.connections.forEach(targetId => {
                if (memberIds.has(targetId)) {
                    connections.push({ fromId: member.id, toId: targetId });
                }
            });
        }
    });

    return connections;
}

export function getWebringNavigation(members: Member[], currentWebsite: string) {
    const index = members.findIndex(m => m.website === currentWebsite);
    if (index === -1) return { prev: null, next: null };

    return {
        prev: members[(index - 1 + members.length) % members.length],
        next: members[(index + 1) % members.length],
    };
}
