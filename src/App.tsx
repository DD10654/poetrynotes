import { useState } from 'react';
import { ProjectProvider } from './contexts/ProjectContext';
import { LandingPage } from './components/LandingPage';
import { MainLayout } from './components/Layout/MainLayout';
import './App.css';

type View = 'landing' | 'editor';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('landing');

  const handleProjectReady = () => {
    setCurrentView('editor');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  return (
    <div className="app">
      {currentView === 'landing' ? (
        <LandingPage onProjectReady={handleProjectReady} />
      ) : (
        <MainLayout onBackToLanding={handleBackToLanding} />
      )}
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;
