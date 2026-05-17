import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Code, Button } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Credipro] Render error:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <Box p={8} bg="#1a1a2e" minH="100vh" color="white">
          <Heading size="lg" mb={4}>
            Something went wrong
          </Heading>
          <Text mb={4} color="gray.300">
            The app crashed while loading. Check the details below or open the browser console (F12).
          </Text>
          <Code
            display="block"
            whiteSpace="pre-wrap"
            p={4}
            borderRadius="md"
            bg="blackAlpha.500"
            color="red.200"
            mb={4}
          >
            {this.state.error.message}
          </Code>
          <Button colorScheme="purple" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
