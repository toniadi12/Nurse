// Typography tokens untuk Jaga.
//
// 3 keluarga font:
//   - Instrument Serif (display)    — jam besar, heading editorial
//   - Plus Jakarta Sans (body)      — semua text UI
//   - JetBrains Mono (mono)         — kode shift (P/S/M), durasi
//
// Hanya 2 berat: Regular (400) + Medium (500). TIDAK ADA bold (600/700).
// Detail di DESIGN.md section 3.

// Nama font HARUS sama persis dengan yang di-load via useFonts() di
// app/_layout.tsx. Package @expo-google-fonts pakai format
// `<Family>_<Weight><Style>` — kita ikuti karena lebih reliable daripada
// rename manual.
export const fonts = {
  display: 'InstrumentSerif_400Regular',
  body: 'PlusJakartaSans_400Regular',
  bodyMed: 'PlusJakartaSans_500Medium',
  mono: 'JetBrainsMono_400Regular',
} as const;

// Type scale — letter-spacing dihitung di compile time (TS evaluates konstan).
// Display pakai negative tracking biar lebih elegan, label ALL CAPS pakai
// positive tracking biar lebih terbaca.
export const typography = {
  // Display — Instrument Serif
  displayXL: {
    fontFamily: fonts.display,
    fontSize: 52,
    lineHeight: 52,
    letterSpacing: -1.04, // -0.02 * 52
  },
  displayLG: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -0.88, // -0.02 * 44
  },
  displayMD: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.32, // -0.01 * 32
  },
  displaySM: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.22, // -0.01 * 22
  },

  // Body — Plus Jakarta Sans Regular
  bodyLG: { fontFamily: fonts.body, fontSize: 18, lineHeight: 26 },
  bodyMD: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  bodySM: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  bodyXS: { fontFamily: fonts.body, fontSize: 11, lineHeight: 14 },

  // Emphasis — Plus Jakarta Sans Medium (BUKAN bold)
  labelMD: { fontFamily: fonts.bodyMed, fontSize: 14, lineHeight: 18 },
  labelSM: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.6, // 0.05 * 12
    textTransform: 'uppercase' as const,
  },

  // Mono — JetBrains Mono
  monoMD: { fontFamily: fonts.mono, fontSize: 13, lineHeight: 18 },
} as const;

export type TypographyVariant = keyof typeof typography;
