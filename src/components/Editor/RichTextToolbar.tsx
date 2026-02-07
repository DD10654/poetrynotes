import type { Editor } from '@tiptap/react';
import './RichTextToolbar.css';

interface RichTextToolbarProps {
    editor: Editor | null;
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
    if (!editor) {
        return null;
    }

    return (
        <div className="rich-text-toolbar">
            <div className="toolbar-group">
                <button
                    className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="Italic (Ctrl+I)"
                >
                    <span className="toolbar-icon italic">I</span>
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    title="Align Left"
                >
                    <span className="toolbar-icon">≡</span>
                </button>
                <button
                    className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    title="Align Center"
                >
                    <span className="toolbar-icon center-align">≡</span>
                </button>
                <button
                    className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    title="Align Right"
                >
                    <span className="toolbar-icon right-align">≡</span>
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    className="toolbar-button"
                    onClick={() => {
                        // Insert tab/indentation
                        editor.chain().focus().insertContent('    ').run();
                    }}
                    title="Indent"
                >
                    <span className="toolbar-icon">→|</span>
                </button>
            </div>
        </div>
    );
}
