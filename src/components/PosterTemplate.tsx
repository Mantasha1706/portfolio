import { useRef, useEffect } from 'react';

// Using a specific interface for Project to avoid 'any'
interface Project {
    id: string;
    project_title: string;
    name: string;
    class: string;
    problem_statement: string;
    project_idea: string;
    working: string;
    challenges: string;
    learned: string;
    materials: string;
    future: string;
    image_path?: string;
    [key: string]: any;
}

interface PosterTemplateProps {
    project: Project;
    theme: any;
    isEditing: boolean;
    onUpdate?: (field: string, value: string) => void;
    forwardedRef?: any;
}

export default function PosterTemplate({ project, theme, isEditing, onUpdate, forwardedRef }: PosterTemplateProps) {
    const handleChange = (field: string, value: string) => {
        if (onUpdate) {
            onUpdate(field, value);
        }
    };

    // Helper to render editable field
    const renderEditable = (field: string, value: string, className: string = "", rows: number = 3) => {
        if (isEditing) {
            return (
                <textarea
                    value={value || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className={`w-full bg-black/5 hover:bg-black/10 border-transparent focus:border-orange-500 focus:ring-0 rounded p-1 transition-colors resize-none ${className}`}
                    rows={rows}
                />
            );
        }
        return <p className={`${className} whitespace-pre-wrap`}>{value}</p>;
    };

    // Helper for single line inputs
    const renderEditableSingle = (field: string, value: string, className: string = "") => {
        if (isEditing) {
            return (
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className={`w-full bg-black/5 hover:bg-black/10 border-transparent focus:border-orange-500 focus:ring-0 rounded p-1 transition-colors ${className}`}
                />
            );
        }
        return <h1 className={className}>{value}</h1>;
    };


    return (
        <div
            ref={forwardedRef}
            className="w-[210mm] min-h-[297mm] overflow-hidden relative flex flex-col"
            style={{ backgroundColor: theme.colors.backgroundHex }}
        >
            {/* Header */}
            <header
                className="py-8 px-10"
                style={{
                    background: `linear-gradient(to right, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
                    color: '#ffffff'
                }}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                        {isEditing ? (
                            <input
                                type="text"
                                value={project.project_title || ''}
                                onChange={(e) => handleChange('project_title', e.target.value)}
                                className="w-full text-4xl font-black uppercase tracking-tight mb-2 bg-white/10 hover:bg-white/20 border-transparent focus:border-white rounded p-1 placeholder-white/50"
                                placeholder="Project Title"
                            />
                        ) : (
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">{project.project_title}</h1>
                        )}

                        <div className="text-xl opacity-90 font-medium flex gap-2 items-center">
                            By
                            {isEditing ? (
                                <input
                                    value={project.name || ''}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="bg-white/10 hover:bg-white/20 rounded px-1 w-40"
                                />
                            ) : (
                                <span>{project.name}</span>
                            )}
                            • Class
                            {isEditing ? (
                                <input
                                    value={project.class || ''}
                                    onChange={(e) => handleChange('class', e.target.value)}
                                    className="bg-white/10 hover:bg-white/20 rounded px-1 w-20"
                                />
                            ) : (
                                <span>{project.class}</span>
                            )}
                        </div>
                    </div>
                    <div className="text-right whitespace-nowrap">
                        <div className="text-sm font-bold opacity-80 uppercase tracking-widest">MakerFest 2025</div>
                        <div className="text-xs opacity-70">Design Thinking Portfolio</div>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="p-10 flex-1 grid grid-cols-12 gap-8" style={{ color: '#111827' }}>

                {/* Left Column: Core Info */}
                <div className="col-span-12 md:col-span-7 flex flex-col gap-6">

                    {/* Problem */}
                    <section
                        className="p-6 rounded-xl border"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: 'rgba(0, 0, 0, 0.05)' }}
                    >
                        <h3
                            className="text-xl font-bold mb-3 uppercase flex items-center gap-2"
                            style={{ color: theme.colors.accentHex }}
                        >
                            1. The Problem
                        </h3>
                        {renderEditable('problem_statement', project.problem_statement, "text-lg leading-relaxed")}
                    </section>

                    {/* Idea */}
                    <section
                        className="p-6 rounded-xl border"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: 'rgba(0, 0, 0, 0.05)' }}
                    >
                        <h3
                            className="text-xl font-bold mb-3 uppercase flex items-center gap-2"
                            style={{ color: theme.colors.accentHex }}
                        >
                            2. The Solution
                        </h3>
                        {renderEditable('project_idea', project.project_idea, "text-lg leading-relaxed")}
                    </section>

                    {/* Working */}
                    <section
                        className="p-6 rounded-xl border"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: 'rgba(0, 0, 0, 0.05)' }}
                    >
                        <h3
                            className="text-xl font-bold mb-3 uppercase flex items-center gap-2"
                            style={{ color: theme.colors.accentHex }}
                        >
                            3. How It Works
                        </h3>
                        {renderEditable('working', project.working, "text-base leading-relaxed")}
                    </section>

                    {/* Challenges & Learning */}
                    <div className="grid grid-cols-2 gap-4">
                        <section
                            className="p-4 rounded-xl border"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: 'rgba(0, 0, 0, 0.05)' }}
                        >
                            <h3
                                className="text-sm font-bold mb-2 uppercase"
                                style={{ color: theme.colors.accentHex, opacity: 0.8 }}
                            >
                                Challenges
                            </h3>
                            {renderEditable('challenges', project.challenges, "text-sm", 4)}
                        </section>
                        <section
                            className="p-4 rounded-xl border"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: 'rgba(0, 0, 0, 0.05)' }}
                        >
                            <h3
                                className={`text-sm font-bold mb-2 uppercase opacity-80 ${theme.colors.accent}`}
                                style={{ color: theme.colors.accentHex }}
                            >
                                Key Learnings
                            </h3>
                            {renderEditable('learned', project.learned, "text-sm", 4)}
                        </section>
                    </div>

                </div>

                {/* Right Column: Visuals & Materials */}
                <div className="col-span-12 md:col-span-5 flex flex-col gap-6">

                    {/* Main Image */}
                    {/* Main Image */}
                    <div
                        className="aspect-square rounded-2xl overflow-hidden relative group border-4"
                        style={{ borderColor: theme.colors.secondaryHex }}
                    >
                        {project.image_path ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={project.image_path}
                                alt="Project Model"
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold">
                                No Image
                            </div>
                        )}
                        {/* Future: Add image upload overlay here for editing if needed, skipping for now as per minimal scope */}
                    </div>

                    {/* Materials List */}
                    <section
                        className="p-6 rounded-xl"
                        style={{ backgroundColor: theme.colors.primaryHex, color: '#ffffff' }}
                    >
                        <h3 className="text-lg font-bold mb-3 uppercase border-b pb-2" style={{ borderBottomColor: 'rgba(255, 255, 255, 0.2)' }}>
                            Materials Used
                        </h3>
                        {renderEditable('materials', project.materials, "text-sm opacity-90 whitespace-pre-line leading-relaxed text-inherit", 4)}
                    </section>

                    {/* Future */}
                    <section
                        className="p-6 rounded-xl border flex-1"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: 'rgba(0, 0, 0, 0.05)' }}
                    >
                        <h3
                            className="text-lg font-bold mb-2 uppercase"
                            style={{ color: theme.colors.accentHex }}
                        >
                            Future Scope
                        </h3>
                        {renderEditable('future', project.future, "text-sm text-gray-600 italic")}
                    </section>
                </div>

            </div>

            {/* Footer */}
            <footer
                className="py-4 px-10 text-center text-xs border-t"
                style={{ borderTopColor: 'rgba(0, 0, 0, 0.1)', color: '#4b5563', opacity: 0.6 }}
            >
                Generated via MakerFest Portfolio • {new Date().getFullYear()}
            </footer>
        </div>
    );
}
