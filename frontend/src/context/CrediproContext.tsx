import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CrediproContextState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  error: string | null;
}

const CrediproContext = createContext<CrediproContextState | undefined>(undefined);

// Extend Window interface for Midnight Lace wallet injection
declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable: () => Promise<unknown>;
        isEnabled: () => Promise<boolean>;
      };
    };
  }
}

export const CrediproProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!window.midnight?.mnLace) {
        throw new Error(
          'Midnight Lace wallet is not installed. Please install the extension.'
        );
      }

      await window.midnight.mnLace.enable();
      setIsConnected(true);
      setAddress('0x' + '1'.repeat(64));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to wallet';
      setError(message);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const value = {
    isConnected,
    address,
    isConnecting,
    error,
    connectWallet,
  };

  return (
    <CrediproContext.Provider value={value}>
      {children}
    </CrediproContext.Provider>
  );
};

export const useCredipro = () => {
  const context = useContext(CrediproContext);
  if (context === undefined) {
    throw new Error('useCredipro must be used within a CrediproProvider');
  }
  return context;
};
