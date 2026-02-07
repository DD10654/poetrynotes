import React from 'react';
import { useProject } from '../../contexts/ProjectContext';
import './Header.css';

interface HeaderProps {
    onBackToLanding: () => void;
}

export function Header({ onBackToLanding }: HeaderProps) {
    const { project, dispatch, saveToLocalStorage, exportProject, hasUnsavedChanges } = useProject();
    const [isEditingTitle, setIsEditingTitle] = React.useState(false);
    const [titleValue, setTitleValue] = React.useState(project.title);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setTitleValue(project.title);
    }, [project.title]);

    React.useEffect(() => {
        if (isEditingTitle && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingTitle]);

    const handleTitleClick = () => {
        setIsEditingTitle(true);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleValue(e.target.value);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        if (titleValue.trim() && titleValue !== project.title) {
            dispatch({ type: 'UPDATE_TITLE', payload: titleValue.trim() });
        } else {
            setTitleValue(project.title);
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleTitleBlur();
        } else if (e.key === 'Escape') {
            setTitleValue(project.title);
            setIsEditingTitle(false);
        }
    };

    const handleSave = () => {
        saveToLocalStorage();
    };

    const handleExport = () => {
        exportProject();
    };

    return (
        <header className="app-header">
            <div className="header-left">
                <button className="back-button" onClick={onBackToLanding} title="Back to Home">
                    ←
                </button>

                <div className="title-section">
                    {isEditingTitle ? (
                        <input
                            ref={inputRef}
                            type="text"
                            className="title-input"
                            value={titleValue}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                            placeholder="Project title..."
                        />
                    ) : (
                        <h1 className="project-title" onClick={handleTitleClick} title="Click to edit">
                            {project.title}
                            <span className="edit-hint">✏️</span>
                        </h1>
                    )}
                    {hasUnsavedChanges && <span className="unsaved-indicator">●</span>}
                </div>
            </div>

            <div className="header-right">
                <button
                    className="header-button"
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges}
                >
                    <span className="button-icon">💾</span>
                    Save
                </button>
                <button className="header-button" onClick={handleExport}>
                    <span className="button-icon">📥</span>
                    Export
                </button>
            </div>
        </header>
    );
}
