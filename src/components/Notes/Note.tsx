import { useRef, useState, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import type { Note as NoteType } from '../../types';
import './Note.css';

interface NoteProps {
    note: NoteType;
    isSelected: boolean;
    isHovered: boolean;
    isLinkSource: boolean;
    isLinkTarget: boolean;
    onClick: () => void;
    onHover: (hovering: boolean) => void;
    onStartLink: () => void;
    onPositionChange: (x: number, y: number) => void;
    onContentChange: (content: string) => void;
    onAddConnectedNote: () => void;
    onDelete: () => void;
}

export function Note({
    note,
    isSelected,
    isHovered,
    isLinkSource,
    isLinkTarget,
    onClick,
    onHover,
    onStartLink,
    onAddConnectedNote,
    onPositionChange,
    onContentChange,
    onDelete,
}: NoteProps) {
    const noteRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [localContent, setLocalContent] = useState(note.content);

    // Sync local content with prop
    useEffect(() => {
        setLocalContent(note.content);
    }, [note.content]);

    // Auto-focus new notes
    useEffect(() => {
        if (isSelected && textareaRef.current && note.content === '') {
            // Force focus with a small timeout to ensure the element is ready and other events have cleared
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(0, 0);
                }
            }, 10);
        }
    }, [isSelected, note.content]);


    // Handle drag start
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).tagName === 'TEXTAREA' ||
            (e.target as HTMLElement).tagName === 'BUTTON') {
            return;
        }

        e.preventDefault();
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - note.position.x,
            y: e.clientY - note.position.y,
        });
    }, [note.position]);

    // Handle dragging
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newX = Math.max(0, e.clientX - dragOffset.x);
            const newY = Math.max(0, e.clientY - dragOffset.y);
            onPositionChange(newX, newY);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, onPositionChange]);

    // Handle content change with debounce
    const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setLocalContent(e.target.value);
    };

    const handleContentBlur = () => {
        if (localContent !== note.content) {
            onContentChange(localContent);
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [localContent]);

    const classNames = [
        'note',
        isSelected && 'selected',
        isHovered && 'hovered',
        isLinkSource && 'link-source',
        isLinkTarget && 'link-target',
        isDragging && 'dragging',
    ].filter(Boolean).join(' ');

    return (
        <div
            ref={noteRef}
            className={classNames}
            style={{
                left: note.position.x,
                top: note.position.y,
            }}
            onClick={onClick}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
        >
            <div className="note-header">
                <div className="note-drag-handle" title="Drag to move">
                    ⋮⋮
                </div>
                <div className="note-actions">
                    <button
                        className="note-action-button link-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onStartLink();
                        }}
                        title="Link to another note"
                    >
                        🔗
                    </button>
                    <button
                        className="note-action-button add-note-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddConnectedNote();
                        }}
                        title="Add connected note"
                    >
                        ➕
                    </button>
                    <button
                        className="note-action-button delete-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        title="Delete note"
                    >
                        ×
                    </button>
                </div>
            </div>

            <textarea
                ref={textareaRef}
                className="note-content"
                value={localContent}
                onChange={handleContentChange}
                onBlur={handleContentBlur}
                placeholder="Add your note..."
                onClick={(e) => e.stopPropagation()}
            />

            {note.linkedNotes.length > 0 && (
                <div className="note-links-count">
                    {note.linkedNotes.length} link{note.linkedNotes.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}
