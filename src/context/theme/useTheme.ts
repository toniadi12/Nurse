// Hook utama untuk akses theme tokens dari komponen.
//
// Cara pakai:
//   const { colors, spacing, typography } = useTheme();
//   <View style={{ backgroundColor: colors.surface, padding: spacing.lg }}>
//
// Throw error kalau dipakai di luar ThemeProvider — bantu catch bug
// "lupa wrap provider" di dev, bukan diam-diam pakai value null.

import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme() harus dipakai di dalam <ThemeProvider>');
  }
  return context;
}
