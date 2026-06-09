// Stack navigator untuk flow tukar shift (PRD F8).
// new.tsx = wizard create. [id].tsx = detail / status update / auto-swap.

import { Stack } from 'expo-router';

export default function SwapLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
