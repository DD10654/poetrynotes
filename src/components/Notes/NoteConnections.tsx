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
    zoomLevel: number;
}

interface Line {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    type: 'note-to-text' | 'note-to-note';
    color?: string;
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

export function NoteConnections({ notes, connections, canvasRef, highlights, zoomLevel }: NoteConnectionsProps) {
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



            // Helper map to store user-defined colors for each note
            const noteColors = new Map<string, string>();

            // Note-to-text connections (First pass to determine note colors)
            notes.forEach(note => {
                // Get actual note dimensions and adjust by zoom
                const noteEl = document.getElementById(`note-${note.id}`);
                const nRect = noteEl ? noteEl.getBoundingClientRect() : { width: note.width || 220, height: 100 };

                const noteWidth = (note.width || nRect.width / zoomLevel);
                const noteHeight = nRect.height / zoomLevel;

                const currentNoteRect = {
                    x: note.position.x,
                    y: note.position.y,
                    width: noteWidth,
                    height: noteHeight
                };

                note.textReferences.forEach(hId => {
                    // Search for elements that contain this highlight ID
                    const highlightEls = document.querySelectorAll(`[data-highlight-id*="${hId}"]`);
                    let highlightEl: Element | null = null;
                    let color = 'rgba(233, 69, 96, 0.5)'; // Default fallback

                    // Filter to find the exact match in comma-separated list
                    highlightEls.forEach(el => {
                        const ids = el.getAttribute('data-highlight-id')?.split(',') || [];
                        if (ids.includes(hId)) {
                            highlightEl = el;
                            // Extract color from style or attribute if available
                            const style = el.getAttribute('style');
                            if (style) {
                                const match = style.match(/background-color:\s*([^;]+)/);
                                if (match) {
                                    color = match[1];
                                }
                            }
                            const dataColor = el.getAttribute('data-highlight-color');
                            if (dataColor) {
                                color = dataColor;
                            }
                        }
                    });

                    // Store the color for this note
                    if (!noteColors.has(note.id)) {
                        noteColors.set(note.id, color);
                    }

                    if (highlightEl) {
                        const hRect = (highlightEl as HTMLElement).getBoundingClientRect();
                        const pEl = (highlightEl as HTMLElement).closest('p') || highlightEl;
                        const pRect = (pEl as HTMLElement).getBoundingClientRect();

                        // local Canvas distances (divide by zoom)
                        const localCanvasTop = canvasRect.top;
                        const localCanvasLeft = canvasRect.left;

                        const originY = (hRect.top + hRect.height / 2 - localCanvasTop) / zoomLevel;

                        // Decide whether to use left or right of the paragraph based on note position
                        const noteCenterX = note.position.x + noteWidth / 2;
                        const highlightCenterX = (hRect.left + hRect.width / 2 - localCanvasLeft) / zoomLevel;

                        let originX;
                        if (noteCenterX < highlightCenterX) {
                            // Note is to the left of the highlight, start from paragraph left
                            originX = (pRect.left - localCanvasLeft) / zoomLevel;
                        } else {
                            // Note is to the right of the highlight, start from paragraph right
                            originX = (pRect.right - localCanvasLeft) / zoomLevel;
                        }

                        const intersection = getIntersection(originX, originY, currentNoteRect);

                        // If entering from right, adjust x slightly to avoid clipping if necessary
                        // Actually let's just use the intersection as is but verify dx/dy

                        newLines.push({
                            id: `text-${note.id}-${hId}`,
                            x1: originX,
                            y1: originY,
                            x2: intersection.x,
                            y2: intersection.y,
                            type: 'note-to-text',
                            color: color
                        });
                    } else {
                        // Fallback if element not found (e.g. not rendered yet)
                        const fallbackY = note.position.y + currentNoteRect.height / 2;
                        newLines.push({
                            id: `text-fallback-${note.id}-${hId}`,
                            x1: 0,
                            y1: fallbackY,
                            x2: note.position.x,
                            y2: fallbackY,
                            type: 'note-to-text',
                            color: color
                        });
                    }
                });
            });

            // Note-to-note connections (Second pass to use correct colors)
            connections.forEach(conn => {
                const fromNote = notes.find(n => n.id === conn.fromNoteId);
                const toNote = notes.find(n => n.id === conn.toNoteId);

                if (fromNote && toNote) {
                    // Get actual note dimensions and adjust by zoom
                    const fromNoteEl = document.getElementById(`note-${fromNote.id}`);
                    const toNoteEl = document.getElementById(`note-${toNote.id}`);

                    const fromRectScaled = fromNoteEl ? fromNoteEl.getBoundingClientRect() : { width: fromNote.width || 220, height: 100 };
                    const toRectScaled = toNoteEl ? toNoteEl.getBoundingClientRect() : { width: toNote.width || 220, height: 100 };

                    const fromWidth = fromNote.width || (fromRectScaled.width / zoomLevel);
                    const fromHeight = fromRectScaled.height / zoomLevel;
                    const toWidth = toNote.width || (toRectScaled.width / zoomLevel);
                    const toHeight = toRectScaled.height / zoomLevel;

                    const fromRect = {
                        x: fromNote.position.x,
                        y: fromNote.position.y,
                        width: fromWidth,
                        height: fromHeight
                    };

                    const toRect = {
                        x: toNote.position.x,
                        y: toNote.position.y,
                        width: toWidth,
                        height: toHeight
                    };

                    const fromCenterX = fromRect.x + fromRect.width / 2;
                    const fromCenterY = fromRect.y + fromRect.height / 2;
                    const toCenterX = toRect.x + toRect.width / 2;
                    const toCenterY = toRect.y + toRect.height / 2;

                    // Origin is the intersection on the 'from' note border towards the 'to' note center
                    const originIntersection = getIntersection(toCenterX, toCenterY, fromRect);
                    // Target is the intersection on the 'to' note border towards the 'from' note center
                    const targetIntersection = getIntersection(fromCenterX, fromCenterY, toRect);

                    // Propagate color from source note if available
                    let lineColor = 'rgba(255, 193, 7, 0.4)'; // Default connection color
                    if (noteColors.has(fromNote.id)) {
                        lineColor = noteColors.get(fromNote.id) || lineColor;
                    }

                    newLines.push({
                        id: conn.id,
                        x1: originIntersection.x,
                        y1: originIntersection.y,
                        x2: targetIntersection.x,
                        y2: targetIntersection.y,
                        type: 'note-to-note',
                        color: lineColor
                    });

                    // Also propgate color to the 'to' note for future connections if it doesn't have one
                    if (!noteColors.has(toNote.id) && noteColors.has(fromNote.id)) {
                        noteColors.set(toNote.id, noteColors.get(fromNote.id)!);
                    }
                }
            });

            setLines(newLines);
        };

        // Run calculation
        calculateLines();

        // We need to re-run this frequently as the editor scrolls or notes move
        const interval = setInterval(calculateLines, 100);
        return () => clearInterval(interval);

    }, [notes, connections, canvasRef, highlights, zoomLevel]);

    if (lines.length === 0) return null;

    return (
        <svg
            className="note-connections-svg"
            width={dimensions.width || '100%'}
            height={dimensions.height || '100%'}
        >
            <defs>
                {lines.map(line => (
                    <marker
                        key={`arrowhead-${line.id}`}
                        id={`arrowhead-${line.id}`}
                        markerWidth="10"
                        markerHeight="7"
                        refX="10"
                        refY="3.5"
                        orient="auto"
                    >
                        <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill={line.color || "rgba(255, 193, 7, 0.6)"}
                            fillOpacity="0.6"
                        />
                    </marker>
                ))}
            </defs>

            {lines.map(line => (
                <line
                    key={line.id}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    className={`connection-line ${line.type}`}
                    style={{ stroke: line.color }}
                    markerEnd={`url(#arrowhead-${line.id})`}
                />
            ))}
        </svg>
    );
}
