import React from 'react';
import { Header } from './Header';
import { PoemEditor } from '../Editor/PoemEditor';
import { NotesCanvas } from '../Notes/NotesCanvas';
import './MainLayout.css';

interface MainLayoutProps {
    onBackToLanding: () => void;
}

export function MainLayout({ onBackToLanding }: MainLayoutProps) {
    const [editorRef, setEditorRef] = React.useState<HTMLDivElement | null>(null);

    return (
        <div className="main-layout">
            <Header onBackToLanding={onBackToLanding} />

            <div className="editor-container">
                {/* Background layer */}
                <div className="notes-panel">
                    <NotesCanvas editorRef={editorRef} />
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
