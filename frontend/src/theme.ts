import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color: 'white',
        minHeight: '100vh',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'lg',
        fontWeight: 'semibold',
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: 'xl',
        },
      },
      variants: {
        solid: {
          bg: 'purple.500',
          color: 'white',
          _hover: {
            bg: 'purple.600',
          },
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          color: 'white',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
  },
});

export default theme;
