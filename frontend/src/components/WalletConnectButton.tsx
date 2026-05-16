import React from 'react';
import { Button, Text, HStack } from '@chakra-ui/react';
import { useCredipro } from '../context/CrediproContext';

export const WalletConnectButton: React.FC = () => {
  const { isConnected, isConnecting, address, connectWallet, error } = useCredipro();

  if (isConnected && address) {
    return (
      <HStack>
        <Text fontSize="sm" fontWeight="medium">Connected:</Text>
        <Text fontSize="sm" fontFamily="monospace" bg="gray.100" p={1} rounded="md">
          {address.slice(0, 6)}...{address.slice(-4)}
        </Text>
      </HStack>
    );
  }

  return (
    <HStack>
      {error && <Text color="red.500" fontSize="sm">{error}</Text>}
      <Button
        colorScheme="blue"
        onClick={connectWallet}
        isLoading={isConnecting}
        loadingText="Connecting..."
      >
        Connect Lace Wallet
      </Button>
    </HStack>
  );
};
