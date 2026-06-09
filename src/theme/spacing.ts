// Spacing scale — 4-point grid.
// Semua jarak (padding, margin, gap) HARUS kelipatan 4 dan diambil dari sini.
// Detail konvensi pakai mana kapan ada di DESIGN.md section 4.

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
  '6xl': 72,
} as const;

export type SpacingToken = keyof typeof spacing;
