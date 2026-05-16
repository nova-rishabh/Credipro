import React from 'react';
import { Box, VStack, Heading } from '@chakra-ui/react';
import { LoanDashboard } from './LoanDashboard';
import DefaultResolution from './DefaultResolution';

const Dashboard: React.FC = () => {
  return (
    <VStack spacing={8} w="full">
      <Box
        w="full"
        p={6}
        borderRadius="xl"
        bg="rgba(255, 255, 255, 0.05)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        textAlign="center"
      >
        <Heading>Dashboard</Heading>
      </Box>
      <LoanDashboard />
      <DefaultResolution />
    </VStack>
  );
};

export default Dashboard;
