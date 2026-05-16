import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Badge,
  Spinner,
  Code,
  Divider,
} from '@chakra-ui/react';
import { getLoanDetails, LoanDetails } from '../api/crediproApi';

const LoanDetails: React.FC = () => {
  const [loanId, setLoanId] = useState('');
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!loanId.trim()) return;

    setIsLoading(true);
    setError(null);
    setLoanDetails(null);

    try {
      const data = await getLoanDetails(loanId.trim());
      if (data) {
        setLoanDetails(data);
      } else {
        setError('Loan not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loan details');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format a numeric string as a locale-aware decimal string.
   * Example: "1000000" -> "1,000,000.00"
   */
  const formatAmount = (amount: string): string => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  /**
   * Truncate a long string for display, showing only the first and last N chars.
   * Example: "0xabc123...def456" (for 8-char padding)
   */
  const truncate = (str: string, chars: number = 8): string => {
    if (str.length <= chars * 2) return str;
    return `${str.slice(0, chars)}...${str.slice(-chars)}`;
  };

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
        <Heading size="md">Loan Details</Heading>

        {/* Input Section */}
        <HStack spacing={4} align="flex-end">
          <FormControl>
            <FormLabel>Loan ID</FormLabel>
            <Input
              value={loanId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLoanId(e.target.value)
              }
              placeholder="Enter loan ID"
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') handleLookup();
              }}
            />
          </FormControl>
          <Button
            onClick={handleLookup}
            isLoading={isLoading}
            loadingText="Searching"
            colorScheme="purple"
            minW="120px"
          >
            Look Up
          </Button>
        </HStack>

        {/* Loading State */}
        {isLoading && (
          <HStack justify="center" py={8}>
            <Spinner size="lg" color="purple.500" />
            <Text ml={3}>Fetching loan details...</Text>
          </HStack>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Box
            p={4}
            borderRadius="lg"
            bg="rgba(255, 0, 0, 0.1)"
            border="1px solid rgba(255, 0, 0, 0.2)"
          >
            <Text color="red.300">{error}</Text>
          </Box>
        )}

        {/* Loan Details Display */}
        {loanDetails && !isLoading && (
          <>
            <Divider />
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="bold" color="gray.400">
                  Loan ID
                </Text>
                <Code>{truncate(loanDetails.loanId)}</Code>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="bold" color="gray.400">
                  Amount
                </Text>
                <Text fontWeight="semibold">
                  {formatAmount(loanDetails.disbursedAmount)} ADA
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="bold" color="gray.400">
                  Status
                </Text>
                <Badge
                  colorScheme={loanDetails.isDefaulted ? 'red' : 'green'}
                  variant="solid"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                >
                  {loanDetails.isDefaulted ? 'Defaulted' : 'Active'}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="bold" color="gray.400">
                  Interest Rate
                </Text>
                <Text>{loanDetails.interestRate}%</Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="bold" color="gray.400">
                  Lender Address
                </Text>
                <Code fontSize="sm">{truncate(loanDetails.lenderAddress)}</Code>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="bold" color="gray.400">
                  Identity Hash
                </Text>
                <Code fontSize="sm">{truncate(loanDetails.identityHash)}</Code>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="bold" color="gray.400">
                  Borrower Key
                </Text>
                <Code fontSize="sm">
                  {truncate(loanDetails.borrowerPublicKey)}
                </Code>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="bold" color="gray.400">
                  Default Threshold
                </Text>
                <Text>{loanDetails.defaultThreshold}</Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="bold" color="gray.400">
                  Disbursed
                </Text>
                <Text>
                  {new Date(
                    loanDetails.disbursalTimestamp * 1000,
                  ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </HStack>
            </VStack>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default LoanDetails;
