import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getHealth } from '../api/crediproApi';

interface CrediproContextState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  error: string | null;
  isDemoMode: boolean;
  contractAddress: string | null;
  mockMode: boolean;
  compiledContractPresent: boolean;
  contractConnected: boolean;
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

/**
 * Check if we're in demo mode (no Lace wallet needed).
 * Enabled by default for development; disable by adding ?live to the URL.
 */
function isDemoMode(): boolean {
  if (typeof window === 'undefined') return true;
  const params = new URLSearchParams(window.location.search);
  return !params.has('live');
}

export const CrediproProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const demoMode = isDemoMode();
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [mockModeState, setMockModeState] = useState<boolean>(true);
  const [compiledContractPresent, setCompiledContractPresent] = useState<boolean>(false);
  const [contractConnected, setContractConnected] = useState<boolean>(false);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (demoMode) {
        // Demo mode: auto-connect with a mock address
        await new Promise(r => setTimeout(r, 500)); // Simulate connection delay
        setIsConnected(true);
        setAddress('0x' + '1'.repeat(64));
        return;
      }

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
  }, [demoMode]);

  // Auto-connect in demo mode on mount
  useEffect(() => {
    if (demoMode) {
      connectWallet();
    }
  }, [demoMode, connectWallet]);

  // Fetch backend health to learn runtime flags and deployed address
  useEffect(() => {
    let active = true;
    const fetchHealth = async () => {
      try {
        const h = await getHealth();
        if (!active) return;
        setContractAddress(h.contractAddress ?? null);
        setMockModeState(!!h.mockMode);
        setCompiledContractPresent(!!h.compiledContractPresent);
        setContractConnected(!!h.contractConnected);
      } catch (e) {
        // ignore — health endpoint might be unreachable during dev
      }
    };
    fetchHealth();
    return () => { active = false; };
  }, []);

  const value = {
    isConnected,
    address,
    isConnecting,
    error,
    connectWallet,
    isDemoMode: demoMode,
    contractAddress,
    mockMode: mockModeState,
    compiledContractPresent,
    contractConnected,
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
