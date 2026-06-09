// Factory helper buat bikin object Shift yang lengkap.
//
// Tugas:
//   - Generate ID unik (timestamp + random base36)
//   - Set createdAt + updatedAt ke sekarang
//   - Apply default time untuk P/S/M kalau startTime/endTime tidak di-supply
//
// Dipisah dari context biar bisa di-test sebagai pure function (kalau mau —
// saat ini belum di-unit-test, tapi sengaja di-isolasi biar siap nanti).

import type { Shift, ShiftCode } from '@/types/shift';
import { SHIFT_DEFAULT_TIMES } from '@/constants/shiftCodes';

export interface CreateShiftInput {
  date: string; // "YYYY-MM-DD"
  code: ShiftCode;
  startTime?: string; // "HH:MM" — override default untuk P/S/M, atau wajib untuk CUSTOM
  endTime?: string;
  ward?: string;
  note?: string;
  source: 'manual' | 'excel';
}

export function createShift(input: CreateShiftInput): Shift {
  const now = Date.now();
  const id = `s-${now}-${Math.random().toString(36).slice(2, 10)}`;

  // Default time hanya berlaku untuk P/S/M. L (libur), C (cuti), CUSTOM
  // pakai apa yang user input (atau undefined kalau memang tidak ada).
  const { startTime, endTime } = resolveTimes(input);

  return {
    id,
    date: input.date,
    code: input.code,
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
    ...(input.ward ? { ward: input.ward.trim() } : {}),
    ...(input.note ? { note: input.note.trim() } : {}),
    source: input.source,
    createdAt: now,
    updatedAt: now,
  };
}

function resolveTimes(input: CreateShiftInput): {
  startTime?: string;
  endTime?: string;
} {
  // Override user > default shift > kosong.
  if (input.startTime && input.endTime) {
    return { startTime: input.startTime, endTime: input.endTime };
  }
  if (input.code === 'P' || input.code === 'S' || input.code === 'M') {
    return SHIFT_DEFAULT_TIMES[input.code];
  }
  return {};
}
