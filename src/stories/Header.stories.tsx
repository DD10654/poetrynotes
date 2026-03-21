import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from '../components/Layout/Header';
import { ProjectProvider } from '../contexts/ProjectContext';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ProjectProvider>
        <Story />
      </ProjectProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    onBackToLanding: () => alert('Back to landing!'),
  },
};
