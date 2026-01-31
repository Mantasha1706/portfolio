'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Download, FileSpreadsheet } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PosterTemplate from '@/components/PosterTemplate';
import { THEMES } from '@/lib/themes';

export default function TeacherDashboard() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [classFilter, setClassFilter] = useState('All');
    const classes = ['All', '4E', '4F', '4G', '5D', '5E', '5F'];

    const [error, setError] = useState<string | null>(null);

    // For PDF generation
    const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
    const [renderProject, setRenderProject] = useState<any | null>(null);
    const posterRef = useRef<HTMLDivElement>(null);

    // For spreadsheet export
    const [exportingSpreadsheet, setExportingSpreadsheet] = useState(false);

    // For background sync
    const [isSyncing, setIsSyncing] = useState(false);
    const [downloadingAll, setDownloadingAll] = useState(false);

    useEffect(() => {
        const projectsRef = ref(db, 'projects');
        const unsubscribe = onValue(projectsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Convert object to array
                const projectList = Object.values(data);

                // Sort by class then name
                projectList.sort((a: any, b: any) => {
                    if (a.class === b.class) {
                        return (a.name || '').localeCompare(b.name || '');
                    }
                    return (a.class || '').localeCompare(b.class || '');
                });

                setProjects(projectList);
            } else {
                setProjects([]);
            }
            setLoading(false);
            setError(null);
        }, (error) => {
            console.error("Firebase read failed:", error);
            setError("Permission denied. Please check Firebase Console rules.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Background sync effect: automatically upload missing Cloudinary links
    useEffect(() => {
        if (loading || isSyncing || downloadingAll || generatingPdf) return;

        const missingSync = projects.find(p => p.status === 'submitted' && !p.cloudinary_url);

        if (missingSync) {
            triggerBackgroundSync(missingSync);
        }
    }, [projects, loading, isSyncing, downloadingAll, generatingPdf]);

    const triggerBackgroundSync = async (project: any) => {
        setIsSyncing(true);
        try {
            console.log(`Syncing missing Cloudinary link for: ${project.name}`);
            setRenderProject(project);

            // Wait for render
            await new Promise(resolve => setTimeout(resolve, 800));

            if (!posterRef.current) {
                setIsSyncing(false);
                setRenderProject(null);
                return;
            }

            const canvas = await html2canvas(posterRef.current, {
                scale: 1.5, // Lower scale for background sync to be faster
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const posterImage = canvas.toDataURL('image/png');

            await fetch('/api/cloudinary/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: project.id,
                    posterImage: posterImage,
                    studentName: project.name,
                    className: project.class
                })
            });
        } catch (error) {
            console.error('Background sync failed:', error);
        } finally {
            setIsSyncing(false);
            setRenderProject(null);
        }
    };

    const handleExportSpreadsheet = async () => {
        setExportingSpreadsheet(true);
        try {
            const response = await fetch(`/api/teacher/export-spreadsheet?class=${classFilter}`);

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `makerfest-posters-${classFilter}-${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export spreadsheet. Please try again.');
        } finally {
            setExportingSpreadsheet(false);
        }
    };

    const handleDownloadPDF = async (project: any) => {
        setGeneratingPdf(project.id);
        setRenderProject(project);

        // Wait for render/images to load (increased timeout)
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (!posterRef.current) {
            setGeneratingPdf(null);
            setRenderProject(null);
            return;
        }

        try {
            const canvas = await html2canvas(posterRef.current, {
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: '#ffffff'
            });

            if (canvas.width === 0 || canvas.height === 0) {
                throw new Error('Generated canvas is empty. The poster might not be rendered correctly.');
            }

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            const fileName = `${project.project_title || 'MakerFest-Poster'}_${project.name}`.replace(/[/\\?%*:|"<>]/g, '-');
            pdf.save(`${fileName}.pdf`);

        } catch (error) {
            console.error('PDF Generation failed:', error);
            if (!downloadingAll) alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the browser console for details.`);
        } finally {
            setGeneratingPdf(null);
            setRenderProject(null);
        }
    };

    const handleDownloadAllPDFs = async () => {
        const confirmDownload = confirm(`This will download ${filteredProjects.length} PDFs. It may take a while. Continue?`);
        if (!confirmDownload) return;

        setDownloadingAll(true);
        for (const project of filteredProjects) {
            await handleDownloadPDF(project);
            // Small delay to prevent browser hanging
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        setDownloadingAll(false);
        alert('All PDFs have been downloaded!');
    };

    // Filter projects locally since we have all real-time data
    const filteredProjects = projects.filter(p => classFilter === 'All' || p.class === classFilter);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <h1 className="text-3xl font-bold text-gray-900">MakerFest Submissions</h1>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Filter by Class:</span>
                        <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
                        >
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <button
                            onClick={handleDownloadAllPDFs}
                            disabled={downloadingAll || filteredProjects.length === 0}
                            className="flex items-center gap-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50 transition-all font-bold"
                        >
                            {downloadingAll ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <Download size={16} />
                                    Download All PDFs
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleExportSpreadsheet}
                            disabled={exportingSpreadsheet || filteredProjects.length === 0}
                            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
                        >
                            {exportingSpreadsheet ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet size={16} />
                                    Export Spreadsheet
                                </>
                            )}
                        </button>

                        <Link href="/login" className="text-sm font-medium text-red-600 hover:text-red-500 font-bold">
                            Logout
                        </Link>
                    </div>
                </div>

                {isSyncing && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                            <span className="text-sm font-medium text-blue-800">
                                Automatically syncing missing Cloudinary links...
                            </span>
                        </div>
                        <span className="text-xs text-blue-600">Please keep this tab open</span>
                    </div>
                )}


                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading submissions...</div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-50 rounded-lg shadow border border-red-200">
                        <h3 className="text-lg font-medium text-red-900">Access Error</h3>
                        <p className="mt-1 text-red-600">{error}</p>
                        <p className="mt-2 text-sm text-gray-500">Go to Firebase Console &gt; Realtime Database &gt; Rules and set .read/.write to true.</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">No submissions found</h3>
                        <p className="mt-1 text-gray-500">Wait for students to submit their amazing work!</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProjects.map((project) => (
                            <div key={project.id} className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow">
                                <div className="relative h-48 bg-gray-200">
                                    {project.image_path ? (
                                        <Image src={project.image_path} alt={project.project_title} fill className="object-cover" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
                                    )}
                                    <div className="absolute top-2 right-2 rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                        {project.status || 'Submitted'}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                                            Class {project.class}
                                        </span>
                                    </div>
                                    <h3 className="mt-2 text-xl font-bold text-gray-900 truncate" title={project.project_title}>
                                        {project.project_title}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">{project.name}</p>

                                    {project.cloudinary_url && (
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                Cloudinary Link Ready
                                            </span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(project.cloudinary_url);
                                                    alert('Link copied to clipboard!');
                                                }}
                                                className="text-[10px] font-medium text-blue-600 hover:text-blue-800 underline"
                                            >
                                                Copy Link
                                            </button>
                                        </div>
                                    )}

                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            href={`/poster-editor?id=${project.id}&readonly=true`}
                                            className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700"
                                        >
                                            View Poster
                                        </Link>
                                        <button
                                            onClick={() => handleDownloadPDF(project)}
                                            disabled={generatingPdf === project.id}
                                            className="flex items-center justify-center gap-1 rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                                            title="Download as PDF"
                                        >
                                            {generatingPdf === project.id ? (
                                                <span className="animate-pulse">...</span>
                                            ) : (
                                                <Download size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                        ))}
                    </div>
                )}
            </div>

            {/* Hidden poster rendering area for PDF generation */}
            {renderProject && (
                <div className="fixed -top-[10000px] -left-[10000px] pointer-events-none" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                    <PosterTemplate
                        project={renderProject}
                        theme={THEMES.find(t => t.id === renderProject.poster_config) || THEMES[0]}
                        isEditing={false}
                        forwardedRef={posterRef}
                    />
                </div>
            )}
        </div>
    );
}
