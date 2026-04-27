import { useRef, useState, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { useProject } from '../contexts/ProjectContext';
import type { ProjectIndexEntry } from '../contexts/ProjectContext';
import './LandingPage.css';
import './LandingPageProjects.css';

interface LandingPageProps {
    onProjectReady: () => void;
    onSignOut: () => void;
}

type Screen = 'home' | 'open';

export function LandingPage({ onProjectReady, onSignOut }: LandingPageProps) {
    const { createNewProject, importProject, loadProjectList, openProject, deleteProject } = useProject();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [screen, setScreen] = useState<Screen>('home');
    const [projects, setProjects] = useState<ProjectIndexEntry[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [openingId, setOpeningId] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        setLoadingList(true);
        const list = await loadProjectList();
        setProjects(list.sort((a, b) => b.lastModified.localeCompare(a.lastModified)));
        setLoadingList(false);
    }, [loadProjectList]);

    useEffect(() => {
        if (screen === 'open') fetchProjects();
    }, [screen, fetchProjects]);

    const handleCreateNew = async () => {
        await createNewProject();
        onProjectReady();
    };

    const handleOpen = async (projectId: string) => {
        setOpeningId(projectId);
        await openProject(projectId);
        setOpeningId(null);
        onProjectReady();
    };

    const handleDelete = async (projectId: string) => {
        if (!confirm('Delete this project? This cannot be undone.')) return;
        setDeletingId(projectId);
        await deleteProject(projectId);
        setDeletingId(null);
        setProjects(prev => prev.filter(p => p.projectId !== projectId));
    };

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith('.json')) { setError('Please select a valid JSON project file'); return; }
        try {
            await importProject(file);
            setError(null);
            onProjectReady();
        } catch {
            setError('Failed to import project. Please check the file format.');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (screen === 'open') {
        return (
            <div className="landing-page">
                <div className="landing-header">
                    <div className="logo">
                        <span className="logo-icon">📝</span>
                        <h1>Poetry Notes</h1>
                    </div>
                    <p className="tagline">Your saved projects</p>
                </div>
                <div className="landing-content">
                    <div className="projects-toolbar">
                        <button className="projects-back-btn" onClick={() => setScreen('home')}>← Back</button>
                        <button className="projects-new-btn" onClick={handleCreateNew}>+ New</button>
                    </div>
                    {loadingList ? (
                        <div className="projects-loading">Loading…</div>
                    ) : projects.length === 0 ? (
                        <div className="projects-empty">No saved projects yet.</div>
                    ) : (
                        <ul className="projects-list">
                            {projects.map(p => (
                                <li key={p.projectId} className="project-item">
                                    <button
                                        className="project-open-btn"
                                        onClick={() => handleOpen(p.projectId)}
                                        disabled={openingId === p.projectId}
                                    >
                                        <span className="project-title">{p.title || 'Untitled Project'}</span>
                                        <span className="project-date">
                                            {new Date(p.lastModified).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </span>
                                        {openingId === p.projectId && <span className="project-loading">Opening…</span>}
                                    </button>
                                    <button
                                        className="project-delete-btn"
                                        onClick={() => handleDelete(p.projectId)}
                                        disabled={deletingId === p.projectId}
                                        aria-label="Delete project"
                                    >
                                        {deletingId === p.projectId ? '…' : '🗑'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {error && <div className="error-message">{error}</div>}
                </div>
            </div>
        );
    }

    return (
        <div className="landing-page">
            <div className="landing-header">
                <div className="logo">
                    <span className="logo-icon">📝</span>
                    <h1>Poetry Notes</h1>
                </div>
                <p className="tagline">Annotate and explore poetry with interconnected notes</p>
            </div>

            <div className="landing-content">
                <div className="landing-actions">
                    <button className="action-button primary" onClick={() => setScreen('open')}>
                        <span className="button-icon">📂</span>
                        <span className="button-text">
                            <span className="button-title">Continue Project</span>
                            <span className="button-subtitle">Open or manage your saved notes</span>
                        </span>
                    </button>

                    <button className="action-button" onClick={handleCreateNew}>
                        <span className="button-icon">✨</span>
                        <span className="button-text">
                            <span className="button-title">New Project</span>
                            <span className="button-subtitle">Start a fresh annotation</span>
                        </span>
                    </button>

                    <button className="action-button" onClick={handleUploadClick}>
                        <span className="button-icon">📤</span>
                        <span className="button-text">
                            <span className="button-title">Import from File</span>
                            <span className="button-subtitle">Load a JSON project file</span>
                        </span>
                    </button>

                    <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="landing-features">
                    <div className="feature"><span className="feature-icon">✍️</span><span>Rich text poem editing</span></div>
                    <div className="feature"><span className="feature-icon">🔗</span><span>Link notes to text</span></div>
                    <div className="feature"><span className="feature-icon">☁️</span><span>Cloud saved</span></div>
                </div>

                <button className="sign-out-btn" onClick={onSignOut}>Sign out</button>
            </div>
        </div>
    );
}
