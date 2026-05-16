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

const LoanRequestForm: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [poolAddress, setPoolAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleRequestLoan = async () => {
    setLoading(true);
    try {
      // This is a placeholder for the actual client initialization
      const client = new CrediproClient(
        toBytes32('0x' + '1'.repeat(64)),
        {}
      );
      const response = await client.requestLoan(
        BigInt(loanAmount),
        toBytes32(poolAddress),
        BigInt(180)
      );
      if (response.success) {
        toast({
          title: 'Loan requested.',
          description: `Loan ID: ${response.loanId}`,
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error requesting loan.',
          description: response.error,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error requesting loan.',
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
        <Heading size="lg">Request a Loan</Heading>
        <FormControl>
          <FormLabel>Loan Amount</FormLabel>
          <Input
            type="number"
            value={loanAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanAmount(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Pool Address</FormLabel>
          <Input
            value={poolAddress}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoolAddress(e.target.value)}
          />
        </FormControl>
        <Button
          onClick={handleRequestLoan}
          isLoading={loading}
          loadingText="Generating Proof..."
        >
          Request Loan
        </Button>
      </VStack>
    </Box>
  );
};

export default LoanRequestForm;
