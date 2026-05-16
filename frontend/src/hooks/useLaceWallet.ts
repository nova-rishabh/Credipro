import { useState, useCallback } from 'react';

// Extend Window interface for Midnight Lace wallet injection
declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable: () => Promise<any>;
        isEnabled: () => Promise<boolean>;
      };
    };
  }
}

export function useLaceWallet() {
  const [walletAPI, setWalletAPI] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!window.midnight?.mnLace) {
        throw new Error('Midnight Lace wallet is not installed. Please install the extension.');
      }

      // Standard Midnight dApp Connector API call
      const api = await window.midnight.mnLace.enable();
      
      setWalletAPI(api);
      setIsConnected(true);
      
      // For the MVP, we use a placeholder bytes32 address since the exact 
      // network API to get public key from Midnight's Lace integration may vary
      setAddress('0x' + '1'.repeat(64));
      
    } catch (err: any) {
      console.error('Failed to connect to Lace wallet:', err);
      setError(err.message || 'Failed to connect to wallet');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  return {
    walletAPI,
    isConnected,
    address,
    isConnecting,
    error,
    connect
  };
}
