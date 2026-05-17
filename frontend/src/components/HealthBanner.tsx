import React, { useEffect, useState } from 'react';
import { HStack, Text, Badge, Spinner, Box } from '@chakra-ui/react';
import { useCredipro } from '../context/CrediproContext';

export const HealthBanner: React.FC = () => {
  const { compiledContractPresent, contractConnected, mockMode, contractAddress } = useCredipro();
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    // simple heartbeat to show activity
    setPolling(true);
    const t = setInterval(() => {}, 10000);
    return () => { clearInterval(t); };
  }, []);

  return (
    <Box mr={4}>
      <HStack spacing={3} align="center">
        <HStack spacing={1}>
          <Badge colorScheme={compiledContractPresent ? 'green' : 'yellow'}>Compiled</Badge>
          <Badge colorScheme={contractConnected ? 'green' : 'red'}>{contractConnected ? 'On-chain' : 'Offline'}</Badge>
          <Badge colorScheme={mockMode ? 'orange' : 'purple'}>{mockMode ? 'Mock' : 'Live'}</Badge>
        </HStack>
        {contractAddress ? (
          <Text fontSize="sm" color="gray.200" fontFamily="monospace">{contractAddress.slice(0,8)}...{contractAddress.slice(-6)}</Text>
        ) : (
          <Text fontSize="sm" color="gray.500">No contract</Text>
        )}
        {polling && <Spinner size="xs" />}
      </HStack>
    </Box>
  );
};

export default HealthBanner;
