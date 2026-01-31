import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
import db from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';
import { ref, set } from 'firebase/database';
import { db as firebaseDb } from '@/lib/firebase';

// GET: Teacher can fetch specific project by ID; Student catches their own.
export async function GET(request: Request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const emailMatch = cookieHeader.match(/user_email=([^;]+)/);
    const roleMatch = cookieHeader.match(/user_role=([^;]+)/);
    const email = emailMatch ? decodeURIComponent(emailMatch[1]) : null;
    const role = roleMatch ? roleMatch[1] : 'student';

    if (!email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        let project;
        if (role === 'teacher' && id) {
            const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
            project = stmt.get(id);
        } else {
            const stmt = db.prepare('SELECT * FROM projects WHERE email = ?');
            project = stmt.get(email);
        }
        return NextResponse.json({ project: project || null });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const emailMatch = cookieHeader.match(/user_email=([^;]+)/);
    const userEmail = emailMatch ? decodeURIComponent(emailMatch[1]) : null;

    if (!userEmail) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        let imagePath = formData.get('existingImagePath') as string || '';

        if (file && file.size > 0 && file.name !== 'undefined') {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            await writeFile(path.join(uploadsDir, filename), buffer);
            imagePath = `/uploads/${filename}`;
        }

        const data = {
            email: userEmail,
            name: formData.get('name') as string,
            class: formData.get('class') as string,
            project_title: formData.get('project_title') as string,
            problem_statement: formData.get('problem_statement') as string,
            project_idea: formData.get('project_idea') as string,
            materials: formData.get('materials') as string,
            working: formData.get('working') as string,
            challenges: formData.get('challenges') as string,
            learned: formData.get('learned') as string,
            future: formData.get('future') as string,
            image_path: imagePath,
            poster_config: formData.get('poster_config') as string || '',
            status: formData.get('status') as string || 'draft'
        };

        // Check if exists
        const checkStmt = db.prepare('SELECT id FROM projects WHERE email = ?');
        const existing = checkStmt.get(userEmail) as any;

        let projectId: number;

        if (existing) {
            const updateStmt = db.prepare(`
              UPDATE projects SET 
              name=?, class=?, project_title=?, problem_statement=?, project_idea=?, 
              materials=?, working=?, challenges=?, learned=?, future=?, image_path=?,
              poster_config=?, status=?
              WHERE email = ?
          `);
            updateStmt.run(
                data.name, data.class, data.project_title, data.problem_statement,
                data.project_idea, data.materials, data.working, data.challenges,
                data.learned, data.future, data.image_path,
                data.poster_config, data.status,
                userEmail
            );
            projectId = existing.id;
        } else {
            const insertStmt = db.prepare(`
              INSERT INTO projects (
                  email, name, class, project_title, problem_statement, project_idea, 
                  materials, working, challenges, learned, future, image_path,
                  poster_config, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
            const result = insertStmt.run(
                userEmail, data.name, data.class, data.project_title, data.problem_statement,
                data.project_idea, data.materials, data.working, data.challenges,
                data.learned, data.future, data.image_path,
                data.poster_config, data.status
            );
            projectId = result.lastInsertRowid as number;
        }

        // Sync to Firebase for teacher dashboard
        try {
            const firebaseData = {
                id: projectId.toString(),
                ...data,
                timestamp: Date.now()
            };

            const projectRef = ref(firebaseDb, `projects/${projectId}`);
            await set(projectRef, firebaseData);
            console.log('✅ Synced to Firebase:', projectId);
        } catch (firebaseError) {
            console.error('⚠️ Firebase sync failed (non-blocking):', firebaseError);
            // Don't fail the request if Firebase sync fails
        }

        return NextResponse.json({ success: true, imagePath });

    } catch (error) {
        console.error('Save error:', error);
        return NextResponse.json({ error: 'Failed to save project' }, { status: 500 });
    }
}
