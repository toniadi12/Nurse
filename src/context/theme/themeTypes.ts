// Type definitions untuk ThemeContext.
//
// `mode` = pilihan user di Settings (3 nilai).
// `effectiveScheme` = warna yang BENERAN dipakai sekarang (cuma 2 nilai).
//   - mode 'light' → effectiveScheme 'light'
//   - mode 'dark'  → effectiveScheme 'dark'
//   - mode 'auto'  → ikut system colorScheme, KECUALI jam 19.00-05.00
//                    paksa 'dark' (lihat DESIGN.md section 2 auto-trigger,
//                    untuk perawat yang ngecek jadwal di kasur malam).

import type {
  ColorScheme,
  spacing,
  typography,
  radius,
  shadow,
  motion,
} from '@/theme';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorSchemeName = 'light' | 'dark';

// Bentuk context value yang di-expose ke consumer via useTheme().
// Dipakai sebagai sumber kebenaran semua design tokens — komponen TIDAK BOLEH
// import colors langsung dari @/theme, harus via hook ini biar ikut dark mode.
export interface ThemeContextValue {
  mode: ThemeMode;
  effectiveScheme: ColorSchemeName;
  colors: ColorScheme; // shape sama untuk light & dark
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadow: typeof shadow;
  motion: typeof motion;
  setMode: (mode: ThemeMode) => void;
}
