// Public API untuk semua design tokens.
// Komponen import dari sini: `import { colors, spacing } from '@/theme'`.
//
// Catatan: `colors` di sini adalah light mode default — untuk dark mode
// yang ikut theme, pakai hook useTheme() dari src/context/theme/.

export { colorsLight, colorsDark } from './colors';
export type { ColorScheme } from './colors';

export { fonts, typography } from './typography';
export type { TypographyVariant } from './typography';

export { spacing } from './spacing';
export type { SpacingToken } from './spacing';

export { radius } from './radius';
export type { RadiusToken } from './radius';

export { shadow } from './shadow';
export type { ShadowToken } from './shadow';

export { motion } from './motion';
export type { MotionDuration } from './motion';

// Default export warna untuk kode yang tidak butuh switch dark mode
// (mis. splash screen sebelum theme context ready).
export { colorsLight as colors } from './colors';
