// Side-effect module — silence warnings irrelevant to this app.
//
// MUST be imported first in `app/_layout.tsx` (before anything that touches
// expo-notifications), because JS imports evaluate in order and some warnings
// fire at module load time.
//
// Since Expo SDK 53, push notifications are deprecated in Expo Go and surface
// as WARN + ERROR even for apps using local-only scheduling. Jaga uses only
// scheduleNotificationAsync — local notifications keep working in Expo Go.

import { LogBox } from 'react-native';

const SILENCED_PATTERNS = [
  /expo-notifications.*Expo Go/i,
  /expo-notifications.*Android Push/i,
];

// Layer 1: in-app LogBox overlay
LogBox.ignoreLogs(SILENCED_PATTERNS);

// Layer 2: terminal Metro log (HMRClient routes through console.warn/error
// independently of LogBox, so we patch console too — __DEV__ only).
if (__DEV__) {
  const originalWarn = console.warn;
  const originalError = console.error;

  function shouldSilence(args: unknown[]): boolean {
    const msg = args.map((a) => String(a)).join(' ');
    return SILENCED_PATTERNS.some((p) => p.test(msg));
  }

  console.warn = (...args: unknown[]) => {
    if (shouldSilence(args)) return;
    originalWarn(...args);
  };
  console.error = (...args: unknown[]) => {
    if (shouldSilence(args)) return;
    originalError(...args);
  };
}
