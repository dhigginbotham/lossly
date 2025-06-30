import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

// VIBE-coded color palette
const colors = {
  brand: {
    50: '#F3E8FF',
    100: '#E9D8FD',
    200: '#D6BCFA',
    300: '#B794F4',
    400: '#9F7AEA',
    500: '#805AD5',
    600: '#6B46C1',
    700: '#553C9A',
    800: '#44337A',
    900: '#322659',
  },
  accent: {
    50: '#E0F7FA',
    100: '#B2EBF2',
    200: '#80DEEA',
    300: '#4DD0E1',
    400: '#26C6DA',
    500: '#00BCD4',
    600: '#00ACC1',
    700: '#0097A7',
    800: '#00838F',
    900: '#006064',
  },
  success: {
    50: '#D1FAE5',
    100: '#A7F3D0',
    200: '#6EE7B7',
    300: '#34D399',
    400: '#10B981',
    500: '#059669',
    600: '#047857',
    700: '#065F46',
    800: '#064E3B',
    900: '#022C22',
  },
  warning: {
    50: '#FEF3C7',
    100: '#FDE68A',
    200: '#FCD34D',
    300: '#FBBF24',
    400: '#F59E0B',
    500: '#D97706',
    600: '#B45309',
    700: '#92400E',
    800: '#78350F',
    900: '#451A03',
  },
  surface: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096',
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
    900: '#171923',
  },
};

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const styles = {
  global: (props) => ({
    body: {
      bg: mode('surface.50', 'surface.800')(props),
      color: mode('surface.900', 'surface.50')(props),
    },
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      bg: mode('surface.100', 'surface.700')(props),
    },
    '::-webkit-scrollbar-thumb': {
      bg: mode('surface.300', 'surface.600')(props),
      borderRadius: 'full',
      '&:hover': {
        bg: mode('surface.400', 'surface.500')(props),
      },
    },
    // Glassmorphism effect classes
    '.glass': {
      backdropFilter: 'blur(10px) saturate(190%)',
      backgroundColor: mode('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.7)')(props),
      border: '1px solid',
      borderColor: mode('rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)')(props),
    },
    '.glass-dark': {
      backdropFilter: 'blur(20px) saturate(190%)',
      backgroundColor: 'rgba(26, 32, 44, 0.85)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  }),
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'lg',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
      },
      _active: {
        transform: 'translateY(0)',
        boxShadow: 'base',
      },
    },
    variants: {
      solid: (props) => ({
        bg: props.colorScheme === 'brand'
          ? `linear-gradient(135deg, ${colors.brand[600]} 0%, ${colors.brand[400]} 100%)`
          : undefined,
        _hover: {
          bg: props.colorScheme === 'brand'
            ? `linear-gradient(135deg, ${colors.brand[700]} 0%, ${colors.brand[500]} 100%)`
            : undefined,
          _disabled: {
            bg: props.colorScheme === 'brand'
              ? `linear-gradient(135deg, ${colors.brand[600]} 0%, ${colors.brand[400]} 100%)`
              : undefined,
          },
        },
      }),
      ghost: {
        _hover: {
          bg: 'whiteAlpha.100',
        },
      },
      glass: (props) => ({
        bg: mode('whiteAlpha.700', 'whiteAlpha.100')(props),
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: mode('whiteAlpha.300', 'whiteAlpha.200')(props),
        _hover: {
          bg: mode('whiteAlpha.800', 'whiteAlpha.200')(props),
        },
      }),
    },
    defaultProps: {
      colorScheme: 'brand',
    },
  },
  Input: {
    variants: {
      filled: (props) => ({
        field: {
          bg: mode('surface.100', 'surface.700')(props),
          borderRadius: 'lg',
          _hover: {
            bg: mode('surface.200', 'surface.600')(props),
          },
          _focus: {
            bg: mode('surface.100', 'surface.700')(props),
            borderColor: 'accent.500',
            boxShadow: `0 0 0 1px ${colors.accent[500]}`,
          },
        },
      }),
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Card: {
    baseStyle: (props) => ({
      container: {
        bg: mode('white', 'surface.700')(props),
        boxShadow: mode('sm', 'dark-lg')(props),
        borderRadius: 'xl',
        overflow: 'hidden',
        transition: 'all 0.2s',
        _hover: {
          transform: 'translateY(-4px)',
          boxShadow: mode('lg', 'dark-lg')(props),
        },
      },
    }),
  },
  Modal: {
    baseStyle: (props) => ({
      dialog: {
        bg: mode('white', 'surface.700')(props),
        borderRadius: 'xl',
        boxShadow: 'dark-lg',
      },
      overlay: {
        bg: 'blackAlpha.700',
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  Tooltip: {
    baseStyle: (props) => ({
      bg: mode('surface.700', 'surface.600')(props),
      color: 'white',
      borderRadius: 'md',
      px: 3,
      py: 2,
      fontSize: 'sm',
      fontWeight: 'medium',
      boxShadow: 'lg',
    }),
  },
  Progress: {
    baseStyle: {
      filledTrack: {
        bgGradient: 'linear(to-r, brand.400, accent.400)',
      },
    },
  },
  Slider: {
    baseStyle: (props) => ({
      filledTrack: {
        bg: 'brand.500',
      },
      thumb: {
        bg: 'white',
        border: '2px solid',
        borderColor: 'brand.500',
        boxShadow: 'base',
        _hover: {
          boxShadow: 'md',
        },
      },
    }),
  },
};

const fonts = {
  heading: 'Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
  mono: 'Fira Code, monospace',
};

const shadows = {
  'dark-lg': '0 10px 30px rgba(0, 0, 0, 0.5)',
  'glow-sm': `0 0 10px ${colors.accent[400]}`,
  'glow-md': `0 0 20px ${colors.accent[400]}`,
  'glow-lg': `0 0 30px ${colors.accent[400]}`,
};

export const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
  shadows,
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  sizes: {
    max: 'max-content',
    min: 'min-content',
    full: '100%',
    '3xs': '14rem',
    '2xs': '16rem',
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
    '8xl': '90rem',
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  radii: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  transitions: {
    property: {
      common: 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
      colors: 'background-color, border-color, color, fill, stroke',
      dimensions: 'width, height',
      position: 'left, right, top, bottom',
      background: 'background-color, background-image, background-position',
    },
    easing: {
      'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    duration: {
      'ultra-fast': '50ms',
      faster: '100ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '400ms',
      'ultra-slow': '500ms',
    },
  },
});
