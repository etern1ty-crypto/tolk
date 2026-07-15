/** Monochrome design tokens */
export const colors = {
  bg: {
    primary: '#000000',
    surface: '#0a0a0a',
    elevated: '#111111',
    sheet: '#0f0f0f',
  },
  accent: {
    primary: '#f5f5f5',
    muted: '#a3a3a3',
    danger: '#e5e5e5',
  },
  text: {
    primary: '#f5f5f5',
    secondary: '#a3a3a3',
    tertiary: '#737373',
    onAccent: '#0a0a0a',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.1)',
    strong: 'rgba(255, 255, 255, 0.16)',
  },
} as const;

export const breakpoints = {
  mobile: 768,
  tablet: 1024,
} as const;

export const layout = {
  listWidth: 360,
  wallWidth: 340,
} as const;
