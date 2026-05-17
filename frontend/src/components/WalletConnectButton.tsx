import React from 'react';
import { useCredipro } from '../context/CrediproContext';

export const WalletConnectButton: React.FC = () => {
  const { isConnected, isConnecting, address, connectWallet, error, isDemoMode } = useCredipro();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {isDemoMode && (
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-semibold">
            DEMO
          </span>
        )}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-white/10 rounded-lg shadow-inner">
          <span className="material-symbols-outlined text-secondary text-lg" data-icon="account_balance_wallet">account_balance_wallet</span>
          <span className="text-mono-data font-mono-data text-white font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isDemoMode && (
        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-semibold">
          DEMO
        </span>
      )}
      {error && <span className="text-rose-400 text-sm font-medium">{error}</span>}
      {isConnecting ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-white/10 rounded-lg">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-white/60">Connecting...</span>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-5 py-2 bg-gradient-to-r from-primary to-tertiary text-on-primary font-bold rounded-lg shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-95 transition-all border-0 cursor-pointer text-sm"
        >
          {isDemoMode ? 'Enter Demo Mode' : 'Connect Lace Wallet'}
        </button>
      )}
    </div>
  );
};
