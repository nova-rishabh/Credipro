import React, { useState } from 'react';
import { Box, Flex, Text, Badge, HStack, IconButton, Collapse } from '@chakra-ui/react';
import { CloseIcon, InfoIcon } from '@chakra-ui/icons';

/**
 * Full-width top banner shown in demo mode.
 * Rendered above the Header so it stays at the very top of the viewport.
 */
const DemoBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);

  return (
    <Collapse in={visible} animateOpacity unmountOnExit>
      <Box
        w="full"
        bg="linear-gradient(90deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)"
        borderBottom="1px solid rgba(255, 193, 7, 0.35)"
        px={4}
        py={2}
        position="sticky"
        top={0}
        zIndex={20}
      >
        <Flex maxW="container.xl" mx="auto" align="center" justify="space-between">
          <HStack spacing={3}>
            {/* Pulsing indicator dot */}
            <Box position="relative" display="inline-flex">
              <Box
                as="span"
                position="absolute"
                display="inline-flex"
                w="10px"
                h="10px"
                borderRadius="full"
                bg="yellow.400"
                opacity={0.75}
                sx={{
                  '@keyframes ping': {
                    '0%': { transform: 'scale(1)', opacity: 0.75 },
                    '75%, 100%': { transform: 'scale(2)', opacity: 0 },
                  },
                  animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
              <Box
                as="span"
                position="relative"
                display="inline-flex"
                w="10px"
                h="10px"
                borderRadius="full"
                bg="yellow.400"
              />
            </Box>

            <Badge
              colorScheme="yellow"
              variant="solid"
              px={2}
              py={0.5}
              borderRadius="md"
              fontSize="xs"
              letterSpacing="wider"
              textTransform="uppercase"
            >
              Demo Mode
            </Badge>

            <Text fontSize="sm" color="yellow.200" fontWeight="medium" display={{ base: 'none', sm: 'block' }}>
              Not live — using mocked Midnight ledger &amp; compiled runtime
            </Text>

            <HStack
              spacing={1}
              fontSize="xs"
              color="gray.400"
              display={{ base: 'none', md: 'flex' }}
            >
              <InfoIcon boxSize={3} />
              <Text>Append <Badge variant="outline" colorScheme="gray" fontSize="2xs">?live</Badge> to the URL to connect a real Lace wallet</Text>
            </HStack>
          </HStack>

          <IconButton
            aria-label="Dismiss demo banner"
            icon={<CloseIcon boxSize={2.5} />}
            size="xs"
            variant="ghost"
            color="gray.400"
            _hover={{ color: 'white', bg: 'rgba(255,255,255,0.1)' }}
            onClick={() => setVisible(false)}
          />
        </Flex>
      </Box>
    </Collapse>
  );
};

export default DemoBanner;
