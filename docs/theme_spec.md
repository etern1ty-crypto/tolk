# Design System Tokens (Tolk)

## Tokens Spec (`src/theme/tokens.ts`)

This specification translates the `Visual_Language.md` and `Design_System.md` requirements into React Native usable tokens.

```typescript
export const colors = {
  // Backgrounds
  bgDeep: '#0B0B0C',
  bgElevated: '#141416',
  
  // Glass Panels
  glassPanel: 'rgba(26, 26, 30, 0.72)', // Requires blur 16-20px
  
  // Text
  textPrimary: '#F2F2F3',
  textSecondary: '#8E8E93',
  
  // Accents & Roles
  accentMint: '#00E676', // Online, Echo active
  accentIce: '#00B0FF',  // Links, jump highlight
  danger: '#FF453A',     // Delete, error
  
  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
};

export const typography = {
  sizes: {
    meta: 13,
    body: 15,
    bodyLarge: 16,
    title: 17,
    titleLarge: 20,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
  }
};

export const radius = {
  button: 14,
  bubble: 20,
  card: 24,
  sheet: 24,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

## Glass Implementation Rule
- **iOS / High-end Android**: Apply `BlurView` with `glassPanel` overlay.
- **Mid/Low-end Android / Reduce Motion**: Fallback to solid `bgElevated` with `borderSubtle`.

## Theme Support
- **MVP**: Dark theme is default and primary.
- Follow System: Must respect OS preference if enabled, but Dark is heavily encouraged. Light theme is "Should" priority post-launch.
- Theme switching must happen at runtime (no restarts).
