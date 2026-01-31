import { NextResponse } from 'next/server';
import { ref, onValue } from 'firebase/database';
import { db as firebaseDb } from '@/lib/firebase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const classFilter = searchParams.get('class') || 'All';

        // Fetch all projects from Firebase
        const projects = await new Promise<any[]>((resolve, reject) => {
            const projectsRef = ref(firebaseDb, 'projects');
            onValue(
                projectsRef,
                (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const projectList = Object.values(data);
                        resolve(projectList);
                    } else {
                        resolve([]);
                    }
                },
                (error) => {
                    reject(error);
                },
                { onlyOnce: true }
            );
        });

        // Filter by class if specified
        const filteredProjects = classFilter === 'All'
            ? projects
            : projects.filter((p: any) => p.class === classFilter);

        // Sort by class then name
        filteredProjects.sort((a: any, b: any) => {
            if (a.class === b.class) {
                return (a.name || '').localeCompare(b.name || '');
            }
            return (a.class || '').localeCompare(b.class || '');
        });

        // Generate CSV content
        const csvHeaders = [
            'Student Name',
            'Class',
            'Project Title',
            'Status',
            'Submission Date',
            'Cloudinary Poster Link',
            'PDF Link'
        ].join(',');

        const csvRows = filteredProjects.map((project: any) => {
            const submissionDate = project.timestamp
                ? new Date(project.timestamp).toLocaleDateString()
                : 'N/A';

            return [
                `"${(project.name || '').replace(/"/g, '""')}"`,
                `"${(project.class || '').replace(/"/g, '""')}"`,
                `"${(project.project_title || '').replace(/"/g, '""')}"`,
                `"${(project.status || 'draft').replace(/"/g, '""')}"`,
                `"${submissionDate}"`,
                `"${(project.cloudinary_url || 'Not uploaded').replace(/"/g, '""')}"`,
                `"${(project.cloudinary_url || '').replace(/"/g, '""')}"`
            ].join(',');
        });

        const csvContent = [csvHeaders, ...csvRows].join('\n');

        // Return CSV file
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="makerfest-posters-${classFilter}-${Date.now()}.csv"`
            }
        });

    } catch (error) {
        console.error('Export spreadsheet error:', error);
        return NextResponse.json(
            { error: 'Failed to export spreadsheet' },
            { status: 500 }
        );
    }
}
