import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'white',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        _hover: {
          transform: 'scale(1.05)',
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
      },
    },
  },
});

export default theme;
