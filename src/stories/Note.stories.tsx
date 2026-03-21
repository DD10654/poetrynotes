import type { Meta, StoryObj } from '@storybook/react-vite';
import { Note } from '../components/Notes/Note';
import type { Note as NoteType } from '../types';

const baseNote: NoteType = {
  id: '1',
  content: 'The repetition of "half" emphasises the speaker\'s sense of incompleteness.',
  position: { x: 0, y: 0 },
  textReferences: [],
  linkedNotes: [],
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  width: 260,
};

const meta: Meta<typeof Note> = {
  title: 'Notes/Note',
  component: Note,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '300px', padding: '40px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    note: baseNote,
    zoomLevel: 1,
    isSelected: false,
    isHovered: false,
    isLinkSource: false,
    isLinkTarget: false,
    onClick: () => {},
    onHover: () => {},
    onStartLink: () => {},
    onPositionChange: () => {},
    onContentChange: () => {},
    onAddConnectedNote: () => {},
    onDelete: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof Note>;

export const Default: Story = {};

export const Selected: Story = {
  args: { isSelected: true },
};

export const Hovered: Story = {
  args: { isHovered: true },
};

export const LinkSource: Story = {
  args: { isLinkSource: true },
};

export const LinkTarget: Story = {
  args: { isLinkTarget: true },
};

export const Empty: Story = {
  args: { note: { ...baseNote, content: '' } },
};

export const Context: Story = {
  args: {
    note: {
      ...baseNote,
      type: 'context',
      content: 'Written in 1819 during Keats\' period of great productivity.',
    },
    onToggleCollapse: () => {},
  },
};

export const PersonalResponse: Story = {
  args: {
    note: {
      ...baseNote,
      type: 'personal-response',
      content: 'I find the ode deeply melancholic — the speaker longs to escape yet knows he cannot.',
    },
    onToggleCollapse: () => {},
  },
};

export const Collapsed: Story = {
  args: {
    note: {
      ...baseNote,
      type: 'context',
      content: 'Historical context note.',
      isCollapsed: true,
    },
    onToggleCollapse: () => {},
  },
};

export const WithLinks: Story = {
  args: {
    note: {
      ...baseNote,
      linkedNotes: ['2', '3'],
    },
  },
};
