import React, { useEffect, useState } from 'react';
import { useCredipro } from '../context/CrediproContext';

export const HealthBanner: React.FC = () => {
  const { compiledContractPresent, contractConnected, mockMode, contractAddress } = useCredipro();
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    setPolling(true);
    const t = setInterval(() => {}, 10000);
    return () => { clearInterval(t); };
  }, []);

  return (
    <div className="flex items-center gap-3">
      {/* Testnet pill from code.html */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high border border-white/5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
        <span className="text-mono-data font-mono-data text-on-surface">Midnight Testnet</span>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        <span className={`px-2 py-0.5 rounded ${compiledContractPresent ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'}`}>
          Compiled
        </span>
        <span className={`px-2 py-0.5 rounded ${contractConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
          {contractConnected ? 'On-chain' : 'Offline'}
        </span>
        <span className={`px-2 py-0.5 rounded ${mockMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
          {mockMode ? 'Mock' : 'Live'}
        </span>
      </div>

      {/* Contract Address */}
      {contractAddress ? (
        <span className="text-xs text-white/60 font-mono bg-white/5 px-2 py-1 rounded border border-white/10">
          {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
        </span>
      ) : (
        <span className="text-xs text-white/40">No contract</span>
      )}

      {polling && (
        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      )}
    </div>
  );
};

export default HealthBanner;
