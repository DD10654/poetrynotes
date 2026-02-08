import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Project, ProjectAction, ViewState, Note, NotePosition } from '../types';

const STORAGE_KEY = 'poetry-notes-project';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Initial empty project
const createEmptyProject = (): Project => {
    const now = new Date().toISOString();
    return {
        projectId: uuidv4(),
        version: '1.0',
        title: 'Untitled Project',
        createdAt: now,
        lastModified: now,
        poem: {
            content: '',
            highlights: [],
        },
        notes: [
            {
                id: 'note-context',
                content: '',
                position: { x: 50, y: 50 },
                textReferences: [],
                linkedNotes: [],
                createdAt: now,
                lastModified: now,
                type: 'context',
                isCollapsed: true,
            },
            {
                id: 'note-personal-response',
                content: '',
                position: { x: 50, y: 150 },
                textReferences: [],
                linkedNotes: [],
                createdAt: now,
                lastModified: now,
                type: 'personal-response',
                isCollapsed: true,
            }
        ],
        connections: [],
    };
};

// Reducer for project state
function projectReducer(state: Project, action: ProjectAction): Project {
    const now = new Date().toISOString();

    switch (action.type) {
        case 'SET_PROJECT':
            return action.payload;

        case 'UPDATE_TITLE':
            return { ...state, title: action.payload, lastModified: now };

        case 'UPDATE_POEM_CONTENT': {
            const newContent = action.payload;
            // Reconcile highlights: keep only those present in the HTML
            const updatedHighlights = state.poem.highlights.filter(h =>
                newContent.includes(`data-highlight-id="${h.id}"`) ||
                newContent.includes(`data-highlight-id="${h.id},`) ||
                newContent.includes(`,${h.id}"`) ||
                newContent.includes(`,${h.id},`)
            );

            // Basic reconciliation: notes that no longer have ANY highlights and NO connections

            const updatedNotes = state.notes.filter(note => {
                if (note.type) return true; // Never auto-delete special notes

                const hasHighlights = updatedHighlights.some(h => note.textReferences.includes(h.id));
                const hasConnections = state.connections.some(c => c.fromNoteId === note.id || c.toNoteId === note.id);
                const hasLinkedNotes = note.linkedNotes.length > 0 || state.notes.some(n => n.linkedNotes.includes(note.id));

                return hasHighlights || hasConnections || hasLinkedNotes;
            });

            return {
                ...state,
                poem: { ...state.poem, content: newContent, highlights: updatedHighlights },
                notes: updatedNotes,
                lastModified: now,
            };
        }


        case 'ADD_HIGHLIGHT':
            return {
                ...state,
                poem: {
                    ...state.poem,
                    highlights: [...state.poem.highlights, action.payload],
                },
                lastModified: now,
            };

        case 'REMOVE_HIGHLIGHT':
            return {
                ...state,
                poem: {
                    ...state.poem,
                    highlights: state.poem.highlights.filter(h => h.id !== action.payload),
                },
                lastModified: now,
            };

        case 'ADD_NOTE':
            return {
                ...state,
                notes: [...state.notes, action.payload],
                lastModified: now,
            };

        case 'UPDATE_NOTE':
            return {
                ...state,
                notes: state.notes.map(note =>
                    note.id === action.payload.id
                        ? { ...note, ...action.payload, lastModified: now }
                        : note
                ),
                lastModified: now,
            };

        case 'UPDATE_NOTE_POSITION':
            return {
                ...state,
                notes: state.notes.map(note =>
                    note.id === action.payload.id
                        ? { ...note, position: action.payload.position }
                        : note
                ),
                lastModified: now,
            };

        case 'DELETE_NOTE': {
            const noteId = action.payload;
            const noteToDelete = state.notes.find(n => n.id === noteId);
            if (noteToDelete?.type) return state; // Guard against deleting special notes

            // Remove note references from highlights
            const updatedHighlights = state.poem.highlights
                .map(h => ({
                    ...h,
                    noteIds: h.noteIds.filter(id => id !== noteId),
                }))
                .filter(h => h.noteIds.length > 0); // Remove orphaned highlights

            // Remove connections involving this note
            const updatedConnections = state.connections.filter(
                c => c.fromNoteId !== noteId && c.toNoteId !== noteId
            );

            // Remove linked note references
            const updatedNotes = state.notes
                .filter(n => n.id !== noteId)
                .map(n => ({
                    ...n,
                    linkedNotes: n.linkedNotes.filter(id => id !== noteId),
                }));

            return {
                ...state,
                notes: updatedNotes,
                poem: { ...state.poem, highlights: updatedHighlights },
                connections: updatedConnections,
                lastModified: now,
            };
        }

        case 'LINK_NOTES': {
            const { fromId, toId } = action.payload;
            return {
                ...state,
                notes: state.notes.map(note => {
                    if (note.id === fromId && !note.linkedNotes.includes(toId)) {
                        return { ...note, linkedNotes: [...note.linkedNotes, toId] };
                    }
                    return note;
                }),
                lastModified: now,
            };
        }

        case 'UNLINK_NOTES': {
            const { fromId, toId } = action.payload;
            return {
                ...state,
                notes: state.notes.map(note => {
                    if (note.id === fromId) {
                        return { ...note, linkedNotes: note.linkedNotes.filter(id => id !== toId) };
                    }
                    return note;
                }),
                connections: state.connections.filter(
                    c => !(c.fromNoteId === fromId && c.toNoteId === toId)
                ),
                lastModified: now,
            };
        }

        case 'ADD_CONNECTION':
            return {
                ...state,
                connections: [...state.connections, action.payload],
                lastModified: now,
            };

        case 'REMOVE_CONNECTION':
            return {
                ...state,
                connections: state.connections.filter(c => c.id !== action.payload),
                lastModified: now,
            };

        case 'TOGGLE_NOTE_COLLAPSE':
            return {
                ...state,
                notes: state.notes.map(note =>
                    note.id === action.payload
                        ? { ...note, isCollapsed: !note.isCollapsed, lastModified: now }
                        : note
                ),
                lastModified: now,
            };

        default:
            return state;
    }
}

