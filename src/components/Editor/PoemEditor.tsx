import { useEffect, useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { useProject } from '../../contexts/ProjectContext';
import { RichTextToolbar } from './RichTextToolbar.tsx';
import { getTextSelection, generateHighlightId } from '../../utils/textSelection';
import { calculateNewNotePosition } from '../../utils/layoutAlgorithm';
import { PoetHighlight } from './PoetHighlight';
import { v4 as uuidv4 } from 'uuid';
import './PoemEditor.css';

interface PoemEditorProps {
    onEditorRef: (ref: HTMLDivElement | null) => void;
}

const COLOR_PALETTE = [
    '#e94560', // Rose
    '#ffc107', // Amber
    '#4cc9f0', // Sky Blue
    '#7209b7', // Purple
    '#4361ee', // Royal Blue
    '#4caf50', // Green
    '#ff9f1c', // Orange
    '#f72585', // Neon Pink
    '#00f5d4', // Teal
    '#fee440', // Yellow
];

export function PoemEditor({ onEditorRef }: PoemEditorProps) {
    const { project, dispatch, viewState, setViewState } = useProject();
    const [showCreateNote, setShowCreateNote] = useState(false);
    const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
                code: false,
                blockquote: false,
                bulletList: false,
                orderedList: false,
                listItem: false,
                horizontalRule: false,
            }),
            TextAlign.configure({
                types: ['paragraph'],
                alignments: ['left', 'center', 'right'],
            }),
            PoetHighlight,
        ],
        content: project.poem.content || '<p></p>',
        onUpdate: ({ editor }) => {
            dispatch({ type: 'UPDATE_POEM_CONTENT', payload: editor.getHTML() });
        },
        editorProps: {
            attributes: {
                class: 'poem-editor-content',
                spellcheck: 'false',
            },
            // Handle pointer events for inverse hover
            handleDOMEvents: {
                mouseover: (_view, event) => {

                    const target = event.target as HTMLElement;
                    const highlight = target.closest('.poet-highlight');
                    if (highlight) {
                        const ids = (highlight.getAttribute('data-highlight-id') || '').split(',');
                        // Find the note ID for these highlight IDs
                        // For simplicity, we take the first matching note
                        const note = project.notes.find(n => n.textReferences.some(r => ids.includes(r)));
                        if (note) {
                            setViewState(prev => ({ ...prev, hoveredNoteId: note.id }));
                        }
                    } else {
                        setViewState(prev => ({ ...prev, hoveredNoteId: null }));
                    }
                    return false;
                },
                mouseleave: () => {
                    setViewState(prev => ({ ...prev, hoveredNoteId: null }));
                    return false;
                }
            }
        },
    });

    // ... (sync logic stays the same) ...
    useEffect(() => {
        if (editor && project.poem.content && editor.getHTML() !== project.poem.content) {
            editor.commands.setContent(project.poem.content);
        }
    }, [editor, project.poem.content]);

    // Handle text selection
    const handleMouseUp = useCallback(() => {
        if (!editorContainerRef.current || !editor) return;

        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim()) {
            const { from, to } = editor.state.selection;

            // CHECK: Does the selection contain any existing highlights?
            let hasHighlight = false;
            editor.state.doc.nodesBetween(from, to, (node) => {
                if (node.marks.some(m => m.type.name === 'poetHighlight')) {
                    hasHighlight = true;
                }
            });

            if (hasHighlight) {
                setShowCreateNote(false);
                setSelectionRect(null);
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectionRect(rect);
            setShowCreateNote(true);
        } else {
            setShowCreateNote(false);
            setSelectionRect(null);
        }
    }, [editor]);

    // Cleanup: Remove highlight marks from editor if they no longer exist in project state (deleted notes)
    useEffect(() => {
        if (!editor || !project.poem.highlights) return;

        const validIds = project.poem.highlights.map(h => h.id);


        // Find all data-highlight-id spans and check if they should be stripped
        editor.state.doc.descendants((node, pos) => {
            const mark = node.marks.find(m => m.type.name === 'poetHighlight');
            if (mark) {
                const ids = (mark.attrs.id || '').split(',');
                const filteredIds = ids.filter((id: string) => validIds.includes(id));

                if (filteredIds.length === 0) {
                    // Strip the mark entirely
                    editor.chain().setTextSelection({ from: pos, to: pos + node.nodeSize }).unsetPoetHighlight().run();
                } else if (filteredIds.length !== ids.length) {
                    // Update attribute with remaining IDs
                    editor.chain().setTextSelection({ from: pos, to: pos + node.nodeSize }).setPoetHighlight({ id: filteredIds.join(',') }).run();
                }

            }
        });

        // If we messed with selection for cleaning, return focus to where it was if possible
        // but since this usually happens after dispatch, it's fine.
    }, [project.poem.highlights, editor]);


    // Create note from selection
    const handleCreateNote = useCallback(() => {
        if (!editorContainerRef.current || !editor) return;

        const selectionInfo = getTextSelection(editorContainerRef.current);
        if (!selectionInfo) return;

        const highlightId = generateHighlightId();
        const color = COLOR_PALETTE[project.notes.length % COLOR_PALETTE.length];

        // Find existing highlights in the selection and merge IDs
        const { from, to } = editor.state.selection;
        let mergedId = highlightId;

        editor.state.doc.nodesBetween(from, to, (node) => {
            const mark = node.marks.find(m => m.type.name === 'poetHighlight');
            if (mark && mark.attrs.id) {
                const existingIds = mark.attrs.id.split(',');
                if (!existingIds.includes(highlightId)) {
                    mergedId = [...new Set([...existingIds, highlightId])].join(',');
                }
            }
        });

        // Apply the highlight mark with merged IDs and color
        editor.chain().setPoetHighlight({ id: mergedId, color }).run();

        // Create highlight object
        const highlight = {
            id: highlightId,
            lineIndex: selectionInfo.lineIndex,
            startOffset: selectionInfo.startOffset,
            endOffset: selectionInfo.endOffset,
            text: selectionInfo.text,
            noteIds: [] as string[],
        };

        // ... (note creation and dispatch - adding color to note if needed for UI)
        // Actually the color is in the mark, but we could put it in the note too if we want the note border to match.
        // Let's assume the user just wants different colors for text highlights.

        // Calculate note position
        const canvasRect = document.querySelector('.notes-panel')?.getBoundingClientRect() || null;
        const position = calculateNewNotePosition(project.notes, selectionRect, canvasRect);

        // Create note
        const now = new Date().toISOString();
        const noteId = uuidv4();
        const note = {
            id: noteId,
            content: '',
            position,
            textReferences: [highlightId],
            linkedNotes: [],
            createdAt: now,
            lastModified: now,
        };

        highlight.noteIds = [noteId];

        dispatch({ type: 'ADD_HIGHLIGHT', payload: highlight });
        dispatch({ type: 'ADD_NOTE', payload: note });

        setShowCreateNote(false);
        setSelectionRect(null);
        window.getSelection()?.removeAllRanges();
        setViewState(prev => ({ ...prev, selectedNoteId: noteId }));
    }, [editor, project.notes, selectionRect, dispatch, setViewState]);



    // Pass editor ref to parent
    useEffect(() => {
        onEditorRef(editorContainerRef.current);
    }, [onEditorRef]);

    // Highlight text based on viewState
    useEffect(() => {
        if (!editorContainerRef.current) return;

        // Remove all previous hover classes
        const allHighlights = editorContainerRef.current.querySelectorAll('.poet-highlight');
        allHighlights.forEach(el => el.classList.remove('highlight-hovered'));

        // Find highlights that should be emphasized (hovered note)
        const hoveredNoteId = viewState.hoveredNoteId;
        if (hoveredNoteId) {
            const note = project.notes.find(n => n.id === hoveredNoteId);
            if (note) {
                note.textReferences.forEach(hId => {
                    // Use CSS selector to find elements where data-highlight-id contains the hId
                    const highlightEls = editorContainerRef.current?.querySelectorAll(`[data-highlight-id*="${hId}"]`);
                    highlightEls?.forEach(el => {
                        const ids = (el.getAttribute('data-highlight-id') || '').split(',');
                        if (ids.includes(hId)) {
                            el.classList.add('highlight-hovered');
                        }
                    });
                });
            }
        }
    }, [viewState.hoveredNoteId, project.notes]);



    return (
        <div className="poem-editor-wrapper">
            <RichTextToolbar editor={editor} />

            <div
                ref={editorContainerRef}
                className="poem-editor-container"
                onMouseUp={handleMouseUp}
            >
                <EditorContent editor={editor} />

                {showCreateNote && selectionRect && (
                    <button
                        className="create-note-button"
                        onClick={handleCreateNote}
                        style={{
                            position: 'fixed',
                            left: selectionRect.right + 10,
                            top: selectionRect.top + (selectionRect.height / 2) - 16,
                        }}
                    >
                        + Note
                    </button>
                )}
            </div>
        </div>
    );
}
