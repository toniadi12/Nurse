// Stack navigator untuk wizard onboarding.
// Sesuai PRD: 3 langkah (nama → import/manual → konfirmasi notif).
// Saat ini cuma `name.tsx` yang ada — `import-or-manual` dan `confirm`
// akan ditambah saat F3/F7 dikerjakan.

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
