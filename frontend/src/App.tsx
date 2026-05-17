import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SidebarNav from './components/SidebarNav';
import Dashboard from './components/Dashboard';
import DemoBanner from './components/DemoBanner';
import AutoPilot from './components/AutoPilot';
import Home from './components/Home';
import Portfolio from './components/Portfolio';
import Transactions from './components/Transactions';
import Governance from './components/Governance';
import Docs from './components/Docs';
import Settings from './components/Settings';
import { CrediproProvider } from './context/CrediproContext';

function App() {
  const [currentView, setCurrentView] = useState<string>('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validViews = ['dashboard', 'portfolio', 'transactions', 'governance', 'docs', 'settings'];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
      } else {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderMainContent = () => {
    switch (currentView) {
      case 'portfolio':
        return <Portfolio />;
      case 'transactions':
        return <Transactions />;
      case 'governance':
        return <Governance />;
      case 'docs':
        return <Docs />;
      case 'settings':
        return <Settings />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <CrediproProvider>
      <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans selection:bg-primary/30 selection:text-primary overflow-x-hidden">
        <DemoBanner />
        {currentView === 'home' ? (
          <Home />
        ) : (
          <div className="flex flex-1">
            <SidebarNav />
            <main className="ml-64 flex-1 min-h-screen flex flex-col">
              <Header />
              {renderMainContent()}
            </main>
          </div>
        )}
        <AutoPilot />
      </div>
    </CrediproProvider>
  );
}

export default App;
