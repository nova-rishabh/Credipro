import React from 'react';
import { Box, Container, VStack } from '@chakra-ui/react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DemoBanner from './components/DemoBanner';
import AutoPilot from './components/AutoPilot';
import { CrediproProvider } from './context/CrediproContext';

function App() {
  return (
    <CrediproProvider>
      <Box>
        {/* Full-width "Demo Mode" ribbon — always at top */}
        <DemoBanner />
        <Header />
        <Container maxW="container.xl" mt={8} pb={16}>
          <VStack spacing={8}>
            <Dashboard />
          </VStack>
        </Container>
        {/* Floating guided-tour overlay */}
        <AutoPilot />
      </Box>
    </CrediproProvider>
  );
}

export default App;
