// State + action types untuk ProfileContext.
//
// Pakai discriminated union (`kind` field) per TECH-STACK section 3.
// Manfaat: TypeScript narrow type otomatis berdasarkan `kind`, jadi
// di consumer kalau cek `if (state.kind === 'ready')` maka di dalam if
// `state.profile` dijamin ada (bukan undefined). Aman & enak dipakai.

import type { UserProfile } from '@/types/profile';

export type ProfileState =
  | { kind: 'loading' } //   AsyncStorage masih di-baca
  | { kind: 'no-profile' } // sudah load, tapi user belum onboarding
  | { kind: 'ready'; profile: UserProfile }; // siap dipakai

export type ProfileAction =
  // Dispatch saat selesai load dari AsyncStorage. Null = belum pernah onboarding.
  | { type: 'PROFILE_LOADED'; payload: UserProfile | null }
  // Dispatch saat user selesai onboarding atau edit profil.
  | { type: 'PROFILE_UPDATED'; payload: UserProfile }
  // Dispatch untuk reset semua data (di Settings).
  | { type: 'PROFILE_CLEARED' };
