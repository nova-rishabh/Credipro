import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Button,
  Text,
  SimpleGrid,
  Progress,
  Badge,
  Divider,
  Tag,
  TagLabel,
  TagLeftIcon,
  Spinner,
  Center,
  Tooltip,
  Flex,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
  RepeatIcon,
  LockIcon,
} from '@chakra-ui/icons';
import {
  oracleVote,
  getOracleMembers,
  triggerSlashing,
  getOracleApprovals,
  OracleMember,
  OracleVoteResponse,
} from '../api/crediproApi';
import { useNotify } from '../hooks/useNotify';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VoteState {
  consensusReached: boolean;
  approvalCount: number;
  threshold: number;
  totalMembers: number;
}

interface SlashDisplayState {
  status: 'success' | 'failure';
  message: string;
}

// ---------------------------------------------------------------------------
// Oracle flow steps (for the step indicator)
// ---------------------------------------------------------------------------
const ORACLE_STEPS = [
  { id: 'load-id',   label: 'Enter Loan ID',          description: 'Paste a valid 0x… loan ID (66 chars)' },
  { id: 'cast-vote', label: 'Cast Oracle Votes',       description: 'Each oracle member votes to approve' },
  { id: 'consensus', label: 'Consensus Reached',       description: `≥ ⅔ of members must approve` },
  { id: 'slash',     label: 'Execute Slashing',        description: 'Trigger on-chain penalty for default' },
];

