// Hook untuk akses ProfileContext.
//
// Cara pakai (consumer akan TypeScript-narrow `state` otomatis):
//
//   const { state, updateProfile } = useProfile();
//   if (state.kind === 'loading') return <LoadingSpinner />;
//   if (state.kind === 'no-profile') return <OnboardingPrompt />;
//   // di sini TS tahu state.kind === 'ready', state.profile pasti ada:
//   return <Text>Halo, {state.profile.nurseName}</Text>;

import { useContext } from 'react';
import { ProfileContext } from './ProfileProvider';

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile() harus dipakai di dalam <ProfileProvider>');
  }
  return context;
}
