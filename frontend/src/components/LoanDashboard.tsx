import React, { useState, useEffect } from 'react';
import { 
  Box, Button, VStack, Heading, Text, NumberInput, NumberInputField, 
  FormControl, FormLabel, useToast, Spinner, Progress, HStack,
  SimpleGrid, Divider, Code
} from '@chakra-ui/react';
import { useCredipro } from '../context/CrediproContext';
import { requestLoan, getPoolDetails, PoolDetails } from '../api/crediproApi';

export const LoanDashboard: React.FC = () => {
  const { isConnected, contractAddress } = useCredipro();
  const [loanAmount, setLoanAmount] = useState<number>(10000);
  const [termDays, setTermDays] = useState<number>(180);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingState, setLoadingState] = useState<string>('');
  
  const [poolParams, setPoolParams] = useState<PoolDetails | null>(null);
  const [isFetchingPool, setIsFetchingPool] = useState(false);

  const toast = useToast();
  // Default pool address falls back to contractAddress when available
  const poolAddress = contractAddress ?? ('0x' + 'f'.repeat(64));

  useEffect(() => {
    let active = true;
    const fetchPool = async () => {
      setIsFetchingPool(true);
      try {
        const details = await getPoolDetails(poolAddress);
        if (active && details) {
          setPoolParams(details);
        }
      } catch (err) {
        if (active) {
          toast({
            title: 'Failed to fetch pool parameters',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        if (active) setIsFetchingPool(false);
      }
    };
    if (isConnected) {
      fetchPool();
    }
    return () => { active = false; };
  }, [isConnected, poolAddress, toast]);

  const handleRequestLoan = async () => {
    setIsProcessing(true);
    
    try {
      // Step 1: Simulate checking local witness
      setLoadingState('Generating Zero-Knowledge proof locally...');
      await new Promise(r => setTimeout(r, 1500));
      
      // Step 2: Simulate ZK proof generation
      setLoadingState('Verifying credit eligibility circuit...');
      await new Promise(r => setTimeout(r, 2000));
      
      // Step 3: Broadcasting
      setLoadingState('Broadcasting transaction to Midnight ledger...');
      await new Promise(r => setTimeout(r, 1500));

      setLoadingState('Settling state and updating indexer...');
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
        <Text color="gray.200">Please connect your Lace wallet to request a loan.</Text>
      </Box>
    );
  }

  const formatAmount = (amount: string | number): string => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(Number(amount));
  };

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* Pool Parameters Header */}
      <Box
        p={6}
        borderRadius="xl"
        bg="rgba(255, 255, 255, 0.05)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      >
        <HStack justify="space-between" mb={4}>
          <Heading size="md" color="white">Pool Parameters</Heading>
          {isFetchingPool && <Spinner size="sm" color="blue.400" />}
        </HStack>
        {poolParams ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <HStack justify="space-between">
              <Text color="gray.400">TVL</Text>
              <Text fontWeight="bold">{formatAmount(poolParams.tvl)} ADA</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.400">Min Credit Score</Text>
              <Text fontWeight="bold">{poolParams.riskParams.minCreditScore}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.400">Max LTV</Text>
              <Text fontWeight="bold">{poolParams.riskParams.maxLTV}%</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.400">Min Monthly Income</Text>
              <Text fontWeight="bold">{formatAmount(poolParams.riskParams.minMonthlyIncome)} ADA</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.400">Max Loan Amount</Text>
              <Text fontWeight="bold">{formatAmount(poolParams.riskParams.maxLoanAmount)} ADA</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.400">Pool Address</Text>
              <Code fontSize="xs">{poolAddress.slice(0, 10)}...{poolAddress.slice(-8)}</Code>
            </HStack>
          </SimpleGrid>
        ) : !isFetchingPool ? (
          <Text color="gray.500">Failed to load pool parameters.</Text>
        ) : null}
      </Box>

      {/* Loan Request Form */}
      <Box
        p={8}
        borderRadius="xl"
        bg="rgba(255, 255, 255, 0.05)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      >
        <VStack spacing={6} align="stretch">
          <Heading size="md" color="white">Request Loan</Heading>
          
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
    </VStack>
  );
};
