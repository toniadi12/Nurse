// Stack navigator untuk flow shift (PRD F4).
// new.tsx = form tambah shift manual (full screen, keyboard-safe).

import { Stack } from 'expo-router';

export default function ShiftLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
