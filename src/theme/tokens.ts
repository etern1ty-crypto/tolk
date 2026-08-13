export const colors = {
  bg: {
    primary: '#050505',
    surface: '#0F0F10',
    sheet: '#141415',
  },
  accent: {
    primary: '#00E676',
    ice: '#E0F7FA',
    danger: '#FF453A',
    liquid: '#2D4CFF',
  },
  text: {
    primary: '#F2F2F3',
    secondary: '#98989D',
    tertiary: '#636366',
    disabled: '#3A3A3C',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.18)',
    glass: 'rgba(255, 255, 255, 0.12)',
  },
  status: {
    error: '#FF453A',
    success: '#34C759',
  },
  glass: {
    surface: 'rgba(20, 20, 22, 0.65)',
    highlight: 'rgba(255, 255, 255, 0.06)',
    blur: '24px',
  }
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    h1: 28,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    base: 1.4,
    relaxed: 1.6,
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 9999,
};

export const tokens = {
  colors,
  typography,
  spacing,
  radius,
};
