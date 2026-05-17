import React, { useState } from 'react';
import { useCredipro } from '../context/CrediproContext';

const ModeToggle: React.FC = () => {
  const { appMode, setAppMode, missingEnvVars } = useCredipro();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    setError(null);
    const target = appMode === 'demo' ? 'production' : 'demo';
    if (target === 'production' && missingEnvVars.length > 0) {
      setError(`Missing env vars: ${missingEnvVars.join(', ')}`);
      return;
    }
    setSwitching(true);
    try {
      await setAppMode(target);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Switch failed');
    } finally {
      setSwitching(false);
    }
  };

  const isDemo = appMode === 'demo';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={switching}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
          isDemo
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
            : 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30'
        } ${switching ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isDemo ? 'Switch to Production mode' : 'Switch to Demo mode'}
      >
        <span className={`w-2 h-2 rounded-full ${isDemo ? 'bg-amber-400' : 'bg-purple-400'}`} />
        {switching ? 'Switching...' : isDemo ? 'Demo' : 'Production'}
      </button>
      {error && (
        <span className="text-xs text-rose-400 max-w-[200px] truncate" title={error}>
          {error}
        </span>
      )}
    </div>
  );
};

export default ModeToggle;
