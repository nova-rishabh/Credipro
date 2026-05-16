import React from 'react';
import { Box, Flex, Heading, Spacer } from '@chakra-ui/react';
import { WalletConnectButton } from './WalletConnectButton';

const Header: React.FC = () => {
  return (
    <Box bg="gray.800" p={4} color="white">
      <Flex maxW="container.xl" mx="auto" align="center">
        <Heading size="md" color="white">Credipro</Heading>
        <Spacer />
        <WalletConnectButton />
      </Flex>
    </Box>
  );
};

export default Header;
