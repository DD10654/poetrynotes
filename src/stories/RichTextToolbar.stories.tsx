import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { RichTextToolbar } from '../components/Editor/RichTextToolbar';

const meta: Meta<typeof RichTextToolbar> = {
  title: 'Editor/RichTextToolbar',
  component: RichTextToolbar,
  tags: ['autodocs'],
  // The toolbar uses white text on a translucent dark background, matching
  // the app's dark theme (--color-bg-primary: #0f0f1a). Without this
  // decorator the toolbar appears grey/washed-out in Storybook's white canvas.
  decorators: [
    (Story) => (
      <div style={{ background: '#0f0f1a', minHeight: '60px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RichTextToolbar>;

// Wrapper that provides a real Tiptap editor instance
function ToolbarWithEditor({ italicActive = false }: { italicActive?: boolean }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['paragraph', 'heading'] }),
    ],
    content: italicActive ? '<p><em>Sample poem text</em></p>' : '<p>Sample poem text</p>',
  });
  return <RichTextToolbar editor={editor} />;
}

export const Default: Story = {
  render: () => <ToolbarWithEditor />,
};

export const WithItalicActive: Story = {
  render: () => <ToolbarWithEditor italicActive />,
};

export const NullEditor: Story = {
  args: { editor: null },
};
