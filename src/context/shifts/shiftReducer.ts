// Pure reducer untuk ShiftContext — tidak boleh ada side effect.
// Side effect (AsyncStorage persist) di-handle di useEffect dalam ShiftProvider.

import type { Shift } from '@/types/shift';
import type { ShiftAction, ShiftMap, ShiftState } from './shiftTypes';

export const initialShiftState: ShiftState = { kind: 'loading' };

export function shiftReducer(
  state: ShiftState,
  action: ShiftAction,
): ShiftState {
  switch (action.type) {
    case 'SHIFTS_LOADED':
      return { kind: 'ready', shifts: action.payload };

    case 'SHIFT_UPSERTED': {
      // Kalau state masih loading & dispatch upsert (tidak seharusnya, tapi
      // defensive), abaikan — tunggu load selesai dulu.
      if (state.kind === 'loading') return state;
      return {
        kind: 'ready',
        shifts: {
          ...state.shifts,
          [action.payload.date]: action.payload,
        },
      };
    }

    case 'SHIFT_REMOVED': {
      if (state.kind === 'loading') return state;
      // Spread + omit key — bikin object baru tanpa key target.
      // ESLint mungkin warn unused `_removed`, sengaja pakai underscore prefix.
      const { [action.payload.date]: _removed, ...rest } = state.shifts;
      return { kind: 'ready', shifts: rest };
    }

    case 'SHIFTS_IMPORTED': {
      if (state.kind === 'loading') return state;
      // Convert array → record keyed by date. Kalau ada duplikat tanggal di
      // payload (jarang, tapi mungkin), yg terakhir menang.
      const importedMap = action.payload.reduce<ShiftMap>(
        (acc, shift) => ({ ...acc, [shift.date]: shift }),
        {},
      );
      return {
        kind: 'ready',
        // Shifts existing yg tidak di-import tetap dipertahankan.
        // Kalau tanggal sama → ke-overwrite oleh data Excel baru.
        shifts: { ...state.shifts, ...importedMap },
      };
    }

    case 'SHIFTS_CLEARED':
      return { kind: 'ready', shifts: {} };

    default:
      return state;
  }
}
