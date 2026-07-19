/** Tolk design tokens — dark monochrome (Visual_Language 2026-07-15) */
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
  /** Desktop chat list column */
  listWidth: 360,
  /** Chat wall / shelf column when open */
  wallWidth: 320,
  /** Thin icon rail */
  sideRail: 64,
  /** Max bubble width on wide screens */
  bubbleMax: 600,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  media: 16,
  bubble: 18,
  sheet: 20,
  pill: 9999,
} as const;

export const type = {
  meta: 12,
  body: 15,
  title: 18,
  titleLg: 22,
} as const;
