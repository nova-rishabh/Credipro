import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Text,
  SimpleGrid,
  Progress,
  Badge,
  Divider,
  Tag,
  TagLabel,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, InfoIcon, RepeatIcon } from '@chakra-ui/icons';
import {
  oracleVote,
  getOracleMembers,
  triggerSlashing,
  getOracleApprovals,
  OracleMember,
  OracleVoteResponse,
} from '../api/crediproApi';

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
// Component
// ---------------------------------------------------------------------------

const DefaultResolution: React.FC = () => {
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

  const toast = useToast();

  // -----------------------------------------------------------------------
  // Handlers & Helpers
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
        toast({
          title: 'Status Refreshed',
          description: `Approvals: ${response.approvalCount}/${response.threshold}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      if (showToast) {
        toast({
          title: 'Error refreshing status',
          description: error instanceof Error ? error.message : 'Unknown error',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      if (showToast) setIsSyncing(false);
    }
  }, [toast]);

  // -----------------------------------------------------------------------
  // Effects
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
          toast({
            title: 'Error fetching oracle members',
            description: error instanceof Error ? error.message : 'Unknown error',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        if (!cancelled) {
          setMembersLoading(false);
        }
      }
    };

    fetchMembers();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  // Dynamic Ledger Fetching
  useEffect(() => {
    const trimmedId = loanId.trim();
    if (trimmedId.startsWith('0x') && trimmedId.length === 66) {
      fetchConsensusProgress(trimmedId, false);
    }
    
    // Reset transient client state on ID change
    setVotedMembers(new Set());
    setSlashingResult(null);
  }, [loanId, fetchConsensusProgress]);

  const handleVote = useCallback(
    async (memberId: string) => {
      const trimmedId = loanId.trim();
      if (!trimmedId) {
        toast({
          title: 'Loan ID required',
          description: 'Please enter a Loan ID before voting.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      setVotingInProgress(memberId);
      try {
        const response: OracleVoteResponse = await oracleVote(trimmedId, memberId);

        if (response.success) {
          // Mark member as voted
          setVotedMembers((prev) => new Set(prev).add(memberId));

          // Store aggregate vote state keyed by loan id
          setVoteResults((prev) => ({
            ...prev,
            [trimmedId]: {
              consensusReached: response.consensusReached,
              approvalCount: response.approvalCount,
              threshold: response.threshold,
              totalMembers: response.totalMembers,
            },
          }));

          // Clear previous slashing result on new vote cycle
          setSlashingResult(null);

          toast({
            title: `Vote cast successfully`,
            description: `${response.approvalCount}/${response.totalMembers} approvals`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Vote failed',
            description: 'Could not cast vote',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: 'Error casting vote',
          description: error instanceof Error ? error.message : 'Unknown error',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setVotingInProgress(null);
      }
    },
    [loanId, toast],
  );

  const handleTriggerSlashing = useCallback(async () => {
    const trimmedId = loanId.trim();
    if (!trimmedId) return;

    setSlashingLoading(true);
    try {
      const response = await triggerSlashing(trimmedId);
      if (response.success) {
        setSlashingResult({
          status: 'success',
          message: `Loan ${trimmedId.slice(0, 10)}... has been marked as defaulted and slashing was triggered successfully.`,
        });
        toast({
          title: 'Slashing triggered',
          description: `Loan has been marked as defaulted.`,
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
      } else {
        setSlashingResult({
          status: 'failure',
          message: response.error || 'Unknown error occurred while triggering slashing.',
        });
        toast({
          title: 'Slashing failed',
          description: response.error || 'Could not trigger slashing',
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (error) {
      setSlashingResult({
        status: 'failure',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setSlashingLoading(false);
    }
  }, [loanId, toast]);

  // -----------------------------------------------------------------------
  // Derived state
  // -----------------------------------------------------------------------

  const trimmedLoanId = loanId.trim();
  const currentVote = trimmedLoanId ? voteResults[trimmedLoanId] : undefined;
  
  const approvalCount = currentVote?.approvalCount ?? 0;
  const threshold = currentVote?.threshold ?? Math.ceil(members.length * (2 / 3));
  const totalMembers = currentVote?.totalMembers ?? members.length;
  const consensusReached = currentVote?.consensusReached ?? false;
  
  const progressPercent = threshold > 0 ? (approvalCount / threshold) * 100 : 0;
  const canVote = trimmedLoanId.length > 0;
  const remainingVotes = Math.max(0, threshold - approvalCount);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <Box
      w="full"
      p={8}
      borderRadius="xl"
      bg="rgba(255, 255, 255, 0.05)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255, 255, 255, 0.1)"
      boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
    >
      <VStack spacing={6} align="stretch">
        {/* ---------- Title ---------- */}
        <HStack justify="space-between">
          <Heading size="lg" color="white">
            Oracle Voting Panel
          </Heading>
          {trimmedLoanId.startsWith('0x') && trimmedLoanId.length === 66 && (
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

        {/* ---------- Loan ID Input ---------- */}
        <FormControl>
          <FormLabel fontWeight="semibold">Loan ID</FormLabel>
          <Input
            placeholder="Enter valid 66-character Loan ID (0x...)"
            value={loanId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanId(e.target.value)}
            bg="rgba(255, 255, 255, 0.05)"
            border="1px solid rgba(255, 255, 255, 0.15)"
            _hover={{ borderColor: 'blue.400' }}
            _focus={{
              borderColor: 'blue.400',
              boxShadow: '0 0 0 1px blue.400',
            }}
          />
        </FormControl>

        <Divider borderColor="rgba(255, 255, 255, 0.15)" />

        {/* ---------- Oracle Members Section ---------- */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Oracle Members</Heading>
            {membersLoading && (
              <HStack spacing={2}>
                <Spinner size="sm" color="blue.400" />
                <Text fontSize="sm" color="gray.400">
                  Loading...
                </Text>
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
                const hasVoted = votedMembers.has(member.id);
                const isLoading = votingInProgress === member.id;

                return (
                  <Box
                    key={member.id}
                    p={5}
                    borderRadius="lg"
                    bg="rgba(255, 255, 255, 0.03)"
                    border="1px solid"
                    borderColor={
                      hasVoted ? 'green.500' : 'rgba(255, 255, 255, 0.1)'
                    }
                    transition="all 0.2s"
                    _hover={{
                      borderColor: hasVoted ? 'green.400' : 'blue.400',
                      bg: 'rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <VStack spacing={3} align="stretch">
                      {/* Member info */}
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="md">
                            {member.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500" isTruncated maxW="180px">
                            {member.publicKey.slice(0, 20)}...
                          </Text>
                        </VStack>

                        <Tag
                          size="sm"
                          variant="subtle"
                          colorScheme={hasVoted ? 'green' : 'gray'}
                          borderRadius="full"
                        >
                          <TagLabel>
                            {hasVoted ? '✓ Voted' : '○ Pending'}
                          </TagLabel>
                        </Tag>
                      </HStack>

                      {/* Vote button */}
                      <Button
                        size="sm"
                        colorScheme={hasVoted ? 'green' : 'blue'}
                        variant={hasVoted ? 'outline' : 'solid'}
                        onClick={() => handleVote(member.id)}
                        isLoading={isLoading}
                        loadingText="Voting..."
                        isDisabled={hasVoted || !canVote}
                        w="full"
                      >
                        {hasVoted ? 'Vote Recorded' : `Vote as ${member.name}`}
                      </Button>
                    </VStack>
                  </Box>
                );
              })}
            </SimpleGrid>
          )}
        </Box>

        <Divider borderColor="rgba(255, 255, 255, 0.15)" />

        {/* ---------- Consensus Progress ---------- */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Heading size="sm" color="gray.300">
              Consensus Progress
            </Heading>
            <Badge
              variant="solid"
              colorScheme={consensusReached ? 'green' : 'yellow'}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
            >
              {consensusReached
                ? '✓ Consensus Reached'
                : `${remainingVotes} more vote${remainingVotes !== 1 ? 's' : ''} needed`}
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
            isAnimated={!consensusReached}
            mb={2}
          />

          <HStack justify="space-between" fontSize="sm" color="gray.400">
            <Text>
              {approvalCount} / {threshold} approvals needed
            </Text>
            <Text>
              {totalMembers} member{totalMembers !== 1 ? 's' : ''} total
            </Text>
          </HStack>
        </Box>

        <Divider borderColor="rgba(255, 255, 255, 0.15)" />

        {/* ---------- Slashing Action ---------- */}
        <Box>
          {consensusReached ? (
            <VStack spacing={4}>
              <HStack spacing={3}>
                <InfoIcon boxSize={5} color="green.400" />
                <Text color="green.300" fontWeight="semibold">
                  Consensus threshold met! You may now trigger slashing.
                </Text>
              </HStack>

              <Button
                colorScheme="red"
                size="lg"
                w="full"
                leftIcon={<WarningIcon />}
                onClick={handleTriggerSlashing}
                isLoading={slashingLoading}
                loadingText="Executing Slashing..."
                isDisabled={slashingLoading}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(229, 62, 62, 0.4)',
                }}
                transition="all 0.2s"
              >
                Trigger Slashing
              </Button>

              {/* Slashing result */}
              {slashingResult && (
                <Box
                  w="full"
                  p={4}
                  borderRadius="lg"
                  bg={
                    slashingResult.status === 'success'
                      ? 'rgba(72, 187, 120, 0.1)'
                      : 'rgba(245, 101, 101, 0.1)'
                  }
                  border="1px solid"
                  borderColor={
                    slashingResult.status === 'success'
                      ? 'rgba(72, 187, 120, 0.3)'
                      : 'rgba(245, 101, 101, 0.3)'
                  }
                >
                  <HStack spacing={3}>
                    {slashingResult.status === 'success' ? (
                      <CheckCircleIcon boxSize={5} color="green.400" />
                    ) : (
                      <WarningIcon boxSize={5} color="red.400" />
                    )}
                    <Text
                      fontSize="sm"
                      color={
                        slashingResult.status === 'success'
                          ? 'green.200'
                          : 'red.200'
                      }
                    >
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
                  {canVote
                    ? 'Awaiting oracle votes to reach consensus threshold...'
                    : 'Enter a valid Loan ID above to begin the voting process'}
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
