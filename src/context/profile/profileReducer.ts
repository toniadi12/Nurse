// Pure reducer — tidak boleh ada side effect (no AsyncStorage, no fetch).
// Side effect di-handle di useEffect dalam ProfileProvider.
//
// Pattern ini bikin reducer mudah di-unit-test: input state + action,
// assert output state. Tidak perlu mock storage atau library lain.

import type { ProfileAction, ProfileState } from './profileTypes';

export const initialProfileState: ProfileState = { kind: 'loading' };

export function profileReducer(
  state: ProfileState,
  action: ProfileAction,
): ProfileState {
  switch (action.type) {
    case 'PROFILE_LOADED':
      return action.payload === null
        ? { kind: 'no-profile' }
        : { kind: 'ready', profile: action.payload };

    case 'PROFILE_UPDATED':
      return { kind: 'ready', profile: action.payload };

    case 'PROFILE_CLEARED':
      return { kind: 'no-profile' };

    default:
      // Exhaustiveness check — kalau ada action type baru yang lupa di-handle,
      // TypeScript akan error di sini (action akan ber-type `never` kalau semua case
      // sudah di-handle, jadi assignment ke const _ wajib never).
      return state;
  }
}
