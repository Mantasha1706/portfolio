'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PortfolioPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        project_title: '',
        class: '4E',
        name: '',
        problem_statement: '',
        project_idea: '',
        materials: '',
        working: '',
        challenges: '',
        learned: '',
        future: '',
        existingImagePath: ''
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const classes = ['4E', '4F', '4G', '5D', '5E', '5F'];

    useEffect(() => {
        fetchProject();
    }, []);

    const fetchProject = async () => {
        try {
            const res = await fetch('/api/project');
            if (res.ok) {
                const data = await res.json();
                if (data.project) {
                    setFormData({
                        project_title: data.project.project_title || '',
                        class: data.project.class || '4E',
                        name: data.project.name || '',
                        problem_statement: data.project.problem_statement || '',
                        project_idea: data.project.project_idea || '',
                        materials: data.project.materials || '',
                        working: data.project.working || '',
                        challenges: data.project.challenges || '',
                        learned: data.project.learned || '',
                        future: data.project.future || '',
                        existingImagePath: data.project.image_path || ''
                    });
                    if (data.project.image_path) {
                        setPreviewImage(data.project.image_path);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const submitData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            submitData.append(key, value);
        });

        if (selectedFile) {
            submitData.append('image', selectedFile);
        }

        try {
            const res = await fetch('/api/project', {
                method: 'POST',
                body: submitData,
            });

            if (!res.ok) throw new Error('Failed to save');

            router.push('/poster-editor'); // Proceed to poster creation
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save project details. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl bg-white p-8 shadow-xl rounded-2xl">
                <div className="mb-8 border-b border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">MakerFest Student Portfolio</h1>
                    <p className="mt-2 text-gray-600">Fill in the details about your amazing project!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info Section */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Student Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border p-2"
                                placeholder="Full Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Class</label>
                            <select
                                name="class"
                                value={formData.class}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border p-2"
                            >
                                {classes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Project Title</label>
                        <input
                            type="text"
                            name="project_title"
                            required
                            value={formData.project_title}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border p-2"
                            placeholder="My Awesome Solar Project"
                        />
                    </div>

                    {/* Project Details */}
                    <div className="space-y-6">
                        {[
                            { label: 'Problem Statement', name: 'problem_statement', ph: 'What problem is your project solving?' },
                            { label: 'Project Idea', name: 'project_idea', ph: 'Explain the idea behind your project.' },
                            { label: 'Materials Used', name: 'materials', ph: 'List the materials you used.' },
                            { label: 'How the Project Works', name: 'working', ph: 'Briefly explain how it works.' },
                            { label: 'Challenges Faced', name: 'challenges', ph: 'What difficulties did you encounter?' },
                            { label: 'What You Learned', name: 'learned', ph: 'What new skills or knowledge did you gain?' },
                            { label: 'Future Improvements', name: 'future', ph: 'How could you make this project even better?' },
                        ].map((field) => (
                            <div key={field.name}>
                                <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                                <textarea
                                    name={field.name}
                                    rows={3}
                                    value={(formData as any)[field.name]}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border p-2"
                                    placeholder={field.ph}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Project Image (Model)</label>
                        <div className="mt-2 flex items-center gap-x-4">
                            <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                                {previewImage ? (
                                    <Image src={previewImage} alt="Project Preview" fill className="object-cover" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-700 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Create Poster'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
