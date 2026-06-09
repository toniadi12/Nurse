// Border radius scale.
// Aturan: card di dalam card pakai radius LEBIH KECIL dari parent.
// Bottom sheet pakai radius cuma di atas. Detail di DESIGN.md section 5.

export const radius = {
  none: 0,
  xs: 4, // pill kecil, badge
  sm: 8, // button, input
  md: 12, // card kecil
  lg: 16, // card utama
  xl: 20, // card hero (today's shift)
  '2xl': 24, // modal sheet
  full: 9999, // pill, circular avatar
} as const;

export type RadiusToken = keyof typeof radius;
