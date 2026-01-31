import { NextResponse } from 'next/server';
import { uploadPosterToCloudinary } from '@/lib/cloudinary';
import { ref, update } from 'firebase/database';
import { db as firebaseDb } from '@/lib/firebase';
import db from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { projectId, posterImage, studentName, className } = body;

        if (!projectId || !posterImage || !studentName || !className) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Upload to Cloudinary
        const cloudinaryResult = await uploadPosterToCloudinary(
            posterImage,
            studentName,
            className
        );

        // Update Firebase with Cloudinary URL
        const projectRef = ref(firebaseDb, `projects/${projectId}`);
        await update(projectRef, {
            cloudinary_url: cloudinaryResult.secure_url,
            cloudinary_public_id: cloudinaryResult.public_id,
            cloudinary_uploaded_at: Date.now()
        });

        // Also update SQLite database
        try {
            const updateStmt = db.prepare(`
                UPDATE projects 
                SET cloudinary_url = ?, cloudinary_public_id = ?
                WHERE id = ?
            `);
            updateStmt.run(
                cloudinaryResult.secure_url,
                cloudinaryResult.public_id,
                projectId
            );
        } catch (dbError) {
            console.error('SQLite update failed (non-blocking):', dbError);
            // Continue even if SQLite update fails
        }

        return NextResponse.json({
            success: true,
            cloudinary_url: cloudinaryResult.secure_url
        });

    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload to Cloudinary' },
            { status: 500 }
        );
    }
}
