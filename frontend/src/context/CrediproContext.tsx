import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getHealth, getMode as fetchMode, setMode as putMode } from '../api/crediproApi';

type AppMode = 'demo' | 'production';

interface CrediproContextState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  error: string | null;
  isDemoMode: boolean;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => Promise<void>;
  contractAddress: string | null;
  mockMode: boolean;
  compiledContractPresent: boolean;
  contractConnected: boolean;
  missingEnvVars: string[];
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
  const [appMode, setAppModeState] = useState<AppMode>('demo');
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [mockModeState, setMockModeState] = useState<boolean>(true);
  const [compiledContractPresent, setCompiledContractPresent] = useState<boolean>(false);
  const [contractConnected, setContractConnected] = useState<boolean>(false);
  const [missingEnvVars, setMissingEnvVars] = useState<string[]>([]);

  const demoMode = appMode === 'demo';

  const setAppMode = useCallback(async (mode: AppMode) => {
    const result = await putMode(mode);
    if (result.error) {
      throw new Error(result.error);
    }
    setAppModeState(mode);
    setMockModeState(mode === 'demo');
    setMissingEnvVars(result.missingEnvVars ?? []);
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (demoMode) {
        await new Promise(r => setTimeout(r, 500));
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

  // Fetch backend health and mode on mount
  useEffect(() => {
    let active = true;
    const fetchState = async () => {
      try {
        const [h, m] = await Promise.all([getHealth(), fetchMode()]);
        if (!active) return;
        setContractAddress(h.contractAddress ?? null);
        setMockModeState(!!h.mockMode);
        setCompiledContractPresent(!!h.compiledContractPresent);
        setContractConnected(!!h.contractConnected);
        setAppModeState((m.mode as AppMode) || 'demo');
        setMissingEnvVars(m.missingEnvVars ?? []);
      } catch (e) {
        // ignore — endpoints might be unreachable during dev
      }
    };
    fetchState();
    return () => { active = false; };
  }, []);

  // When running with a real wallet, monitor wallet connection state
  useEffect(() => {
    if (demoMode) return;
    let active = true;
    const poll = async () => {
      try {
        if (window.midnight?.mnLace && typeof window.midnight.mnLace.isEnabled === 'function') {
          const enabled = await window.midnight.mnLace.isEnabled();
          if (!active) return;
          if (!enabled) {
            setIsConnected(false);
            setAddress(null);
          }
        }
      } catch (e) {
        // ignore polling errors
      }
    };
    const id = setInterval(poll, 5000);
    poll();
    return () => { active = false; clearInterval(id); };
  }, [demoMode]);

  const value = {
    isConnected,
    address,
    isConnecting,
    error,
    connectWallet,
    isDemoMode: demoMode,
    appMode,
    setAppMode,
    contractAddress,
    mockMode: mockModeState,
    compiledContractPresent,
    contractConnected,
    missingEnvVars,
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
