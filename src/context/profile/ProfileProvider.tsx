// ProfileProvider — sumber data nurseName, defaultWard, notif config.
//
// Alur:
//   1. Mount → load profile dari AsyncStorage.
//      - Ada data       → state = { kind: 'ready', profile }
//      - Tidak ada data → state = { kind: 'no-profile' } (perlu onboarding)
//   2. updateProfile() di-call dari onboarding atau Settings → persist + state update.
//   3. clearProfile() di-call dari Settings "reset data" → hapus + state update.
//
// Tidak handle shifts — itu tanggung jawab ShiftProvider (di tabs layout).
//
// V2 multi-user notes:
//   - UserProfile akan butuh `id` & `email` field (saat ini cuma nurseName).
//   - STORAGE_KEY bisa di-namespace per user: `jaga:profile:v2:<userId>`.
//   - PROFILE_LOADED akan trigger sync ke backend (GET /api/profile).
//   - updateProfile akan optimistic-update lalu PATCH /api/profile.
//   - Auth state (token, expiry) hidup di Context terpisah supaya provider ini
//     tetap fokus ke profile fields, bukan ikut handle login flow.

import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
} from 'react';
import { storage } from '@/lib/storage';
import type { UserProfile } from '@/types/profile';
import { initialProfileState, profileReducer } from './profileReducer';
import type { ProfileState } from './profileTypes';

const STORAGE_KEY = 'jaga:profile:v1';

interface ProfileContextValue {
  state: ProfileState;
  updateProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(profileReducer, initialProfileState);

  // Load profile sekali saat mount.
  useEffect(() => {
    storage.get<UserProfile>(STORAGE_KEY).then((loaded) => {
      dispatch({ type: 'PROFILE_LOADED', payload: loaded });
    });
  }, []);

  // Persist setiap kali state berubah jadi 'ready'. Tidak persist saat 'loading'
  // (kalau dipersist, bakal nimpa data lama dengan null pas pertama buka app).
  useEffect(() => {
    if (state.kind === 'ready') {
      storage.set(STORAGE_KEY, state.profile);
    } else if (state.kind === 'no-profile') {
      // Hanya hapus storage kalau eksplisit cleared (bukan saat loading awal).
      // Tapi karena 'no-profile' bisa muncul dari PROFILE_CLEARED atau dari
      // PROFILE_LOADED dengan payload null (data emang nggak ada di storage),
      // remove di dua-duanya tetap aman — kalau key nggak ada, remove no-op.
      storage.remove(STORAGE_KEY);
    }
  }, [state]);

  const updateProfile = useCallback((profile: UserProfile) => {
    dispatch({ type: 'PROFILE_UPDATED', payload: profile });
  }, []);

  const clearProfile = useCallback(() => {
    dispatch({ type: 'PROFILE_CLEARED' });
  }, []);

  return (
    <ProfileContext.Provider value={{ state, updateProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
