// Hitung statistik shift untuk satu bulan: total shift, total jam, jumlah malam.
// PRD F6 spec: card statistik di bawah kalender.
//
// Logic jam:
//   - Cuma hitung shift dengan startTime + endTime (P/S/M/CUSTOM)
//   - L/C tidak masuk total jam
//   - Shift malam (23:00-07:00) wrap ke hari berikutnya — kompensasi
//     dengan +24h di endMin kalau end <= start

import { format } from 'date-fns';
import type { Shift } from '@/types/shift';
import type { ShiftMap } from '@/context/shifts';

export interface MonthStats {
  totalShifts: number; // hitung semua kecuali libur/cuti
  totalHours: number; // sum jam produktif (sudah handle wrap)
  nightCount: number; // shift code 'M'
  offCount: number; // shift code 'L' atau 'C'
}

export function getMonthStats(
  shifts: ShiftMap,
  monthDate: Date,
): MonthStats {
  // Filter shift yang tanggalnya di bulan ini (format yyyy-MM dari ISO).
  const monthPrefix = format(monthDate, 'yyyy-MM');
  const monthShifts = Object.values(shifts).filter((s) =>
    s.date.startsWith(monthPrefix),
  );

  let totalHours = 0;
  let totalShifts = 0;
  let nightCount = 0;
  let offCount = 0;

  for (const shift of monthShifts) {
    if (shift.code === 'L' || shift.code === 'C') {
      offCount++;
      continue;
    }
    totalShifts++;
    if (shift.code === 'M') nightCount++;
    totalHours += calculateShiftHours(shift);
  }

  return { totalShifts, totalHours, nightCount, offCount };
}

function calculateShiftHours(shift: Shift): number {
  if (!shift.startTime || !shift.endTime) return 0;
  const startMin = parseMinutes(shift.startTime);
  const endMinRaw = parseMinutes(shift.endTime);
  if (startMin == null || endMinRaw == null) return 0;
  // Shift malam wrap ke besok — tambah 24h supaya hasilnya positif.
  const endMin = endMinRaw <= startMin ? endMinRaw + 24 * 60 : endMinRaw;
  return (endMin - startMin) / 60;
}

function parseMinutes(hhmm: string): number | null {
  const parts = hhmm.split(':');
  const h = parseInt(parts[0] ?? '', 10);
  const m = parseInt(parts[1] ?? '', 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}
