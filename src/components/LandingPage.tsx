import { useRef, useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useProject } from '../contexts/ProjectContext';
import './LandingPage.css';

interface LandingPageProps {
    onProjectReady: () => void;
}

export function LandingPage({ onProjectReady }: LandingPageProps) {
    const { createNewProject, importProject, loadFromLocalStorage } = useProject();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasExistingProject, setHasExistingProject] = useState(false);

    useEffect(() => {
        const existing = loadFromLocalStorage();
        setHasExistingProject(!!existing && existing.poem.content.length > 0);
    }, [loadFromLocalStorage]);

    const handleCreateNew = () => {
        createNewProject();
        onProjectReady();
    };

    const handleContinue = () => {
        onProjectReady();
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            setError('Please select a valid JSON project file');
            return;
        }

        try {
            await importProject(file);
            setError(null);
            onProjectReady();
        } catch {
            setError('Failed to import project. Please check the file format.');
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="landing-page">
            <div className="landing-content">
                <div className="landing-header">
                    <div className="logo">
                        <span className="logo-icon">📝</span>
                        <h1>Poetry Notes</h1>
                    </div>
                    <p className="tagline">
                        Annotate and explore poetry with interconnected notes
                    </p>
                </div>

                <div className="landing-actions">
                    {hasExistingProject && (
                        <button className="action-button primary" onClick={handleContinue}>
                            <span className="button-icon">📂</span>
                            <span className="button-text">
                                <span className="button-title">Continue Project</span>
                                <span className="button-subtitle">Resume your last session</span>
                            </span>
                        </button>
                    )}

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
                            <span className="button-title">Upload Project</span>
                            <span className="button-subtitle">Import from JSON file</span>
                        </span>
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="landing-features">
                    <div className="feature">
                        <span className="feature-icon">✍️</span>
                        <span>Rich text poem editing</span>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">🔗</span>
                        <span>Link notes to text</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