function getActiveStep(loanId: string, vote?: VoteState): number {
  if (!loanId || (!loanId.startsWith('0x') || loanId.length !== 66)) return 0;
  if (!vote || vote.approvalCount === 0) return 1;
  if (!vote.consensusReached) return 2;
  return 3;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DefaultResolution: React.FC = () => {
  const notify = useNotify();

  // --- Loan ID ---
  const [loanId, setLoanId] = useState('');

  // --- Oracle members ---
  const [members, setMembers] = useState<OracleMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  // --- Per-member vote tracking (client side, using member.id) ---
  const [votedMembers, setVotedMembers] = useState<Set<string>>(new Set());

  // --- Aggregate vote state keyed by loanId ---
  const [voteResults, setVoteResults] = useState<Record<string, VoteState>>({});

  // --- Per-member loading indicator (using member.id) ---
  const [votingInProgress, setVotingInProgress] = useState<string | null>(null);

  // --- Manual Sync ---
  const [isSyncing, setIsSyncing] = useState(false);

  // --- Slashing ---
  const [slashingLoading, setSlashingLoading] = useState(false);
  const [slashingResult, setSlashingResult] = useState<SlashDisplayState | null>(null);

  // -----------------------------------------------------------------------
  // Fetch consensus
  // -----------------------------------------------------------------------

  const fetchConsensusProgress = useCallback(async (id: string, showToast = false) => {
    if (!id.startsWith('0x') || id.length !== 66) return;

    try {
      if (showToast) setIsSyncing(true);
      const response = await getOracleApprovals(id);

      setVoteResults((prev) => ({
        ...prev,
        [id]: {
          consensusReached: response.approvalCount >= response.threshold,
          approvalCount: response.approvalCount,
          threshold: response.threshold,
          totalMembers: response.totalMembers,
        },
      }));

      if (showToast) {
        notify({
          title: 'Status Refreshed',
          description: `Approvals: ${response.approvalCount}/${response.threshold}`,
          status: 'info',
        });
      }
    } catch (error) {
      if (showToast) {
        notify({
          title: 'Error refreshing status',
          description: error instanceof Error ? error.message : 'Unknown error',
          status: 'error',
        });
      }
    } finally {
      if (showToast) setIsSyncing(false);
    }
  }, [notify]);

  // -----------------------------------------------------------------------
  // Load members on mount
  // -----------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const fetchMembers = async () => {
      try {
        setMembersLoading(true);
        const response = await getOracleMembers();
        if (!cancelled && response && Array.isArray(response.members)) {
          setMembers(response.members);
        } else if (!cancelled) {
          setMembers([]);
        }
      } catch (error) {
        if (!cancelled) {
          setMembers([]);
          notify({
            title: 'Error fetching oracle members',
            description: error instanceof Error ? error.message : 'Unknown error',
            status: 'error',
          });
        }
      } finally {
        if (!cancelled) setMembersLoading(false);
      }
    };

    fetchMembers();
    return () => { cancelled = true; };
  }, [notify]);

  // Re-fetch consensus when loan ID changes
  useEffect(() => {
    const trimmedId = loanId.trim();
    if (trimmedId.startsWith('0x') && trimmedId.length === 66) {
      fetchConsensusProgress(trimmedId, false);
    }
    // Reset transient client state on ID change
    setVotedMembers(new Set());
    setSlashingResult(null);
  }, [loanId, fetchConsensusProgress]);

  // -----------------------------------------------------------------------
  // Vote handler
  // -----------------------------------------------------------------------

  const handleVote = useCallback(
    async (memberId: string) => {
      const trimmedId = loanId.trim();
      if (!trimmedId) {
        notify({ title: 'Loan ID required', description: 'Please enter a Loan ID before voting.', status: 'warning' });
        return;
      }

      setVotingInProgress(memberId);
      try {
        const response: OracleVoteResponse = await oracleVote(trimmedId, memberId);

        if (response.success) {
          setVotedMembers((prev) => new Set(prev).add(memberId));

          setVoteResults((prev) => ({
            ...prev,
            [trimmedId]: {
              consensusReached: response.consensusReached,
              approvalCount: response.approvalCount,
              threshold: response.threshold,
              totalMembers: response.totalMembers,
            },
          }));

          setSlashingResult(null);

          notify({
            title: `✅ Vote cast`,
            description: `${response.approvalCount}/${response.totalMembers} approvals recorded`,
            status: 'success',
          });
        } else {
          notify({ title: 'Vote failed', description: 'Could not cast vote', status: 'error' });
        }
      } catch (error) {
        notify({
          title: 'Error casting vote',
          description: error instanceof Error ? error.message : 'Unknown error',
          status: 'error',
        });
      } finally {
        setVotingInProgress(null);
      }
    },
    [loanId, notify],
  );

  // -----------------------------------------------------------------------
  // Slashing handler
  // -----------------------------------------------------------------------

  const handleTriggerSlashing = useCallback(async () => {
    const trimmedId = loanId.trim();
    if (!trimmedId) return;

    setSlashingLoading(true);
    try {
      const response = await triggerSlashing(trimmedId);
      if (response.success) {
        setSlashingResult({
          status: 'success',
          message: `Loan ${trimmedId.slice(0, 10)}… marked as defaulted. Slashing executed successfully.`,
        });
        notify({
          title: '⚡ Slashing Triggered',
          description: 'Loan has been marked as defaulted on-chain.',
          status: 'success',
          duration: 9000,
        });
      } else {
        setSlashingResult({
          status: 'failure',
          message: response.error || 'Unknown error occurred while triggering slashing.',
        });
        notify({
          title: 'Slashing failed',
          description: response.error || 'Could not trigger slashing',
          status: 'error',
          duration: 9000,
        });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setSlashingResult({ status: 'failure', message: msg });
      notify({ title: 'Error', description: msg, status: 'error', duration: 9000 });
    } finally {
      setSlashingLoading(false);
    }
  }, [loanId, notify]);

  // -----------------------------------------------------------------------
  // Derived state
  // -----------------------------------------------------------------------

  const trimmedLoanId = loanId.trim();
  const currentVote = trimmedLoanId ? voteResults[trimmedLoanId] : undefined;

  const approvalCount  = currentVote?.approvalCount ?? 0;
  const threshold      = currentVote?.threshold ?? Math.ceil(members.length * (2 / 3));
  const totalMembers   = currentVote?.totalMembers ?? members.length;
  const consensusReached = currentVote?.consensusReached ?? false;

  const progressPercent = threshold > 0 ? Math.min((approvalCount / threshold) * 100, 100) : 0;
  const canVote         = trimmedLoanId.length > 0;
  const remainingVotes  = Math.max(0, threshold - approvalCount);
  const activeStep      = getActiveStep(trimmedLoanId, currentVote);

  const isValidLoanId = trimmedLoanId.startsWith('0x') && trimmedLoanId.length === 66;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <Box
      w="full"
      p={{ base: 4, md: 8 }}
      borderRadius="xl"
      bg="rgba(255, 255, 255, 0.05)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255, 255, 255, 0.1)"
      boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
    >
      <VStack spacing={6} align="stretch">

        {/* -------- Title + Refresh -------- */}
        <HStack justify="space-between" flexWrap="wrap" gap={2}>
          <Heading size="lg" color="white">
            Oracle Voting Panel
          </Heading>
          {isValidLoanId && (
            <Button
              size="sm"
              leftIcon={<RepeatIcon />}
              onClick={() => fetchConsensusProgress(trimmedLoanId, true)}
              isLoading={isSyncing}
              colorScheme="blue"
              variant="outline"
            >
              Refresh Status
            </Button>
          )}
        </HStack>

        <Divider borderColor="rgba(255, 255, 255, 0.15)" />

        {/* -------- Step-flow indicator -------- */}
        <Box
          p={4}
          borderRadius="lg"
          bg="rgba(255,255,255,0.03)"
          border="1px solid rgba(255,255,255,0.08)"
        >
          <Text fontSize="xs" color="gray.500" fontWeight="semibold" mb={3} textTransform="uppercase" letterSpacing="wider">
            Voting Flow
          </Text>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'stretch', md: 'center' }}
            gap={0}
          >
            {ORACLE_STEPS.map((step, idx) => {
              const isDone    = idx < activeStep;
              const isActive  = idx === activeStep;
              const isPending = idx > activeStep;

              return (
                <React.Fragment key={step.id}>
                  <Tooltip label={step.description} hasArrow placement="top">
                    <VStack
                      spacing={1}
                      align="center"
                      flex={1}
                      opacity={isPending ? 0.4 : 1}
                      transition="opacity 0.3s"
                      cursor="default"
                    >
                      {/* Circle indicator */}
                      <Box
                        w={8}
                        h={8}
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg={isDone ? 'green.500' : isActive ? 'blue.500' : 'rgba(255,255,255,0.08)'}
                        border="2px solid"
                        borderColor={isDone ? 'green.400' : isActive ? 'blue.400' : 'rgba(255,255,255,0.15)'}
                        boxShadow={isActive ? '0 0 12px rgba(66,153,225,0.6)' : 'none'}
                        transition="all 0.3s"
                        fontSize="sm"
                        fontWeight="bold"
                        color={isDone ? 'white' : isActive ? 'white' : 'gray.600'}
                      >
                        {isDone ? <CheckCircleIcon boxSize={4} /> : idx + 1}
                      </Box>

                      {/* Label */}
                      <Text
                        fontSize="xs"
                        fontWeight={isActive ? 'bold' : 'normal'}
                        color={isDone ? 'green.300' : isActive ? 'blue.200' : 'gray.600'}
                        textAlign="center"
                        maxW="80px"
                      >
                        {step.label}
                      </Text>
                    </VStack>
                  </Tooltip>

                  {/* Connector line */}
                  {idx < ORACLE_STEPS.length - 1 && (
                    <Box
                      flex={1}
                      h="2px"
                      maxH="2px"
                      bg={idx < activeStep ? 'green.500' : 'rgba(255,255,255,0.1)'}
                      transition="background 0.4s"
                      display={{ base: 'none', md: 'block' }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Flex>
        </Box>

        <Divider borderColor="rgba(255, 255, 255, 0.15)" />

        {/* -------- Loan ID Input -------- */}
        <FormControl isInvalid={trimmedLoanId.length > 0 && !isValidLoanId}>
          <FormLabel fontWeight="semibold">Loan ID</FormLabel>
          <Input
            id="oracle-loan-id"
            placeholder="Enter valid 66-character Loan ID (0x…)"
            value={loanId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanId(e.target.value)}
            bg="rgba(255, 255, 255, 0.05)"
            border="1px solid rgba(255, 255, 255, 0.15)"
            fontFamily="monospace"
            fontSize="sm"
            _hover={{ borderColor: 'blue.400' }}
            _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4299e1' }}
            _invalid={{ borderColor: 'red.400' }}
          />
          <FormHelperText color={trimmedLoanId.length > 0 && !isValidLoanId ? 'red.400' : 'gray.500'} fontSize="xs">
            {trimmedLoanId.length > 0 && !isValidLoanId
              ? `Invalid — must be 0x followed by 64 hex characters (currently ${trimmedLoanId.length} chars)`
              : 'Format: 0x followed by 64 hex characters'}
          </FormHelperText>
        </FormControl>

        <Divider borderColor="rgba(255, 255, 255, 0.15)" />

        {/* -------- Oracle Members -------- */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Oracle Members</Heading>
            {membersLoading && (
              <HStack spacing={2}>
                <Spinner size="sm" color="blue.400" />
                <Text fontSize="sm" color="gray.400">Loading…</Text>
              </HStack>
            )}
          </HStack>

          {membersLoading ? (
            <Center py={8}>
              <Spinner size="lg" color="blue.400" thickness="3px" />
            </Center>
          ) : members.length === 0 ? (
            <Center py={8}>
              <VStack spacing={2}>
                <WarningIcon boxSize={8} color="yellow.400" />
                <Text color="gray.400">No oracle members available</Text>
              </VStack>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {members.map((member) => {
                const hasVoted  = votedMembers.has(member.id);
                const isLoading = votingInProgress === member.id;
                const disabled  = hasVoted || !canVote || !isValidLoanId;

                return (
                  <Box
                    key={member.id}
                    p={5}
                    borderRadius="lg"
                    bg="rgba(255, 255, 255, 0.03)"
                    border="1px solid"
                    borderColor={hasVoted ? 'green.500' : isLoading ? 'blue.500' : 'rgba(255, 255, 255, 0.1)'}
                    transition="all 0.25s"
                    boxShadow={isLoading ? '0 0 16px rgba(66,153,225,0.35)' : 'none'}
                    _hover={{
                      borderColor: hasVoted ? 'green.400' : disabled ? undefined : 'blue.400',
                      bg: disabled ? undefined : 'rgba(255, 255, 255, 0.06)',
                      transform: disabled ? undefined : 'translateY(-2px)',
                    }}
                  >
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="md">{member.name}</Text>
                          <Text fontSize="xs" color="gray.500" isTruncated maxW="180px">
                            {member.publicKey.slice(0, 20)}…
                          </Text>
                        </VStack>

                        <Tag
                          size="sm"
                          variant="subtle"
                          colorScheme={hasVoted ? 'green' : isLoading ? 'blue' : 'gray'}
                          borderRadius="full"
                        >
                          {hasVoted ? <TagLeftIcon as={CheckCircleIcon} /> : isLoading ? <TagLeftIcon as={Spinner} /> : null}
                          <TagLabel>{hasVoted ? 'Voted' : isLoading ? 'Voting…' : 'Pending'}</TagLabel>
                        </Tag>
                      </HStack>

                      <Tooltip
                        label={!isValidLoanId ? 'Enter a valid Loan ID first' : hasVoted ? 'Already voted' : `Vote as ${member.name}`}
                        hasArrow
                      >
                        <Button
                          size="sm"
                          colorScheme={hasVoted ? 'green' : 'blue'}
                          variant={hasVoted ? 'outline' : 'solid'}
                          onClick={() => handleVote(member.id)}
                          isLoading={isLoading}
                          loadingText="Voting…"
                          isDisabled={disabled}
                          w="full"
                          leftIcon={disabled && !hasVoted && !isLoading ? <LockIcon boxSize={3} /> : undefined}
                        >
                          {hasVoted ? 'Vote Recorded ✓' : `Vote as ${member.name}`}
                        </Button>
                      </Tooltip>
                    </VStack>
                  </Box>
                );
              })}
            </SimpleGrid>
          )}
        </Box>

        <Divider borderColor="rgba(255, 255, 255, 0.15)" />

        {/* -------- Consensus Progress -------- */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Heading size="sm" color="gray.300">Consensus Progress</Heading>
            <Badge
              variant="solid"
              colorScheme={consensusReached ? 'green' : approvalCount > 0 ? 'blue' : 'gray'}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
            >
              {consensusReached
                ? '✓ Consensus Reached'
                : approvalCount > 0
                ? `${remainingVotes} more vote${remainingVotes !== 1 ? 's' : ''} needed`
                : 'Awaiting votes'}
            </Badge>
          </HStack>

          <Progress
            value={progressPercent}
            max={100}
            size="lg"
            borderRadius="md"
            colorScheme={consensusReached ? 'green' : 'blue'}
            bg="rgba(255, 255, 255, 0.08)"
            hasStripe={!consensusReached}
            isAnimated={!consensusReached && approvalCount > 0}
            mb={2}
            transition="all 0.5s"
          />

          <HStack justify="space-between" fontSize="sm" color="gray.400">
            <Text>{approvalCount} / {threshold} approvals needed</Text>
            <Text>{totalMembers} member{totalMembers !== 1 ? 's' : ''} total</Text>
          </HStack>
        </Box>

        <Divider borderColor="rgba(255, 255, 255, 0.15)" />

        {/* -------- Slashing Action -------- */}
        <Box>
          {consensusReached ? (
            <VStack spacing={4}>
              <HStack spacing={3} p={3} borderRadius="lg" bg="rgba(72,187,120,0.08)" border="1px solid rgba(72,187,120,0.2)" w="full">
                <CheckCircleIcon boxSize={5} color="green.400" />
                <Text color="green.300" fontWeight="semibold">
                  Consensus threshold met — you may now trigger on-chain slashing.
                </Text>
              </HStack>

              <Button
                id="oracle-trigger-slash"
                colorScheme="red"
                size="lg"
                w="full"
                leftIcon={<WarningIcon />}
                onClick={handleTriggerSlashing}
                isLoading={slashingLoading}
                loadingText="Executing Slashing…"
                isDisabled={slashingLoading}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(229, 62, 62, 0.4)',
                }}
                transition="all 0.2s"
              >
                Trigger Slashing
              </Button>

              {slashingResult && (
                <Box
                  w="full"
                  p={4}
                  borderRadius="lg"
                  bg={slashingResult.status === 'success' ? 'rgba(72, 187, 120, 0.1)' : 'rgba(245, 101, 101, 0.1)'}
                  border="1px solid"
                  borderColor={slashingResult.status === 'success' ? 'rgba(72, 187, 120, 0.3)' : 'rgba(245, 101, 101, 0.3)'}
                >
                  <HStack spacing={3}>
                    {slashingResult.status === 'success'
                      ? <CheckCircleIcon boxSize={5} color="green.400" />
                      : <WarningIcon boxSize={5} color="red.400" />
                    }
                    <Text fontSize="sm" color={slashingResult.status === 'success' ? 'green.200' : 'red.200'}>
                      {slashingResult.message}
                    </Text>
                  </HStack>
                </Box>
              )}
            </VStack>
          ) : (
            <Box
              p={4}
              borderRadius="lg"
              bg="rgba(255, 255, 255, 0.03)"
              border="1px dashed rgba(255, 255, 255, 0.15)"
              textAlign="center"
            >
              <HStack justify="center" spacing={2}>
                <InfoIcon boxSize={4} color="gray.500" />
                <Text fontSize="sm" color="gray.500">
                  {!isValidLoanId
                    ? 'Enter a valid Loan ID above to begin the voting process'
                    : canVote && approvalCount === 0
                    ? 'Cast at least one oracle vote to start building consensus'
                    : 'Awaiting oracle votes to reach consensus threshold…'}
                </Text>
              </HStack>
            </Box>
          )}
        </Box>

      </VStack>
    </Box>
  );
};

export default DefaultResolution;
