// Hook untuk akses ShiftContext dari komponen.
//
// Cara pakai:
//
//   const { state, upsertShift } = useShifts();
//   if (state.kind === 'loading') return <LoadingSpinner />;
//   const todayShift = state.shifts[todayISO]; // bisa undefined kalau libur

import { useContext } from 'react';
import { ShiftContext } from './ShiftProvider';

export function useShifts() {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShifts() harus dipakai di dalam <ShiftProvider>');
  }
  return context;
}
