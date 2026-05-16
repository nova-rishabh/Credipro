import React from 'react';
import { Box, Flex, Heading, Spacer, Button } from '@chakra-ui/react';

const Header: React.FC = () => {
  return (
    <Box bg="gray.800" p={4}>
      <Flex maxW="container.xl" mx="auto" align="center">
        <Heading size="md">Credipro</Heading>
        <Spacer />
        <Button>Connect Wallet</Button>
      </Flex>
    </Box>
  );
};

export default Header;
