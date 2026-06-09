// ShiftProvider — sumber semua data shift.
//
// LOKASI provider: di-wrap di app/_layout.tsx (root level), BUKAN di
// (tabs)/_layout.tsx. Alasan: onboarding step 2 (import Excel di F3)
// butuh akses ShiftContext sebelum user masuk tab. Trade-off: provider
// mount lebih awal (~50ms) bahkan kalau user nggak sampai tab. Acceptable
// karena data shift relatif kecil (<1KB di awal).
//
// V2 multi-user notes:
//   - Shift akan butuh `userId` field (server-side multi-tenancy).
//   - importShifts akan POST batch ke /api/shifts dengan optimistic-update.
//   - ShiftMap saat ini keyed by date (1 shift / tanggal / user). V2 bisa
//     keyed by date+userId kalau ward manager butuh lihat jadwal seluruh tim.
//   - Conflict resolution (offline edit vs server state) bukan trivial —
//     pertimbangkan last-write-wins atau CRDT untuk swap status.

import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
} from 'react';
import { storage } from '@/lib/storage';
import type { Shift } from '@/types/shift';
import { initialShiftState, shiftReducer } from './shiftReducer';
import type { ShiftMap, ShiftState } from './shiftTypes';

const STORAGE_KEY = 'jaga:shifts:v1';

interface ShiftContextValue {
  state: ShiftState;
  upsertShift: (shift: Shift) => void;
  removeShift: (date: string) => void;
  importShifts: (shifts: Shift[]) => void;
  clearShifts: () => void;
}

export const ShiftContext = createContext<ShiftContextValue | null>(null);

export function ShiftProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(shiftReducer, initialShiftState);

  // Load shifts sekali saat mount. Storage return null kalau belum pernah ada
  // — treat sebagai map kosong (user belum input/import apa-apa).
  useEffect(() => {
    storage.get<ShiftMap>(STORAGE_KEY).then((loaded) => {
      dispatch({ type: 'SHIFTS_LOADED', payload: loaded ?? {} });
    });
  }, []);

  // Persist setiap state.shifts berubah. Skip saat 'loading' biar tidak
  // nimpa data lama dengan empty object pas pertama buka app.
  useEffect(() => {
    if (state.kind === 'ready') {
      storage.set(STORAGE_KEY, state.shifts);
    }
  }, [state]);

  const upsertShift = useCallback((shift: Shift) => {
    dispatch({ type: 'SHIFT_UPSERTED', payload: shift });
  }, []);

  const removeShift = useCallback((date: string) => {
    dispatch({ type: 'SHIFT_REMOVED', payload: { date } });
  }, []);

  const importShifts = useCallback((shifts: Shift[]) => {
    dispatch({ type: 'SHIFTS_IMPORTED', payload: shifts });
  }, []);

  const clearShifts = useCallback(() => {
    dispatch({ type: 'SHIFTS_CLEARED' });
  }, []);

  return (
    <ShiftContext.Provider
      value={{ state, upsertShift, removeShift, importShifts, clearShifts }}
    >
      {children}
    </ShiftContext.Provider>
  );
}
