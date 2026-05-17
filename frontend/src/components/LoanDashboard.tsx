import React, { useState } from 'react';
import { 
  Box, Button, VStack, Heading, Text, NumberInput, NumberInputField, 
  FormControl, FormLabel, useToast, Spinner, Progress, HStack
} from '@chakra-ui/react';
import { useCredipro } from '../context/CrediproContext';
import { requestLoan } from '../api/crediproApi';

export const LoanDashboard: React.FC = () => {
  const { isConnected } = useCredipro();
  const [loanAmount, setLoanAmount] = useState<number>(10000);
  const [termDays, setTermDays] = useState<number>(180);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingState, setLoadingState] = useState<string>('');
  
  const toast = useToast();

  const handleRequestLoan = async () => {
    setIsProcessing(true);
    
    try {
      // Step 1: Simulate checking local witness
      setLoadingState('Verifying Local Witness...');
      await new Promise(r => setTimeout(r, 1500));
      
      // Step 2: Simulate ZK proof generation
      setLoadingState('Generating Zero-Knowledge Proof...');
      await new Promise(r => setTimeout(r, 2000));
      
      // Step 3: Submit via API to backend
      setLoadingState('Submitting Proof to Ledger...');
      
      const poolAddress = '0x' + 'f'.repeat(64);
      
      const response = await requestLoan(loanAmount, poolAddress, termDays);

      if (response.success) {
        toast({
          title: 'Loan Approved!',
          description: `Loan ID: ${response.loanId?.substring(0, 10)}...`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(response.error || 'Failed to request loan');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
      setLoadingState('');
    }
  };

  if (!isConnected) {
    return (
      <Box
        p={8}
        borderRadius="xl"
        bg="rgba(255, 255, 255, 0.05)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        textAlign="center"
      >
        <Text>Please connect your Lace wallet to request a loan.</Text>
      </Box>
    );
  }

  return (
    <Box
      p={8}
      borderRadius="xl"
      bg="rgba(255, 255, 255, 0.05)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255, 255, 255, 0.1)"
      boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
    >
      <VStack spacing={6} align="stretch">
        <Heading size="md">Request Loan</Heading>
        
        <FormControl>
          <FormLabel>Loan Amount</FormLabel>
          <NumberInput value={loanAmount} onChange={(_: string, val: number) => setLoanAmount(val || 0)} min={100}>
            <NumberInputField />
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Term (Days)</FormLabel>
          <NumberInput value={termDays} onChange={(_: string, val: number) => setTermDays(val || 0)} min={1}>
            <NumberInputField />
          </NumberInput>
        </FormControl>

        {isProcessing && (
          <Box pt={4}>
            <HStack mb={2}>
              <Spinner size="sm" color="blue.500" />
              <Text fontSize="sm" fontWeight="medium">{loadingState}</Text>
            </HStack>
            <Progress size="sm" isIndeterminate colorScheme="blue" borderRadius="md" />
          </Box>
        )}

        <Button 
          colorScheme="green" 
          size="lg"
          onClick={handleRequestLoan}
          isDisabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Request Loan'}
        </Button>
      </VStack>
    </Box>
  );
};
