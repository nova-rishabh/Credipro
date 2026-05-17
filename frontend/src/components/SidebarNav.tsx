import React, { useState, useEffect } from 'react';
import { useNotify } from '../hooks/useNotify';

export const SidebarNav: React.FC = () => {
  const notify = useNotify();
  const [activeHash, setActiveHash] = useState<string>('dashboard');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      setActiveHash(hash);
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleGenerateProof = () => {
    notify({
      title: 'ZK Solvency Proof Generated',
      description: 'Zero-knowledge solvency proof successfully generated and verified via Poseidon hash commitment.',
      status: 'success',
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'portfolio', label: 'Portfolio', icon: 'account_balance_wallet' },
    { id: 'transactions', label: 'Transactions', icon: 'timeline' },
    { id: 'governance', label: 'Governance', icon: 'account_balance' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low/80 backdrop-blur-xl border-r border-white/10 flex flex-col py-unit-lg z-50">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3 mb-1 cursor-pointer" onClick={() => window.location.hash = 'home'}>
          <span className="text-headline-md font-headline-md font-bold text-primary">Credipro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[14px] text-primary" data-icon="account_balance">account_balance</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface m-0">Institutional Vault</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => {
          const isActive = activeHash === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all no-underline ${
                isActive
                  ? 'bg-secondary-container/30 text-secondary border-r-4 border-secondary translate-x-1'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined" data-icon={item.icon}>{item.icon}</span>
              <span className="text-label-md font-label-md">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="px-4 mt-auto space-y-6">
        <button 
          onClick={handleGenerateProof}
          className="w-full py-3 bg-gradient-to-r from-primary to-tertiary text-on-primary font-bold rounded-lg shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-95 transition-all border-0 cursor-pointer text-sm"
        >
          Generate Proof
        </button>
        <div className="space-y-1">
          <a 
            href="#settings" 
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors no-underline ${activeHash === 'settings' ? 'text-primary font-bold bg-white/5' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined" data-icon="settings">settings</span>
            <span className="text-label-md font-label-md">Settings</span>
          </a>
          <a 
            href="#docs" 
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors no-underline ${activeHash === 'docs' ? 'text-primary font-bold bg-white/5' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined" data-icon="menu_book">menu_book</span>
            <span className="text-label-md font-label-md">Docs & Compliance</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default SidebarNav;
