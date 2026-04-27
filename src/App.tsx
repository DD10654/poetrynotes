import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider, useProject } from './contexts/ProjectContext';
import { Login } from './pages/Login';
import { LandingPage } from './components/LandingPage';
import { MainLayout } from './components/Layout/MainLayout';
import './App.css';

type View = 'landing' | 'editor';

function AppContent() {
  const { user, loadingAuth, signOut } = useAuth();
  const { setUserId, saveToCloud } = useProject();
  const [currentView, setCurrentView] = useState<View>('landing');

  // Propagate authenticated user ID into ProjectContext so cloud save/load works
  useEffect(() => {
    setUserId(user?.id ?? null);
  }, [user, setUserId]);

  if (loadingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '2rem' }}>📝</span>
      </div>
    );
  }

  if (!user) return <Login />;

  const handleProjectReady = () => setCurrentView('editor');

  const handleBackToLanding = async () => {
    await saveToCloud();
    setCurrentView('landing');
  };

  const handleSignOut = async () => {
    await saveToCloud();
    await signOut();
    setCurrentView('landing');
  };

  return (
    <div className="app">
      {currentView === 'landing' ? (
        <LandingPage onProjectReady={handleProjectReady} onSignOut={handleSignOut} />
      ) : (
        <MainLayout onBackToLanding={handleBackToLanding} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </AuthProvider>
  );
}
