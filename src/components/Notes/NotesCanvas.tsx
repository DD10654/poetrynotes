import { useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useProject } from '../../contexts/ProjectContext';
import type { Note } from '../../types';
import { Note as NoteComponent } from './Note';
import { NoteConnections } from './NoteConnections';
import './NotesCanvas.css';

interface NotesCanvasProps {
    editorRef: HTMLDivElement | null;
    zoomLevel: number;
}

export function NotesCanvas({ editorRef, zoomLevel }: NotesCanvasProps) {
    const { project, viewState, setViewState, dispatch } = useProject();
    const canvasRef = useRef<HTMLDivElement>(null);

    // Handle clicking on canvas to deselect
    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        if (e.target === canvasRef.current) {
            setViewState(prev => ({
                ...prev,
                selectedNoteId: null,
                linkingFromNoteId: null,
            }));
        }
    }, [setViewState]);

    // Handle note click when in linking mode
    const handleNoteClick = useCallback((noteId: string) => {
        if (viewState.linkingFromNoteId) {
            // Create link between notes
            if (viewState.linkingFromNoteId !== noteId) {
                dispatch({
                    type: 'LINK_NOTES',
                    payload: { fromId: viewState.linkingFromNoteId, toId: noteId },
                });
                dispatch({
                    type: 'ADD_CONNECTION',
                    payload: {
                        id: `conn-${Date.now()}`,
                        fromNoteId: viewState.linkingFromNoteId,
                        toNoteId: noteId,
                        type: 'note-to-note',
                    },
                });
            }
            setViewState(prev => ({ ...prev, linkingFromNoteId: null }));
        } else {
            setViewState(prev => ({ ...prev, selectedNoteId: noteId }));
        }
    }, [viewState.linkingFromNoteId, dispatch, setViewState]);

    // Handle note hover
    const handleNoteHover = useCallback((noteId: string | null) => {
        setViewState(prev => ({ ...prev, hoveredNoteId: noteId }));
    }, [setViewState]);

    // Handle starting link mode
    const handleStartLink = useCallback((noteId: string) => {
        setViewState(prev => ({ ...prev, linkingFromNoteId: noteId }));
    }, [setViewState]);

    // Handle note position update
    const handlePositionChange = useCallback((noteId: string, x: number, y: number) => {
        dispatch({
            type: 'UPDATE_NOTE_POSITION',
            payload: { id: noteId, position: { x, y } },
        });
    }, [dispatch]);

    // Handle note content update
    const handleContentChange = useCallback((noteId: string, content: string) => {
        dispatch({
            type: 'UPDATE_NOTE',
            payload: { id: noteId, content },
        });
    }, [dispatch]);

    // Handle note deletion
    const handleDeleteNote = useCallback((noteId: string) => {
        dispatch({ type: 'DELETE_NOTE', payload: noteId });
        setViewState(prev => ({
            ...prev,
            selectedNoteId: prev.selectedNoteId === noteId ? null : prev.selectedNoteId,
            hoveredNoteId: prev.hoveredNoteId === noteId ? null : prev.hoveredNoteId,
        }));
    }, [dispatch, setViewState]);

    // Handle adding a connected note
    const handleAddConnectedNote = useCallback((sourceNote: Note) => {
        const now = new Date().toISOString();
        const newNoteId = uuidv4();

        // Smart positioning: check if sourceNote is on Left or Right side of canvas center
        const canvasWidth = canvasRef.current?.offsetWidth || window.innerWidth;
        const centerX = canvasWidth / 2;
        const isLeftSide = sourceNote.position.x < centerX;

        // If on left side, move further left. If on right side, move further right.
        const offset = isLeftSide ? -250 : 250;

        const newNote = {
            id: newNoteId,
            content: '',
            position: {
                x: Math.max(20, sourceNote.position.x + offset),
                y: sourceNote.position.y
            },
            textReferences: [],
            linkedNotes: [],
            createdAt: now,
            lastModified: now,
        };

        dispatch({ type: 'ADD_NOTE', payload: newNote });

        // Link them
        dispatch({
            type: 'LINK_NOTES',
            payload: { fromId: sourceNote.id, toId: newNote.id },
        });

        dispatch({
            type: 'ADD_CONNECTION',
            payload: {
                id: `conn-${Date.now()}`,
                fromNoteId: sourceNote.id,
                toNoteId: newNote.id,
                type: 'note-to-note',
            },
        });

        // Turn off linking mode and select the new note
        setViewState(prev => ({
            ...prev,
            selectedNoteId: newNote.id,
            linkingFromNoteId: null
        }));
    }, [dispatch, setViewState]);

    return (
        <div
            ref={canvasRef}
            className={`notes-canvas ${viewState.linkingFromNoteId ? 'linking-mode' : ''}`}
            onClick={handleCanvasClick}
        >
            <NoteConnections
                notes={project.notes}
                connections={project.connections}
                canvasRef={canvasRef}
                editorRef={editorRef}
                highlights={project.poem.highlights}
                zoomLevel={zoomLevel}
            />

            {project.notes.map(note => (
                <NoteComponent
                    key={note.id}
                    note={note}
                    zoomLevel={zoomLevel}
                    isSelected={viewState.selectedNoteId === note.id}
                    isHovered={viewState.hoveredNoteId === note.id}
                    isLinkSource={viewState.linkingFromNoteId === note.id}
                    isLinkTarget={viewState.linkingFromNoteId !== null && viewState.linkingFromNoteId !== note.id}
                    onClick={() => handleNoteClick(note.id)}
                    onHover={(hovering) => handleNoteHover(hovering ? note.id : null)}
                    onStartLink={() => handleStartLink(note.id)}
                    onAddConnectedNote={() => handleAddConnectedNote(note)}
                    onPositionChange={(x, y) => handlePositionChange(note.id, x, y)}
                    onContentChange={(content) => handleContentChange(note.id, content)}
                    onDelete={() => handleDeleteNote(note.id)}
                    onToggleCollapse={() => dispatch({ type: 'TOGGLE_NOTE_COLLAPSE', payload: note.id })}
                    onWidthChange={(width) => dispatch({ type: 'UPDATE_NOTE', payload: { id: note.id, width } })}
                />
            ))}

            {project.notes.length === 0 && (
                <div className="empty-canvas">
                    <div className="empty-icon">📝</div>
                    <p>No notes yet</p>
                    <span>Select text in the poem to create notes</span>
                </div>
            )}

            {viewState.linkingFromNoteId && (
                <div className="linking-indicator">
                    Click on a note to create a link, or click empty space to cancel
                </div>
            )}
        </div>
    );
}
