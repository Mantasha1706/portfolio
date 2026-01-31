'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Palette, Download, ArrowLeft, Save, Edit, Send, CheckCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Confetti from 'react-confetti';

import PosterTemplate from '@/components/PosterTemplate';
import { THEMES } from '@/lib/themes';

function PosterEditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const posterRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<any>(null);
    const [activeTheme, setActiveTheme] = useState(THEMES[0]);

    // Update activeTheme when project loads
    useEffect(() => {
        if (project?.poster_config) {
            const theme = THEMES.find(t => t.id === project.poster_config);
            if (theme) setActiveTheme(theme);
        }
    }, [project]);
    const [isGenerating, setIsGenerating] = useState(false);

    // New States
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    // Check if readonly mode (e.g. for teacher view)
    const isReadOnly = searchParams.get('readonly') === 'true';
    const paramId = searchParams.get('id');

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        fetchProject();
    }, []);

    const fetchProject = async () => {
        try {
            // If paramId exists (teacher view), fetch that specific project
            // Otherwise normal student fetch
            const url = paramId ? `/api/project?id=${paramId}` : '/api/project';
            const res = await fetch(url);

            if (res.ok) {
                const data = await res.json();
                if (data.project) {
                    setProject(data.project);
                    // Check if already submitted
                    if (data.project.status === 'submitted' && !isReadOnly) {
                        // Optionally lock editing if already submitted?
                        // For now, let's allow re-submission/editing or just show status.
                    }
                } else {
                    if (!isReadOnly) router.push('/portfolio');
                }
            }
        } catch (error) {
            console.error('Failed to fetch project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProjectUpdate = (field: string, value: string) => {
        setProject((prev: any) => ({ ...prev, [field]: value }));
    };

    const saveChanges = async (newStatus?: string) => {
        if (!project) return;
        setIsSaving(true);

        try {
            const formData = new FormData();
            // Append all textual fields
            Object.keys(project).forEach(key => {
                if (project[key] !== null && project[key] !== undefined && key !== 'image_path' && key !== 'id') {
                    formData.append(key, project[key]);
                }
            });

            // If status update requested (e.g. submit)
            if (newStatus) {
                formData.append('status', newStatus);
            } else {
                // Keep existing status
                formData.append('status', project.status || 'draft');
            }

            // We need to send existing image path so it doesn't get wiped if no new file
            if (project.image_path) {
                formData.append('existingImagePath', project.image_path);
            }

            const res = await fetch('/api/project', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                if (newStatus === 'submitted') {
                    setShowSuccess(true);
                    setProject((p: any) => ({ ...p, status: 'submitted' }));
                    setTimeout(() => setShowSuccess(false), 5000);
                } else {
                    // Just saved
                }
                setIsEditing(false); // Exit edit mode on save
            } else {
                alert('Failed to save changes.');
            }
        } catch (error) {
            console.error('Save failed', error);
        } finally {
            setIsSaving(false);
            setIsSubmitting(false);
        }
    };


    const handleSubmitToTeacher = async () => {
        if (!confirm('Are you sure you want to send this to the teacher? You can still make changes later if needed.')) return;
        setIsSubmitting(true);

        try {
            // First save the project changes
            await saveChanges('submitted');

            // Then upload poster to Cloudinary
            if (posterRef.current && project) {
                try {
                    // Generate poster image
                    const canvas = await html2canvas(posterRef.current, {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff'
                    });

                    const posterImage = canvas.toDataURL('image/png');

                    // Upload to Cloudinary
                    const uploadRes = await fetch('/api/cloudinary/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            projectId: project.id,
                            posterImage: posterImage,
                            studentName: project.name,
                            className: project.class
                        })
                    });

                    if (uploadRes.ok) {
                        const { cloudinary_url } = await uploadRes.json();
                        console.log('✅ Poster uploaded to Cloudinary:', cloudinary_url);
                    } else {
                        console.error('⚠️ Cloudinary upload failed (non-blocking)');
                    }
                } catch (cloudinaryError) {
                    console.error('⚠️ Cloudinary upload error (non-blocking):', cloudinaryError);
                    // Don't block submission if Cloudinary fails
                }
            }
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Failed to submit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleDownloadPDF = async () => {
        if (!posterRef.current) return;
        setIsGenerating(true);

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
            const fileName = (project?.project_title || 'MakerFest-Poster').replace(/[/\\?%*:|"<>]/g, '-');
            pdf.save(`${fileName}.pdf`);

        } catch (error) {
            console.error('PDF Generation failed:', error);
            alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the browser console for details.`);
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading Project Data...</div>;

    if (!project) return null;

    if (showSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <Confetti width={windowSize.width} height={windowSize.height} recycle={false} />
                <div className="bg-white rounded-2xl p-10 text-center max-w-md shadow-2xl transform animate-bounce-slow">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Sent to Teacher!</h2>
                    <p className="text-gray-500 mb-8">Your project has been successfully submitted. Good luck!</p>
                    <button
                        onClick={() => setShowSuccess(false)}
                        className="w-full rounded-xl bg-orange-600 px-6 py-3 text-white font-bold hover:bg-orange-700 transition"
                    >
                        Awesome
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Sidebar Controls */}
            <div className="w-full md:w-80 bg-white shadow-xl p-6 flex flex-col gap-6 z-10 overflow-y-auto h-auto md:h-screen sticky top-0 print:hidden">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Poster Editor</h1>
                </div>

                {!isReadOnly && (
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</h3>

                        {isEditing ? (
                            <button
                                onClick={() => saveChanges()}
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
                            >
                                <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all"
                            >
                                <Edit size={18} /> Edit Poster
                            </button>
                        )}

                        <button
                            onClick={handleSubmitToTeacher}
                            disabled={isSubmitting || isEditing}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${project.status === 'submitted'
                                ? 'bg-green-100 text-green-800 cursor-default'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {project.status === 'submitted' ? (
                                <><CheckCircle size={18} /> Sent to Teacher</>
                            ) : (
                                <><Send size={18} /> {isSubmitting ? 'Sending...' : 'Send to Teacher'}</>
                            )}
                        </button>
                    </div>
                )}

                <hr className="border-gray-100" />

                {/* Theme Selection */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Palette size={16} /> Themes
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {THEMES.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => {
                                    setActiveTheme(theme);
                                    handleProjectUpdate('poster_config', theme.id);
                                }}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${activeTheme.id === theme.id
                                    ? 'border-orange-500 ring-2 ring-orange-200 bg-orange-50'
                                    : 'border-gray-200 hover:border-orange-300'
                                    }`}
                            >
                                <div className={`w-full h-8 rounded mb-2 bg-gradient-to-r ${theme.colors.headerGradient}`}></div>
                                <span className="text-xs font-medium text-gray-700">{theme.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-6">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-yellow-500 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {isGenerating ? (
                            <span className="animate-pulse">Generating...</span>
                        ) : (
                            <>
                                <Download size={20} /> Download PDF
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-gray-200">
                <PosterTemplate
                    project={project}
                    theme={activeTheme}
                    isEditing={isEditing}
                    onUpdate={handleProjectUpdate}
                    forwardedRef={posterRef}
                />
            </div>
        </div>
    );
}

export default function PosterEditorPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Editor...</div>}>
            <PosterEditorContent />
        </Suspense>
    );
}
