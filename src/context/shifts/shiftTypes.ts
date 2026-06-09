// State + action types untuk ShiftContext.
//
// State pakai discriminated union sama seperti ProfileContext — di consumer
// bisa narrow dengan `if (state.kind === 'ready')` dan TypeScript jamin
// `state.shifts` ada (tidak undefined).
//
// Shape `shifts`: Record<dateISO, Shift>. Key = "YYYY-MM-DD". Asumsi:
// satu perawat = max 1 shift per tanggal (sesuai PRD; edge case 2 shift
// per hari di-handle di V2 dengan ubah ke Record<dateISO, Shift[]>).

import type { Shift } from '@/types/shift';

export type ShiftMap = Record<string, Shift>;

export type ShiftState =
  | { kind: 'loading' } //   AsyncStorage masih di-baca
  | { kind: 'ready'; shifts: ShiftMap }; // siap dipakai (boleh kosong {})

export type ShiftAction =
  // Dispatch saat selesai load dari AsyncStorage.
  | { type: 'SHIFTS_LOADED'; payload: ShiftMap }
  // Tambah/update 1 shift (dari input manual). Date di Shift dipakai sbg key.
  | { type: 'SHIFT_UPSERTED'; payload: Shift }
  // Hapus 1 shift berdasarkan tanggal.
  | { type: 'SHIFT_REMOVED'; payload: { date: string } }
  // Import banyak shift (dari parser Excel). Replace yg ada di tanggal sama.
  | { type: 'SHIFTS_IMPORTED'; payload: Shift[] }
  // Reset semua (untuk "reset data" di Settings F10).
  | { type: 'SHIFTS_CLEARED' };