// Context types
interface ProjectContextType {
    project: Project;
    viewState: ViewState;
    dispatch: Dispatch<ProjectAction>;
    setViewState: Dispatch<SetStateAction<ViewState>>;

    // Helper functions
    createNote: (highlightId: string, position: NotePosition) => Note;
    saveToLocalStorage: () => void;
    loadFromLocalStorage: () => Project | null;
    exportProject: () => void;
    importProject: (file: File) => Promise<void>;
    createNewProject: () => void;
    hasUnsavedChanges: boolean;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

const initialViewState: ViewState = {
    hoveredNoteId: null,
    selectedNoteId: null,
    linkingFromNoteId: null,
    isCreatingNote: false,
    zoomLevel: 1.0,
};

interface ProjectProviderProps {
    children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
    const [project, dispatch] = useReducer(projectReducer, null, () => {
        const now = new Date().toISOString();
        const ensureSpecialNotes = (p: Project): Project => {
            const hasContext = p.notes.some(n => n.id === 'note-context');
            const hasPersonal = p.notes.some(n => n.id === 'note-personal-response');

            if (hasContext && hasPersonal) return p;

            const updatedNotes = [...p.notes];
            if (!hasContext) {
                updatedNotes.push({
                    id: 'note-context',
                    content: '',
                    position: { x: 50, y: 50 },
                    textReferences: [],
                    linkedNotes: [],
                    createdAt: now,
                    lastModified: now,
                    type: 'context',
                    isCollapsed: true,
                });
            }
            if (!hasPersonal) {
                updatedNotes.push({
                    id: 'note-personal-response',
                    content: '',
                    position: { x: 50, y: 150 },
                    textReferences: [],
                    linkedNotes: [],
                    createdAt: now,
                    lastModified: now,
                    type: 'personal-response',
                    isCollapsed: true,
                });
            }
            return { ...p, notes: updatedNotes };
        };

        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved) as Project;
                    return ensureSpecialNotes(parsed);
                } catch {
                    return createEmptyProject();
                }
            }
        }
        return createEmptyProject();
    });

    const [viewState, setViewState] = useState<ViewState>(initialViewState);
    const [lastSavedAt, setLastSavedAt] = useState<string>(project.lastModified);

    const hasUnsavedChanges = project.lastModified !== lastSavedAt;

    // Save to localStorage
    const saveToLocalStorage = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
        setLastSavedAt(project.lastModified);
    }, [project]);

    // Load from localStorage
    const loadFromLocalStorage = useCallback((): Project | null => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved) as Project;
            } catch {
                return null;
            }
        }
        return null;
    }, []);

    // Auto-save every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (hasUnsavedChanges) {
                saveToLocalStorage();
            }
        }, AUTO_SAVE_INTERVAL);

        return () => clearInterval(interval);
    }, [hasUnsavedChanges, saveToLocalStorage]);

    // Create a new note
    const createNote = useCallback((highlightId: string, position: NotePosition): Note => {
        const now = new Date().toISOString();
        const note: Note = {
            id: uuidv4(),
            content: '',
            position,
            textReferences: [highlightId],
            linkedNotes: [],
            createdAt: now,
            lastModified: now,
        };
        dispatch({ type: 'ADD_NOTE', payload: note });
        return note;
    }, []);

    // Export project as JSON file
    const exportProject = useCallback(() => {
        console.log('=== Export function called ===');
        console.log('Project data:', project);

        // Add error handling
        if (!project) {
            console.error('❌ No project data to export');
            return;
        }

        try {
            console.log('Creating JSON string...');
            const jsonString = JSON.stringify(project, null, 2);
            console.log('JSON string created, length:', jsonString.length);

            console.log('Creating blob...');
            const blob = new Blob([jsonString], { type: 'application/json' });
            console.log('Blob created:', blob.size, 'bytes');

            const timestamp = new Date().toISOString().split('T')[0];
            const safeTitle = (project.title || 'project').replace(/[^a-z0-9]/gi, '-').toLowerCase();
            const filename = `${safeTitle}-${timestamp}.json`;
            console.log('Filename:', filename);

            console.log('Creating download URL...');
            const url = URL.createObjectURL(blob);
            console.log('URL created:', url);

            console.log('Creating and triggering download link...');
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            console.log('Link element:', link);
            console.log('Download attribute:', link.download);

            link.click();
            console.log('✅ Link clicked, download should start');

            // Cleanup
            setTimeout(() => {
                URL.revokeObjectURL(url);
                console.log('🧹 Cleanup completed');
            }, 1000);
        } catch (error) {
            console.error('❌ Export failed:', error);
        }
    }, [project]);



    // Import project from JSON file
    const importProject = useCallback(async (file: File): Promise<void> => {
        try {
            const text = await file.text();
            const projectData = JSON.parse(text) as Project;

            // Basic validation
            if (!projectData.projectId || !projectData.poem || !projectData.notes) {
                throw new Error('Invalid project file format');
            }

            // Ensure special notes
            const now = new Date().toISOString();
            const hasContext = projectData.notes.some(n => n.id === 'note-context');
            const hasPersonal = projectData.notes.some(n => n.id === 'note-personal-response');

            if (!hasContext || !hasPersonal) {
                const updatedNotes = [...projectData.notes];
                if (!hasContext) {
                    updatedNotes.push({
                        id: 'note-context',
                        content: '',
                        position: { x: 50, y: 50 },
                        textReferences: [],
                        linkedNotes: [],
                        createdAt: now,
                        lastModified: now,
                        type: 'context',
                        isCollapsed: true,
                    });
                }
                if (!hasPersonal) {
                    updatedNotes.push({
                        id: 'note-personal-response',
                        content: '',
                        position: { x: 50, y: 150 },
                        textReferences: [],
                        linkedNotes: [],
                        createdAt: now,
                        lastModified: now,
                        type: 'personal-response',
                        isCollapsed: true,
                    });
                }
                projectData.notes = updatedNotes;
            }

            dispatch({ type: 'SET_PROJECT', payload: projectData });
            saveToLocalStorage();
        } catch (error) {
            console.error('Import failed:', error);
            throw error;
        }
    }, [saveToLocalStorage]);

    // Create new project
    const createNewProject = useCallback(() => {
        const newProject = createEmptyProject();
        dispatch({ type: 'SET_PROJECT', payload: newProject });
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const value: ProjectContextType = {
        project,
        viewState,
        dispatch,
        setViewState,
        createNote,
        saveToLocalStorage,
        loadFromLocalStorage,
        exportProject,
        importProject,
        createNewProject,
        hasUnsavedChanges,
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
}
