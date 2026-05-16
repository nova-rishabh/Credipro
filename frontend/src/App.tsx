import React from 'react';
import { Box, Container, VStack } from '@chakra-ui/react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Box>
      <Header />
      <Container maxW="container.xl" mt={8}>
        <VStack spacing={8}>
          <Dashboard />
        </VStack>
      </Container>
    </Box>
  );
}

export default App;
