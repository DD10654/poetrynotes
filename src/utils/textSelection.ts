// Text selection utilities for the poem editor

export interface SelectionInfo {
    text: string;
    startOffset: number;
    endOffset: number;
    lineIndex: number;
}

/**
 * Get the current text selection within the editor
 */
export function getTextSelection(editorElement: HTMLElement | null): SelectionInfo | null {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !editorElement) {
        return null;
    }

    const range = selection.getRangeAt(0);
    const text = selection.toString().trim();

    if (!text) {
        return null;
    }

    // Check if selection is within the editor
    if (!editorElement.contains(range.commonAncestorContainer)) {
        return null;
    }

    // Calculate offsets relative to the editor content
    const preSelectionRange = document.createRange();
    preSelectionRange.selectNodeContents(editorElement);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const startOffset = preSelectionRange.toString().length;
    const endOffset = startOffset + text.length;

    // Determine line index (based on paragraph/line structure)
    const lineIndex = getLineIndex(range.startContainer, editorElement);

    return {
        text,
        startOffset,
        endOffset,
        lineIndex,
    };
}

/**
 * Get the line index of a node within the editor
 */
function getLineIndex(node: Node, editorElement: HTMLElement): number {
    // Find the closest paragraph or line element
    let current: Node | null = node;
    while (current && current !== editorElement) {
        if (current.nodeName === 'P' || current.nodeName === 'DIV') {
            break;
        }
        current = current.parentNode;
    }

    if (!current || current === editorElement) {
        return 0;
    }

    // Count preceding siblings
    const paragraphs = editorElement.querySelectorAll('p, div.line');
    let index = 0;
    for (const p of paragraphs) {
        if (p === current || p.contains(current)) {
            return index;
        }
        index++;
    }

    return 0;
}

/**
 * Clear the current text selection
 */
export function clearTextSelection(): void {
    const selection = window.getSelection();
    if (selection) {
        selection.removeAllRanges();
    }
}

/**
 * Generate a unique highlight ID
 */
export function generateHighlightId(): string {
    return `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
