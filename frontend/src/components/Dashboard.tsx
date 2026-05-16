import React from 'react';
import { VStack, Heading } from '@chakra-ui/react';
import LoanRequestForm from './LoanRequestForm';
import DefaultResolution from './DefaultResolution';

const Dashboard: React.FC = () => {
  return (
    <VStack spacing={8} w="full">
      <Heading>Dashboard</Heading>
      <LoanRequestForm />
      <DefaultResolution />
    </VStack>
  );
};

export default Dashboard;
