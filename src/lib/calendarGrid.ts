// Generate grid 6x7 untuk satu bulan (42 cell).
//
// Layout: minggu mulai Senin (sesuai DESIGN.md F6: "Grid 7 kolom Sen-Min").
// Cell di luar bulan (akhir bulan lalu / awal bulan depan) di-include dgn
// flag `isCurrentMonth: false` — di UI di-render lebih redup biar user tahu.

import { addDays, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';

export interface CalendarCell {
  date: Date;
  iso: string; // "YYYY-MM-DD"
  dayNum: number; // 1-31
  isCurrentMonth: boolean;
  isToday: boolean;
}

const GRID_ROWS = 6;
const GRID_COLS = 7;
const TOTAL_CELLS = GRID_ROWS * GRID_COLS;
const MONDAY_START = 1; // date-fns convention: 1 = Senin

export function generateMonthGrid(monthDate: Date): CalendarCell[] {
  const firstDay = startOfMonth(monthDate);
  // Mundur ke Senin terdekat (atau tetap kalau monthstart sudah Senin).
  const gridStart = startOfWeek(firstDay, { weekStartsOn: MONDAY_START });
  const today = new Date();

  return Array.from({ length: TOTAL_CELLS }, (_, i) => {
    const date = addDays(gridStart, i);
    return {
      date,
      iso: format(date, 'yyyy-MM-dd'),
      dayNum: date.getDate(),
      isCurrentMonth: isSameMonth(date, monthDate),
      isToday: isSameDay(date, today),
    };
  });
}

// Helper untuk navigasi bulan — return Date baru, bulan ke-shift.
// Pakai day=1 supaya tidak kena edge case "31 Jan + 1 bulan = 2 Mar".
export function shiftMonth(monthDate: Date, deltaMonths: number): Date {
  return new Date(monthDate.getFullYear(), monthDate.getMonth() + deltaMonths, 1);
}
