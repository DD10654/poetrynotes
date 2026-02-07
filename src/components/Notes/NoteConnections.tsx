import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { Note, Connection, Highlight } from '../../types';
import './NoteConnections.css';

interface NoteConnectionsProps {
    notes: Note[];
    connections: Connection[];
    canvasRef: RefObject<HTMLDivElement | null>;
    editorRef: HTMLDivElement | null;
    highlights: Highlight[];
}

interface Line {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    type: 'note-to-text' | 'note-to-note';
}

/**
 * Geometric helper to find where a line intersects a rectangle border
 */
function getIntersection(
    startX: number,
    startY: number,
    rect: { x: number; y: number; width: number; height: number }
) {
    const targetX = rect.x + rect.width / 2;
    const targetY = rect.y + rect.height / 2;

    const dx = targetX - startX;
    const dy = targetY - startY;

    if (dx === 0 && dy === 0) return { x: targetX, y: targetY };

    const slope = dy / dx;

    // Potential intersections with horizontal and vertical edges
    let x, y;

    if (Math.abs(dy / rect.height) > Math.abs(dx / rect.width)) {
        // Intersects top or bottom
        y = dy > 0 ? rect.y : rect.y + rect.height;
        x = startX + (y - startY) / slope;
    } else {
        // Intersects left or right
        x = dx > 0 ? rect.x : rect.x + rect.width;
        y = startY + (x - startX) * slope;
    }

    return { x, y };
}

export function NoteConnections({ notes, connections, canvasRef, highlights }: NoteConnectionsProps) {
    const [lines, setLines] = useState<Line[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Update dimensions
    useEffect(() => {
        const updateDimensions = () => {
            if (canvasRef.current) {
                setDimensions({
                    width: canvasRef.current.scrollWidth,
                    height: canvasRef.current.scrollHeight,
                });
            }
        };

        const canvas = canvasRef.current;
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (canvas) {
            resizeObserver.observe(canvas);
        }

        updateDimensions();

        if (canvas) {
            canvas.addEventListener('scroll', updateDimensions);
        }

        return () => {
            resizeObserver.disconnect();
            if (canvas) {
                canvas.removeEventListener('scroll', updateDimensions);
            }
        };
    }, [canvasRef]);

    // Calculate lines
    useEffect(() => {
        const calculateLines = () => {
            const newLines: Line[] = [];
            const canvasRect = canvasRef.current?.getBoundingClientRect();
            if (!canvasRect) return;

            const noteWidth = 220;
            const noteHeight = 100;

            // Note-to-note connections
            connections.forEach(conn => {
                const fromNote = notes.find(n => n.id === conn.fromNoteId);
                const toNote = notes.find(n => n.id === conn.toNoteId);

                if (fromNote && toNote) {
                    const fromCenterX = fromNote.position.x + noteWidth / 2;
                    const fromCenterY = fromNote.position.y + noteHeight / 2;
                    const toCenterX = toNote.position.x + noteWidth / 2;
                    const toCenterY = toNote.position.y + noteHeight / 2;

                    const fromRect = {
                        x: fromNote.position.x,
                        y: fromNote.position.y,
                        width: noteWidth,
                        height: noteHeight
                    };

                    const toRect = {
                        x: toNote.position.x,
                        y: toNote.position.y,
                        width: noteWidth,
                        height: noteHeight
                    };

                    // Origin is the intersection on the 'from' note border towards the 'to' note center
                    const originIntersection = getIntersection(toCenterX, toCenterY, fromRect);
                    // Target is the intersection on the 'to' note border towards the 'from' note center
                    const targetIntersection = getIntersection(fromCenterX, fromCenterY, toRect);

                    newLines.push({
                        id: conn.id,
                        x1: originIntersection.x,
                        y1: originIntersection.y,
                        x2: targetIntersection.x,
                        y2: targetIntersection.y,
                        type: 'note-to-note',
                    });
                }
            });


            // Note-to-text connections
            notes.forEach(note => {
                note.textReferences.forEach(hId => {
                    // Search for elements that contain this highlight ID
                    const highlightEls = document.querySelectorAll(`[data-highlight-id*="${hId}"]`);
                    let highlightEl: Element | null = null;

                    // Filter to find the exact match in comma-separated list
                    highlightEls.forEach(el => {
                        const ids = el.getAttribute('data-highlight-id')?.split(',') || [];
                        if (ids.includes(hId)) {
                            highlightEl = el;
                        }
                    });

                    if (highlightEl) {
                        const hRect = (highlightEl as HTMLElement).getBoundingClientRect();


                        // Origin is the right edge of the highlight text
                        const originX = hRect.right - canvasRect.left;
                        const originY = hRect.top + hRect.height / 2 - canvasRect.top;

                        const targetRect = {
                            x: note.position.x,
                            y: note.position.y,
                            width: noteWidth,
                            height: noteHeight
                        };

                        const intersection = getIntersection(originX, originY, targetRect);

                        newLines.push({
                            id: `text-${note.id}-${hId}`,
                            x1: originX,
                            y1: originY,
                            x2: intersection.x,
                            y2: intersection.y,
                            type: 'note-to-text',
                        });
                    } else {
                        // Fallback if element not found (e.g. not rendered yet)
                        const fallbackY = note.position.y + noteHeight / 2;
                        newLines.push({
                            id: `text-fallback-${note.id}-${hId}`,
                            x1: 0,
                            y1: fallbackY,
                            x2: note.position.x,
                            y2: fallbackY,
                            type: 'note-to-text',
                        });
                    }
                });
            });

            setLines(newLines);
        };

        // Run calculation
        calculateLines();

        // We need to re-run this frequently as the editor scrolls or notes move
        const interval = setInterval(calculateLines, 100);
        return () => clearInterval(interval);

    }, [notes, connections, canvasRef, highlights]);

    if (lines.length === 0) return null;

    return (
        <svg
            className="note-connections-svg"
            width={dimensions.width || '100%'}
            height={dimensions.height || '100%'}
        >
            <defs>
                <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="rgba(255, 193, 7, 0.6)"
                    />
                </marker>
                <marker
                    id="arrowhead-text"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                >
                    <polygon
                        points="0 0, 8 3, 0 6"
                        fill="rgba(233, 69, 96, 0.5)"
                    />
                </marker>
            </defs>

            {lines.map(line => (
                <line
                    key={line.id}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    className={`connection-line ${line.type}`}
                    markerEnd={line.type === 'note-to-note' ? 'url(#arrowhead)' : 'url(#arrowhead-text)'}
                />
            ))}
        </svg>
    );
}
