import React, { useState } from 'react';
import { useCredipro } from '../context/CrediproContext';

const DemoBanner: React.FC = () => {
  const { isDemoMode } = useCredipro();
  const [visible, setVisible] = useState(true);

  if (!isDemoMode || !visible) return null;

  return (
    <div className="w-full bg-surface-container-highest/50 border-b border-white/5 py-2 px-margin-desktop flex justify-between items-center gap-3 z-[60] relative backdrop-blur-sm">
      <div className="flex items-center gap-2 mx-auto">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
        </span>
        <p className="text-label-md font-label-md text-on-surface m-0">Demo Mode — Not Live. Connected to Midnight Testnet Simulation</p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-white/40 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors flex items-center justify-center"
        title="Dismiss banner"
      >
        <span className="material-symbols-outlined text-sm" data-icon="close">close</span>
      </button>
    </div>
  );
};

export default DemoBanner;
