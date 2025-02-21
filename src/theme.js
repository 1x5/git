import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  colors: {
    teal: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      200: '#81E6D9',
      300: '#4FD1C5',
      400: '#38B2AC',
      500: '#319795',
      600: '#2C7A7B',
      700: '#285E61',
      800: '#234E52',
      900: '#1D4044',
    },
    brand: {
      100: '#c2e7e4',
      200: '#a3d9d4',
      300: '#84cac3',
      400: '#65bcb3',
      500: '#46aea2',
      600: '#379f94',
      700: '#288f86',
      800: '#198077',
      900: '#0a7069',
    },
    gradient: {
      start: '#8ecfca',
      middle: '#f7b2b7',
      end: '#f8d0a7',
    }
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'full',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
        outline: {
          borderColor: 'white',
          color: 'white',
          _hover: {
            bg: 'whiteAlpha.200',
          },
        },
        pill: {
          borderRadius: 'full',
          bg: 'whiteAlpha.200',
          color: 'white',
          _hover: {
            bg: 'whiteAlpha.300',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: 'bold',
      },
    },
    Badge: {
      variants: {
        subtle: {
          bg: 'gray.100',
        },
        pill: {
          borderRadius: 'full',
          px: 3,
          py: 1,
        },
      },
    },
    Card: {
        baseStyle: {
          container: {
            borderRadius: 'lg',
            overflow: 'hidden',
            boxShadow: 'md',
          },
        },
      },
    },
    styles: {
      global: {
        body: {
          bg: 'gray.50',
        },
      },
    },
  });
  
  export default theme;