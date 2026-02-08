import React from 'react';
import { Header } from './Header';
import { PoemEditor } from '../Editor/PoemEditor';
import { NotesCanvas } from '../Notes/NotesCanvas';
import './MainLayout.css';
import { useProject } from '../../contexts/ProjectContext';

interface MainLayoutProps {
    onBackToLanding: () => void;
}

export function MainLayout({ onBackToLanding }: MainLayoutProps) {
    const { viewState } = useProject();
    const [editorRef, setEditorRef] = React.useState<HTMLDivElement | null>(null);

    const zoomStyle = {
        transform: `scale(${viewState.zoomLevel})`,
        transformOrigin: 'top center',
        transition: 'transform 0.2s ease-out'
    };

    return (
        <div className="main-layout">
            <Header onBackToLanding={onBackToLanding} />

            <div className="editor-container" style={zoomStyle}>
                {/* Background layer */}
                <div className="notes-panel">
                    <NotesCanvas
                        editorRef={editorRef}
                        zoomLevel={viewState.zoomLevel}
                    />
                </div>

                {/* Floating centered layer */}
                <div className="poem-panel">
                    <div className="panel-header">
                        <h2>Poem</h2>
                        <span className="panel-hint">Select text to create notes</span>
                    </div>
                    <div className="panel-content">
                        <PoemEditor onEditorRef={setEditorRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}
