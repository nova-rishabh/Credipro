import React from 'react';
import { Button, Text, HStack, Badge, Spinner } from '@chakra-ui/react';
import { useCredipro } from '../context/CrediproContext';

export const WalletConnectButton: React.FC = () => {
  const { isConnected, isConnecting, address, connectWallet, error, isDemoMode } = useCredipro();

  if (isConnected && address) {
    return (
      <HStack spacing={3}>
        {isDemoMode && (
          <Badge colorScheme="purple" variant="solid" px={2} py={0.5} borderRadius="full" fontSize="xs">
            DEMO
          </Badge>
        )}
        <Text fontSize="sm" fontWeight="medium" color="gray.300">
          Connected:
        </Text>
        <Text fontSize="sm" fontFamily="monospace" bg="rgba(255,255,255,0.1)" px={2} py={1} borderRadius="md">
          {address.slice(0, 6)}...{address.slice(-4)}
        </Text>
      </HStack>
    );
  }

  return (
    <HStack spacing={3}>
      {isDemoMode && (
        <Badge colorScheme="purple" variant="solid" px={2} py={0.5} borderRadius="full" fontSize="xs">
          DEMO
        </Badge>
      )}
      {error && <Text color="red.400" fontSize="sm">{error}</Text>}
      {isConnecting ? (
        <HStack spacing={2}>
          <Spinner size="sm" color="purple.300" />
          <Text color="gray.300" fontSize="sm">Connecting...</Text>
        </HStack>
      ) : (
        <Button colorScheme="blue" onClick={connectWallet}>
          {isDemoMode ? 'Enter Demo Mode' : 'Connect Lace Wallet'}
        </Button>
      )}
    </HStack>
  );
};
