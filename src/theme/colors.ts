// Color tokens untuk Jaga.
//
// Filosofi: cream + sage + coral, bukan putih steril. Tidak ada warna merah
// cerah untuk error (pakai muted brick), tidak ada hijau "success" generik
// (pakai sage). Detail lengkap di DESIGN.md section 2.
//
// Jangan import hex literal langsung di komponen — selalu via useTheme().

// Interface eksplisit (bukan `typeof colorsLight`) supaya colorsLight & colorsDark
// sama-sama valid di posisi yang butuh ColorScheme. Kalau pakai `as const` +
// `typeof colorsLight`, TS bikin literal type `'#2D5F4E'` yang tidak match
// `'#7FA897'` di colorsDark.
export interface ColorScheme {
  primary: string;
  primaryHover: string;
  primarySoft: string;
  primaryMuted: string;

  accent: string;
  accentSoft: string;
  accentDark: string;

  night: string;
  nightSoft: string;

  background: string;
  surface: string;
  border: string;
  borderStrong: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  success: string;
  warning: string;
  danger: string;
  info: string;
}

export const colorsLight: ColorScheme = {
  // Primary — Sage family
  primary: '#2D5F4E',
  primaryHover: '#244B3F',
  primarySoft: '#DCE8DF',
  primaryMuted: '#5C8475',

  // Accent — Coral family (hangat, untuk shift pagi & highlight)
  accent: '#E89B7A',
  accentSoft: '#FBE7DC',
  accentDark: '#C5613A',

  // Night shift — Plum family
  night: '#4A3B5C',
  nightSoft: '#EBE4F2',

  // Neutral
  background: '#FAF6EF',
  surface: '#FFFFFF',
  border: '#E5DDD0',
  borderStrong: '#B4B2A9',

  // Text
  textPrimary: '#1A2E27',
  textSecondary: '#5C7268',
  textTertiary: '#A5A39B',
  textInverse: '#FAF6EF',

  // Semantic — pakai sage untuk success, muted brick untuk danger
  success: '#5C8475',
  warning: '#D89542',
  danger: '#B85450',
  info: '#5B7A8E',
};

export const colorsDark: ColorScheme = {
  // Primary — diterangkan biar tetap kontras di bg gelap
  primary: '#7FA897',
  primaryHover: '#92BAA8',
  primarySoft: '#2A3F37',
  primaryMuted: '#6B8A7E',

  // Accent
  accent: '#F0B399',
  accentSoft: '#3D2A22',
  accentDark: '#F0B399',

  // Night
  night: '#8B7CA0',
  nightSoft: '#2D2438',

  // Neutral — Forest sebagai bg (bukan hitam murni)
  background: '#1A2E27',
  surface: '#243A33',
  border: '#3D5048',
  borderStrong: '#5C7268',

  // Text — Cream sebagai text (bukan putih murni)
  textPrimary: '#FAF6EF',
  textSecondary: '#B5C2BC',
  textTertiary: '#7A8C84',
  textInverse: '#1A2E27',

  // Semantic
  success: '#7FA897',
  warning: '#E5B068',
  danger: '#D17570',
  info: '#7A98AD',
};
