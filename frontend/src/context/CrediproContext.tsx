import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CrediproClient, toBytes32 } from 'credipro';
import { useLaceWallet } from '../hooks/useLaceWallet';

interface CrediproContextState {
  client: CrediproClient | null;
  walletAPI: any | null;
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  error: string | null;
}

const CrediproContext = createContext<CrediproContextState | undefined>(undefined);

export const CrediproProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<CrediproClient | null>(null);
  const { walletAPI, isConnected, address, isConnecting, error, connect } = useLaceWallet();

  useEffect(() => {
    if (isConnected && walletAPI) {
      // Mock contract address for MVP
      const contractAddress = toBytes32('0x' + '1'.repeat(64));
      
      // Initialize the Credipro client
      const crediproClient = new CrediproClient(contractAddress, walletAPI);
      setClient(crediproClient);
    } else {
      setClient(null);
    }
  }, [isConnected, walletAPI]);

  const value = {
    client,
    walletAPI,
    isConnected,
    address,
    isConnecting,
    error,
    connectWallet: connect,
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
