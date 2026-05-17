import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Progress,
  Kbd,
  Collapse,
  IconButton,
  Divider,
  Tooltip,
} from '@chakra-ui/react';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CloseIcon,
  RepeatIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import { useCredipro } from '../context/CrediproContext';

// ---------------------------------------------------------------------------
// Walkthrough steps — narrate the demo flow
// ---------------------------------------------------------------------------
const STEPS = [
  {
    id: 'intro',
    title: '👋 Welcome to Credipro',
    body: 'Credipro is a privacy-preserving lending protocol built on Midnight. This guided tour walks you through a full loan request and oracle approval cycle.',
    hint: 'Press → or N to advance, ← or P to go back. Press Esc to close.',
    target: null,
  },
  {
    id: 'pool',
    title: '📊 Pool Parameters',
    body: 'The lending pool shows live parameters: TVL, max LTV, minimum credit score, and the maximum loan amount your wallet is eligible to request.',
    hint: 'Scroll down to see the Pool Parameters card.',
    target: null,
  },
  {
    id: 'preset',
    title: '💡 Choose a Loan Preset',
    body: 'Click "Quick Presets" to select a realistic loan scenario — micro, standard, business, or enterprise. The form auto-fills with sensible defaults.',
    hint: 'Try the "Standard — 5,000 ADA / 180 days" preset.',
    target: 'loan-request-submit',
  },
  {
    id: 'submit',
    title: '🔐 ZK Proof Generation',
    body: 'Clicking "Request Loan" triggers a multi-step flow: ZK witness generation, circuit verification, ledger broadcast, and indexer settlement — all with live progress indicators.',
    hint: 'Click "Request Loan" and watch each step animate.',
    target: 'loan-request-submit',
  },
  {
    id: 'oracle-id',
    title: '🔍 Oracle Voting — Enter Loan ID',
    body: 'Paste the Loan ID returned after submission into the Oracle Voting Panel. The panel validates the format (0x + 64 hex chars) in real time.',
    hint: 'Scroll down to the "Oracle Voting Panel" section.',
    target: 'oracle-loan-id',
  },
  {
    id: 'vote',
    title: '🗳 Cast Oracle Votes',
    body: 'Each oracle member can vote independently. The consensus progress bar updates with each vote. ≥ ⅔ of members must approve before slashing is unlocked.',
    hint: 'Click each oracle member\'s "Vote as …" button.',
    target: null,
  },
  {
    id: 'slash',
    title: '⚡ Trigger Slashing',
    body: 'Once consensus is reached, the "Trigger Slashing" button appears. This executes an on-chain penalty marking the loan as defaulted.',
    hint: 'Trigger slashing and observe the result card.',
    target: 'oracle-trigger-slash',
  },
  {
    id: 'done',
    title: '✅ Demo Complete',
    body: 'You\'ve seen the full lifecycle: loan request → ZK proof → oracle consensus → on-chain slashing. This is Credipro — privacy-first DeFi on Midnight.',
    hint: 'Press Esc or click × to close the walkthrough.',
    target: null,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AutoPilot: React.FC = () => {
  const { isDemoMode } = useCredipro();
  const [open,    setOpen]    = useState(false);
  const [step,    setStep]    = useState(0);
  const [visible, setVisible] = useState(true);

  const totalSteps = STEPS.length;
  const current    = STEPS[step];

  // ---- Open/close ----
  const close  = useCallback(() => { setOpen(false); setStep(0); }, []);
  const launch = useCallback(() => { setOpen(true);  setStep(0); }, []);

  // ---- Navigation ----
  const next = useCallback(() => setStep((s) => Math.min(s + 1, totalSteps - 1)), [totalSteps]);
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  // ---- Keyboard handler ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Global shortcut: G + T to open tour
      if (!open && e.key === 't' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        launch();
        return;
      }
      if (!open) return;

      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') next();
      if (e.key === 'ArrowLeft'  || e.key.toLowerCase() === 'p') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close, next, prev, launch]);

  // ---- Scroll target element into view ----
  useEffect(() => {
    if (!open || !current.target) return;
    const el = document.getElementById(current.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus({ preventScroll: true });
    }
  }, [open, step, current.target]);

  if (!isDemoMode || !visible) return null;

  return (
    <>
      {/* ---- Floating launcher pill ---- */}
      {!open && (
        <Box
          position="fixed"
          bottom={6}
          right={6}
          zIndex={50}
        >
          <HStack spacing={2}>
            <Tooltip label="Close launcher" hasArrow placement="top">
              <IconButton
                aria-label="Close guided tour launcher"
                icon={<CloseIcon boxSize={2} />}
                size="xs"
                variant="ghost"
                color="gray.500"
                onClick={() => setVisible(false)}
              />
            </Tooltip>
            <Button
              id="autopilot-launch"
              onClick={launch}
              size="sm"
              colorScheme="purple"
              variant="solid"
              leftIcon={<InfoIcon />}
              boxShadow="0 4px 20px rgba(159, 122, 234, 0.5)"
              _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(159, 122, 234, 0.6)' }}
              transition="all 0.2s"
              borderRadius="full"
            >
              Guided Tour
              <Kbd
                ml={2}
                fontSize="2xs"
                bg="rgba(255,255,255,0.15)"
                color="white"
                border="none"
              >
                Ctrl+T
              </Kbd>
            </Button>
          </HStack>
        </Box>
      )}

      {/* ---- Tour panel ---- */}
      <Collapse in={open} animateOpacity unmountOnExit>
        <Box
          position="fixed"
          bottom={6}
          right={6}
          zIndex={50}
          w={{ base: 'calc(100vw - 3rem)', sm: '380px' }}
          borderRadius="2xl"
          bg="rgba(15, 12, 41, 0.95)"
          backdropFilter="blur(20px)"
          border="1px solid rgba(159, 122, 234, 0.4)"
          boxShadow="0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(159,122,234,0.15)"
          overflow="hidden"
        >
          {/* Header */}
          <HStack
            px={5}
            py={3}
            bg="rgba(159, 122, 234, 0.12)"
            borderBottom="1px solid rgba(159,122,234,0.2)"
            justify="space-between"
          >
            <HStack spacing={2}>
              <Badge colorScheme="purple" variant="solid" borderRadius="full" fontSize="2xs">
                TOUR
              </Badge>
              <Text fontSize="xs" color="gray.400">
                Step {step + 1} of {totalSteps}
              </Text>
            </HStack>
            <HStack spacing={1}>
              <Tooltip label="Restart tour" hasArrow>
                <IconButton
                  aria-label="Restart tour"
                  icon={<RepeatIcon boxSize={3} />}
                  size="xs"
                  variant="ghost"
                  color="gray.400"
                  _hover={{ color: 'white' }}
                  onClick={() => setStep(0)}
                />
              </Tooltip>
              <IconButton
                aria-label="Close tour"
                icon={<CloseIcon boxSize={2} />}
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'white' }}
                onClick={close}
              />
            </HStack>
          </HStack>

          {/* Progress bar */}
          <Progress
            value={((step + 1) / totalSteps) * 100}
            size="xs"
            colorScheme="purple"
            bg="rgba(255,255,255,0.06)"
          />

          {/* Body */}
          <VStack spacing={4} p={5} align="stretch">
            <Text fontWeight="bold" fontSize="md" color="white" lineHeight="tight">
              {current.title}
            </Text>
            <Text fontSize="sm" color="gray.300" lineHeight="relaxed">
              {current.body}
            </Text>

            {current.hint && (
              <>
                <Divider borderColor="rgba(255,255,255,0.1)" />
                <HStack spacing={2} align="start">
                  <InfoIcon boxSize={3} color="purple.400" mt={0.5} flexShrink={0} />
                  <Text fontSize="xs" color="purple.300" fontStyle="italic">
                    {current.hint}
                  </Text>
                </HStack>
              </>
            )}

            {/* Navigation */}
            <HStack justify="space-between" pt={1}>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<ChevronLeftIcon />}
                onClick={prev}
                isDisabled={step === 0}
                color="gray.400"
                _hover={{ color: 'white' }}
              >
                Back
                <Kbd ml={1} fontSize="2xs" bg="rgba(255,255,255,0.1)" border="none" color="gray.400">←</Kbd>
              </Button>

              {step < totalSteps - 1 ? (
                <Button
                  size="sm"
                  colorScheme="purple"
                  rightIcon={<ChevronRightIcon />}
                  onClick={next}
                >
                  Next
                  <Kbd ml={1} fontSize="2xs" bg="rgba(255,255,255,0.15)" border="none" color="white">→</Kbd>
                </Button>
              ) : (
                <Button size="sm" colorScheme="green" onClick={close}>
                  Finish ✓
                </Button>
              )}
            </HStack>
          </VStack>
        </Box>
      </Collapse>
    </>
  );
};

export default AutoPilot;
