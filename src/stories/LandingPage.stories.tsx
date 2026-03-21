import type { Meta, StoryObj } from '@storybook/react-vite';
import { LandingPage } from '../components/LandingPage';
import { ProjectProvider } from '../contexts/ProjectContext';

const meta: Meta<typeof LandingPage> = {
  title: 'Pages/LandingPage',
  component: LandingPage,
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
type Story = StoryObj<typeof LandingPage>;

export const Default: Story = {
  args: {
    onProjectReady: () => alert('Project ready!'),
  },
};
