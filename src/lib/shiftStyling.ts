// Helper untuk styling shift berdasarkan kode (P/S/M/L/C/CUSTOM) +
// countdown helper "X jam Y menit lagi" untuk hero card.

import type { ColorScheme } from '@/theme';
import type { ShiftCode } from '@/types/shift';

export interface ShiftStyle {
  // Background card shift untuk kalender cell + week strip dot.
  bg: string;
  // Warna text di atas bg tersebut (contrast).
  fg: string;
  // Border (dashed buat libur sesuai DESIGN.md F6).
  border: string;
  borderDashed: boolean;
}

// Per DESIGN.md section 2: coral pagi, peach siang (= accentSoft = peach
// keluarga coral lebih muda), plum malam, dashed libur/cuti.
export function getShiftStyle(
  code: ShiftCode,
  colors: ColorScheme,
): ShiftStyle {
  switch (code) {
    case 'P':
      return {
        bg: colors.accent, // coral
        fg: colors.textInverse,
        border: colors.accent,
        borderDashed: false,
      };
    case 'S':
      return {
        bg: colors.accentSoft, // peach
        fg: colors.accentDark,
        border: colors.accent,
        borderDashed: false,
      };
    case 'M':
      return {
        bg: colors.night, // plum
        fg: colors.textInverse,
        border: colors.night,
        borderDashed: false,
      };
    case 'L':
      // Libur — off day biasa, visual ringan (dashed, transparent).
      return {
        bg: 'transparent',
        fg: colors.textTertiary,
        border: colors.borderStrong,
        borderDashed: true,
      };
    case 'C':
      // Cuti — leave terencana, distinct dari libur biasa. Bg sage tipis
      // + border solid sage biar kelihatan "approved/scheduled".
      return {
        bg: colors.primarySoft,
        fg: colors.primary,
        border: colors.primary,
        borderDashed: false,
      };
    case 'CUSTOM':
      return {
        bg: colors.primarySoft,
        fg: colors.primary,
        border: colors.primary,
        borderDashed: false,
      };
  }
}

// Countdown sampai shift mulai. Format natural Indonesia.
// Return null kalau shift sudah lewat atau bukan hari ini.
// Catatan: ini computed ONCE per render — buat live countdown perlu
// setInterval di komponen (defer ke polish phase).
export function getCountdownText(shiftStartHHMM: string): string | null {
  const now = new Date();
  const parts = shiftStartHHMM.split(':');
  const startHour = parseInt(parts[0] ?? '', 10);
  const startMin = parseInt(parts[1] ?? '', 10);
  if (isNaN(startHour) || isNaN(startMin)) return null;

  const shiftStart = new Date();
  shiftStart.setHours(startHour, startMin, 0, 0);

  const diffMs = shiftStart.getTime() - now.getTime();
  if (diffMs <= 0) return null; // sudah lewat

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} menit lagi`;
  if (minutes === 0) return `${hours} jam lagi`;
  return `${hours} jam ${minutes} menit lagi`;
}
