import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const roleMatch = cookieHeader.match(/user_role=([^;]+)/);
    const role = roleMatch ? roleMatch[1] : null;

    if (role !== 'teacher') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const classFilter = searchParams.get('class');

        let query = 'SELECT * FROM projects WHERE status = "submitted"';
        let params: any[] = [];

        if (classFilter && classFilter !== 'All') {
            query += ' AND class = ?';
            params.push(classFilter);
        }

        // Order by class then name
        query += ' ORDER BY class, name';

        const stmt = db.prepare(query);
        const projects = stmt.all(...params);

        return NextResponse.json({ projects });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}
