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
    <div className="flex items-center gap-1.5">
      <span className={`text-[10px] font-bold uppercase tracking-wider ${isDemo ? 'text-amber-300' : 'text-white/30'}`}>Demo</span>
      <button
        onClick={handleToggle}
        disabled={switching}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
          isDemo ? 'bg-amber-500/40' : 'bg-purple-500/40'
        } ${switching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        role="switch"
        aria-checked={!isDemo}
        title={isDemo ? 'Switch to Production mode' : 'Switch to Demo mode'}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
            isDemo ? 'translate-x-1' : 'translate-x-[18px]'
          }`}
        />
      </button>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${!isDemo ? 'text-purple-300' : 'text-white/30'}`}>Prod</span>
      {switching && (
        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      )}
      {error && (
        <span className="text-[10px] text-rose-400 max-w-[150px] truncate" title={error}>
          {error}
        </span>
      )}
    </div>
  );
};

export default ModeToggle;
