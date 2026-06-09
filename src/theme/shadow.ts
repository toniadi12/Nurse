// Shadow / elevation tokens.
//
// Filosofi: minimal shadow. Coba dulu pakai border atau perbedaan bg color
// sebelum drop shadow. Detail di DESIGN.md section 6.
//
// Catatan: `elevation` cuma kepakai di Android, `shadow*` cuma di iOS.
// React Native tidak handle ini otomatis — kita kasih dua-duanya.

import type { ViewStyle } from 'react-native';

type ShadowStyle = Pick<
  ViewStyle,
  'elevation' | 'shadowColor' | 'shadowOpacity' | 'shadowRadius' | 'shadowOffset'
>;

export const shadow: Record<'none' | 'sm' | 'md' | 'lg', ShadowStyle> = {
  none: {
    elevation: 0,
    shadowColor: 'transparent',
  },

  // Card biasa — barely there
  sm: {
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },

  // Floating elements (bottom sheet, FAB)
  md: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  // Modal overlay
  lg: {
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
};

export type ShadowToken = keyof typeof shadow;
