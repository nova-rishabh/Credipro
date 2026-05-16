import React from 'react';
import { Box, Flex, Heading, Spacer } from '@chakra-ui/react';
import { WalletConnectButton } from './WalletConnectButton';

const Header: React.FC = () => {
  return (
    <Box
      bg="rgba(15, 12, 41, 0.8)"
      backdropFilter="blur(10px)"
      borderBottom="1px solid rgba(255, 255, 255, 0.1)"
      p={4}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex maxW="container.xl" mx="auto" align="center">
        <Heading size="md" color="white">Credipro</Heading>
        <Spacer />
        <WalletConnectButton />
      </Flex>
    </Box>
  );
};

export default Header;
