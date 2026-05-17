import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  FormErrorMessage,
  Progress,
} from '@chakra-ui/react';
import { requestLoan } from '../api/crediproApi';
import { useCredipro } from '../context/CrediproContext';
import { useNotify } from '../hooks/useNotify';

const LoanRequestForm: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [poolAddress, setPoolAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const notify = useNotify();
  const [error, setError] = useState<string | null>(null);

  const { contractAddress } = useCredipro();

  const handleRequestLoan = async () => {
    setError(null);
    // Validation
    const numeric = Number(loanAmount);
    if (!numeric || numeric < 100) {
      setError('Enter a valid loan amount (min 100).');
      return;
    }

    setLoading(true);
    try {
      // show staged progress
      notify({ title: 'Starting loan request', status: 'info' });
      await new Promise((r) => setTimeout(r, 700));

      notify({ title: 'Generating ZK proof', status: 'info' });
      await new Promise((r) => setTimeout(r, 1200));

      const response = await requestLoan(numeric, poolAddress || contractAddress || '0x' + 'f'.repeat(64), 180);

      if (response.success) {
        notify({ title: 'Loan requested', description: `Loan ID: ${response.loanId}`, status: 'success' });
      } else {
        notify({ title: 'Error requesting loan', description: response.error, status: 'error' });
      }
    } catch (err) {
      notify({ title: 'Error requesting loan', description: err instanceof Error ? err.message : 'Unknown error', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box w="full" p={8} borderWidth={1} borderRadius="lg">
      <VStack spacing={4} w="full">
        <Heading size="lg">Request a Loan</Heading>

        <FormControl isInvalid={!!error}>
          <FormLabel>Loan Amount</FormLabel>
          <Select mb={2} value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)}>
            <option value="">— choose a preset —</option>
            <option value="500">Small — 500</option>
            <option value="2000">Medium — 2,000</option>
            <option value="10000">Large — 10,000</option>
          </Select>
          <Input
            type="number"
            placeholder="Enter amount (min 100)"
            value={loanAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanAmount(e.target.value)}
          />
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>

        <FormControl>
          <FormLabel>Pool Address</FormLabel>
          <Input
            value={poolAddress}
            placeholder={contractAddress ?? '0x...'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoolAddress(e.target.value)}
          />
        </FormControl>

        {loading && <Progress size="sm" isIndeterminate colorScheme="blue" w="full" />}

        <Button
          onClick={handleRequestLoan}
          isLoading={loading}
          loadingText="Generating Proof..."
          colorScheme="blue"
          w="full"
        >
          Request Loan
        </Button>
      </VStack>
    </Box>
  );
};

export default LoanRequestForm;
