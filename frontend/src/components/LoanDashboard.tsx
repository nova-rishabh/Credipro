import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spinner,
  HStack,
  SimpleGrid,
  Divider,
  Code,
  Badge,
  Progress,
  Tooltip,
  Flex,
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon } from '@chakra-ui/icons';
import { useCredipro } from '../context/CrediproContext';
import { requestLoan, getPoolDetails, PoolDetails } from '../api/crediproApi';
import { useNotify } from '../hooks/useNotify';
import OracleMembers from './OracleMembers';

// ---------------------------------------------------------------------------
// Step definitions for the ZK + ledger flow
// ---------------------------------------------------------------------------
const LOAN_STEPS = [
  { id: 'witness',   label: 'Generating ZK witness locally…',       durationMs: 1400 },
  { id: 'proof',     label: 'Verifying credit eligibility circuit…', durationMs: 2000 },
  { id: 'broadcast', label: 'Broadcasting to Midnight ledger…',      durationMs: 1500 },
  { id: 'settle',    label: 'Settling state & updating indexer…',    durationMs: 1200 },
];

// Preset loan scenarios shown in the dropdown
const PRESETS = [
  { label: '— choose a preset —', amount: 0, term: 0 },
  { label: '🌱 Micro Loan — 500 ADA / 90 days',    amount: 500,   term: 90  },
  { label: '📦 Standard — 5,000 ADA / 180 days',   amount: 5000,  term: 180 },
  { label: '🏗  Business — 25,000 ADA / 365 days',  amount: 25000, term: 365 },
  { label: '🏦 Enterprise — 100,000 ADA / 730 days', amount: 100000, term: 730 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const LoanDashboard: React.FC = () => {
  const { isConnected, contractAddress } = useCredipro();
  const notify = useNotify();

  // --- Form state ---
  const [preset, setPreset] = useState(0);
  const [loanAmount, setLoanAmount] = useState<number>(5000);
  const [termDays, setTermDays]     = useState<number>(180);

  // --- Validation ---
  const [amountError, setAmountError] = useState<string>('');
  const [termError,   setTermError]   = useState<string>('');

  // --- Processing ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep,  setCurrentStep]  = useState<number>(-1); // -1 = idle

  // --- Pool ---
  const [poolParams,    setPoolParams]    = useState<PoolDetails | null>(null);
  const [isFetchingPool, setIsFetchingPool] = useState(false);

  const poolAddress = useMemo(
    () => contractAddress ?? ('0x' + 'f'.repeat(64)),
    [contractAddress]
  );

  // Fetch pool params once connected
  useEffect(() => {
    if (!isConnected) return;
    let active = true;
    const fetchPool = async () => {
      setIsFetchingPool(true);
      try {
        const details = await getPoolDetails(poolAddress);
        if (active && details) setPoolParams(details);
      } catch {
        // non-fatal — show nothing
      } finally {
        if (active) setIsFetchingPool(false);
      }
    };
    fetchPool();
    return () => { active = false; };
  }, [isConnected, poolAddress]);

  // Apply a preset when dropdown changes
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    setPreset(idx);
    if (idx > 0) {
      setLoanAmount(PRESETS[idx].amount);
      setTermDays(PRESETS[idx].term);
      setAmountError('');
      setTermError('');
    }
  };

  // Inline validation
  const validate = (): boolean => {
    let ok = true;
    if (!loanAmount || loanAmount < 100) {
      setAmountError('Minimum loan amount is 100 ADA.');
      ok = false;
    } else if (poolParams && loanAmount > Number(poolParams.riskParams.maxLoanAmount)) {
      setAmountError(`Exceeds pool maximum of ${formatAmount(poolParams.riskParams.maxLoanAmount)} ADA.`);
      ok = false;
    } else {
      setAmountError('');
    }

    if (!termDays || termDays < 7) {
      setTermError('Minimum loan term is 7 days.');
      ok = false;
    } else if (termDays > 1825) {
      setTermError('Maximum loan term is 1,825 days (5 years).');
      ok = false;
    } else {
      setTermError('');
    }
    return ok;
  };

  // Multi-step loan submission
  const handleRequestLoan = async () => {
    if (!validate()) return;

    setIsProcessing(true);
    setCurrentStep(0);

    try {
      for (let i = 0; i < LOAN_STEPS.length; i++) {
        setCurrentStep(i);
        if (i < LOAN_STEPS.length - 1) {
          // All steps except the last are simulated delays
          await new Promise(r => setTimeout(r, LOAN_STEPS[i].durationMs));
        } else {
          // Last step: real API call
          await new Promise(r => setTimeout(r, 600)); // brief UX pause
          const response = await requestLoan(loanAmount, poolAddress, termDays);
          if (response.success) {
            notify({
              title: '✅ Loan Requested!',
              description: `Loan ID: ${response.loanId?.substring(0, 14)}…`,
              status: 'success',
              duration: 8000,
            });
          } else {
            throw new Error(response.error || 'Failed to request loan');
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      notify({ title: 'Loan Request Failed', description: message, status: 'error' });
    } finally {
      setIsProcessing(false);
      setCurrentStep(-1);
    }
  };

  const formatAmount = (amount: string | number): string =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(amount));

  // -------------------------------------------------------------------------
  // Not connected state
  // -------------------------------------------------------------------------
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

  const progressPct =
    currentStep >= 0 ? Math.round(((currentStep + 1) / LOAN_STEPS.length) * 100) : 0;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* Oracle committee */}
      <Box>
        <OracleMembers />
      </Box>

      {/* Pool Parameters */}
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
              <Badge colorScheme="blue" fontSize="sm" px={2}>
                {formatAmount(poolParams.riskParams.maxLoanAmount)} ADA
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.400">Pool Address</Text>
              <Code fontSize="xs">{poolAddress.slice(0, 10)}…{poolAddress.slice(-8)}</Code>
            </HStack>
          </SimpleGrid>
        ) : !isFetchingPool ? (
          <Text color="gray.500" fontSize="sm">Pool parameters unavailable — backend may be offline.</Text>
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
        <VStack spacing={5} align="stretch">
          <Heading size="md" color="white">Request a Loan</Heading>

          {/* Preset picker */}
          <FormControl>
            <FormLabel>Quick Presets</FormLabel>
            <Select
              value={preset}
              onChange={handlePresetChange}
              bg="rgba(255,255,255,0.05)"
              border="1px solid rgba(255,255,255,0.15)"
              _hover={{ borderColor: 'blue.400' }}
              isDisabled={isProcessing}
            >
              {PRESETS.map((p, i) => (
                <option key={i} value={i} style={{ background: '#1a1a2e' }}>
                  {p.label}
                </option>
              ))}
            </Select>
            <FormHelperText color="gray.500" fontSize="xs">
              Select a preset to auto-fill the form, or enter custom values below.
            </FormHelperText>
          </FormControl>

          <Divider borderColor="rgba(255,255,255,0.1)" />

          {/* Amount */}
          <FormControl isInvalid={!!amountError}>
            <Flex justify="space-between" align="center">
              <FormLabel mb={1}>Loan Amount (ADA)</FormLabel>
              {poolParams && (
                <Text fontSize="xs" color="gray.500">
                  max {formatAmount(poolParams.riskParams.maxLoanAmount)} ADA
                </Text>
              )}
            </Flex>
            <NumberInput
              value={loanAmount}
              onChange={(_, val) => { setLoanAmount(val || 0); setPreset(0); }}
              min={100}
              max={poolParams?.riskParams.maxLoanAmount ? Number(poolParams.riskParams.maxLoanAmount) : 1_000_000}
              isDisabled={isProcessing}
              focusBorderColor="blue.400"
            >
              <NumberInputField
                bg="rgba(255,255,255,0.05)"
                border="1px solid rgba(255,255,255,0.15)"
                _hover={{ borderColor: 'blue.400' }}
              />
              <NumberInputStepper>
                <NumberIncrementStepper borderColor="rgba(255,255,255,0.1)" />
                <NumberDecrementStepper borderColor="rgba(255,255,255,0.1)" />
              </NumberInputStepper>
            </NumberInput>
            {amountError
              ? <FormErrorMessage>{amountError}</FormErrorMessage>
              : <FormHelperText color="gray.500" fontSize="xs">Minimum 100 ADA</FormHelperText>
            }
          </FormControl>

          {/* Term */}
          <FormControl isInvalid={!!termError}>
            <FormLabel mb={1}>Loan Term (Days)</FormLabel>
            <NumberInput
              value={termDays}
              onChange={(_, val) => { setTermDays(val || 0); setPreset(0); }}
              min={7}
              max={1825}
              isDisabled={isProcessing}
              focusBorderColor="blue.400"
            >
              <NumberInputField
                bg="rgba(255,255,255,0.05)"
                border="1px solid rgba(255,255,255,0.15)"
                _hover={{ borderColor: 'blue.400' }}
              />
              <NumberInputStepper>
                <NumberIncrementStepper borderColor="rgba(255,255,255,0.1)" />
                <NumberDecrementStepper borderColor="rgba(255,255,255,0.1)" />
              </NumberInputStepper>
            </NumberInput>
            {termError
              ? <FormErrorMessage>{termError}</FormErrorMessage>
              : <FormHelperText color="gray.500" fontSize="xs">7 – 1,825 days</FormHelperText>
            }
          </FormControl>

          {/* Progress steps when processing */}
          {isProcessing && (
            <Box
              p={4}
              borderRadius="lg"
              bg="rgba(66, 153, 225, 0.08)"
              border="1px solid rgba(66, 153, 225, 0.2)"
            >
              <VStack spacing={3} align="stretch">
                {/* Overall bar */}
                <Progress
                  value={progressPct}
                  size="sm"
                  colorScheme="blue"
                  borderRadius="full"
                  hasStripe
                  isAnimated
                  bg="rgba(255,255,255,0.08)"
                />

                {/* Per-step list */}
                {LOAN_STEPS.map((step, idx) => {
                  const done    = idx < currentStep;
                  const active  = idx === currentStep;
                  const pending = idx > currentStep;
                  return (
                    <HStack key={step.id} spacing={3} opacity={pending ? 0.35 : 1} transition="opacity 0.3s">
                      {done ? (
                        <CheckCircleIcon boxSize={4} color="green.400" />
                      ) : active ? (
                        <Spinner size="xs" color="blue.400" />
                      ) : (
                        <TimeIcon boxSize={4} color="gray.500" />
                      )}
                      <Text
                        fontSize="sm"
                        color={done ? 'green.300' : active ? 'blue.200' : 'gray.500'}
                        fontWeight={active ? 'semibold' : 'normal'}
                      >
                        {step.label}
                      </Text>
                      {done && (
                        <Badge colorScheme="green" variant="subtle" fontSize="2xs" ml="auto">
                          done
                        </Badge>
                      )}
                    </HStack>
                  );
                })}
              </VStack>
            </Box>
          )}

          {/* Submit */}
          <Tooltip
            label="Press Enter or click to submit"
            placement="top"
            hasArrow
            isDisabled={isProcessing}
          >
            <Button
              id="loan-request-submit"
              colorScheme="blue"
              size="lg"
              onClick={handleRequestLoan}
              isDisabled={isProcessing}
              isLoading={isProcessing}
              loadingText={currentStep >= 0 ? LOAN_STEPS[currentStep]?.label.replace('…', '') : 'Processing…'}
              w="full"
              _hover={{ transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(66, 153, 225, 0.4)' }}
              transition="all 0.2s"
              fontWeight="semibold"
              letterSpacing="wide"
            >
              Request Loan
            </Button>
          </Tooltip>
        </VStack>
      </Box>
    </VStack>
  );
};
