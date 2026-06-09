// Konstanta untuk shift codes — jam default + alias multi-bahasa.
//
// PRD section 5 F3: parser Excel HARUS kenal kode shift dalam berbagai
// format yang dipakai RS Indonesia (kadang campur ID + EN dalam satu file).

import type { ShiftCode } from '@/types/shift';

// Jam default untuk setiap shift produktif.
// Sumber: PRD F3 ("default 07.00–15.00", dst).
// User bisa override per shift via 'CUSTOM'.
export const SHIFT_DEFAULT_TIMES: Record<
  Extract<ShiftCode, 'P' | 'S' | 'M'>,
  { startTime: string; endTime: string }
> = {
  P: { startTime: '07:00', endTime: '15:00' }, // Pagi
  S: { startTime: '15:00', endTime: '23:00' }, // Siang
  M: { startTime: '23:00', endTime: '07:00' }, // Malam (wrap ke hari berikutnya)
};

// UK English labels untuk display di UI. Sentence case sesuai DESIGN.md
// section 3 + 11. Naming pakai konvensi nursing UK (Morning/Afternoon/Night,
// Off untuk rest day, Leave untuk annual leave).
//
// Variable name SHIFT_LABEL_ID dipertahankan karena banyak call-site —
// rename = noise. Konstanta-nya yang berisi label EN sekarang.
export const SHIFT_LABEL_ID: Record<ShiftCode, string> = {
  P: 'Morning',
  S: 'Afternoon',
  M: 'Night',
  L: 'Off',
  C: 'Leave',
  CUSTOM: 'Custom',
};

// Alias yang dikenali parser Excel — case-insensitive matching.
// Sengaja eksplisit (tidak pakai regex) supaya gampang di-test & gampang
// nambah kode RS baru tanpa mikir.
//
// Contoh isi cell Excel yang sah:
//   "P" / "Pagi" / "PAGI" / "Morning" / "morning"  → 'P'
//   "S" / "Siang" / "Sore" / "Afternoon"           → 'S'
//   "M" / "Malam" / "Night"                        → 'M'
//   "L" / "Libur" / "Off" / "-"                    → 'L'
//   "C" / "Cuti"                                   → 'C'
export const SHIFT_CODE_ALIASES: Record<string, ShiftCode> = {
  // Pagi
  p: 'P',
  pagi: 'P',
  morning: 'P',
  // Siang
  s: 'S',
  siang: 'S',
  sore: 'S',
  afternoon: 'S',
  // Malam
  m: 'M',
  malam: 'M',
  night: 'M',
  // Libur
  l: 'L',
  libur: 'L',
  off: 'L',
  '-': 'L',
  // Cuti
  c: 'C',
  cuti: 'C',
};

// Helper: normalize input string dari Excel ke ShiftCode atau null.
// Trim + lowercase dulu sebelum cek alias. Return null kalau tidak dikenal —
// caller (excelParser) yang putuskan apakah tampilkan warning atau skip.
export function parseShiftCode(raw: string | null | undefined): ShiftCode | null {
  if (raw == null) return null;
  const normalized = raw.trim().toLowerCase();
  if (normalized.length === 0) return null;
  return SHIFT_CODE_ALIASES[normalized] ?? null;
}
