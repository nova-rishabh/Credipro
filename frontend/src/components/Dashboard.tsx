import React from 'react';
import { VStack, Heading } from '@chakra-ui/react';
import { LoanDashboard } from './LoanDashboard';
import DefaultResolution from './DefaultResolution';

const Dashboard: React.FC = () => {
  return (
    <VStack spacing={8} w="full">
      <Heading>Dashboard</Heading>
      <LoanDashboard />
      <DefaultResolution />
    </VStack>
  );
};

export default Dashboard;
