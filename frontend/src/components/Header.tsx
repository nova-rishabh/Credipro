import React, { useState } from 'react';
import { Box, Flex, Heading, Spacer, Image } from '@chakra-ui/react';
import { WalletConnectButton } from './WalletConnectButton';
import HealthBanner from './HealthBanner';

const Header: React.FC = () => {
  return (
    <Box
      bg="rgba(15, 12, 41, 0.85)"
      backdropFilter="blur(12px)"
      borderBottom="1px solid rgba(255, 255, 255, 0.1)"
      p={4}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex maxW="container.xl" mx="auto" align="center">
        <LogoOrTitle />
        <Spacer />
        <HealthBanner />
        <WalletConnectButton />
      </Flex>
    </Box>
  );
};

const LogoOrTitle: React.FC = () => {
  const [failed, setFailed] = useState(false);
  const candidates = [
    '/logo/logo.svg',
    '/logo/credipro.svg',
    '/logo/logo.png',
    '/logo/credipro.png',
  ];

  if (failed) return <Heading size="md" color="white">Credipro</Heading>;

  // Render first candidate; browser will try and if it 404s we hide and render title
  return (
    <Image
      src={candidates[0]}
      alt="Credipro logo"
      boxSize="40px"
      objectFit="contain"
      onError={() => setFailed(true)}
      mr={3}
    />
  );
};

export default Header;
