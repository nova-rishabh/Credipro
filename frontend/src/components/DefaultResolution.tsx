import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
} from '@chakra-ui/react';
import { CrediproClient, toBytes32 } from 'credipro';

const DefaultResolution: React.FC = () => {
  const [loanId, setLoanId] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleTriggerSlashing = async () => {
    setLoading(true);
    try {
      // This is a placeholder for the actual client initialization
      const client = new CrediproClient(
        toBytes32('0x' + '1'.repeat(64)),
        {}
      );
      const response = await client.triggerSlashing(toBytes32(loanId));
      if (response.success) {
        toast({
          title: 'Slashing triggered.',
          description: `Loan ${loanId} marked as defaulted.`,
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error triggering slashing.',
          description: response.error,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error triggering slashing.',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box w="full" p={8} borderWidth={1} borderRadius="lg">
      <VStack spacing={4}>
        <Heading size="lg">Default Resolution</Heading>
        <FormControl>
          <FormLabel>Loan ID</FormLabel>
          <Input
            value={loanId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanId(e.target.value)}
          />
        </FormControl>
        <Button
          onClick={handleTriggerSlashing}
          isLoading={loading}
          loadingText="Triggering..."
        >
          Trigger Slashing
        </Button>
      </VStack>
    </Box>
  );
};

export default DefaultResolution;
