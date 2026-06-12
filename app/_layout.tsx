// Root layout untuk Expo Router.
//
// Hierarki provider (urutan dari luar ke dalam):
//   1. GestureHandlerRootView — WAJIB untuk react-native-gesture-handler
//      (dipakai oleh bottom sheet, swipeable, dll). Kalau tidak ada,
//      gesture diam-diam gagal tanpa error.
//   2. SafeAreaProvider       — akses notch / status bar / home indicator
//   3. ThemeProvider          — light/dark mode + design tokens
//   4. ProfileProvider        — nama perawat, settings
//   5. ShiftProvider          — data shift (di root, karena onboarding F3
//                               import Excel juga butuh akses)
//   6. SwapProvider           — riwayat tukar shift (F8)
//   7. ToastProvider          — in-app banner (showToast hook)
//   8. Stack                   — navigator file-based dari Expo Router
//
// Font loading: pakai useFonts dari @expo-google-fonts/*. Native splash
// (dari expo-splash-screen plugin) di-hold sampai font siap, lalu di-hide.
// Kalau font gagal load (jaringan offline first-launch), tetap render
// dengan system font fallback — jangan stuck di splash.

// IMPORTANT: harus import paling pertama — silence warning expo-notifications
// di Expo Go SEBELUM module-nya di-load via useShiftNotificationSync di bawah.
// Lihat src/lib/devLogSetup.ts untuk penjelasan kenapa.
import '@/lib/devLogSetup';

import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  InstrumentSerif_400Regular,
} from '@expo-google-fonts/instrument-serif';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
} from '@expo-google-fonts/plus-jakarta-sans';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { ThemeProvider } from '@/context/theme';
import { ProfileProvider } from '@/context/profile';
import { ShiftProvider } from '@/context/shifts';
import { SwapProvider } from '@/context/swap';
import { ToastProvider } from '@/components/ui/Toast';
import { useShiftNotificationSync } from '@/hooks/useShiftNotificationSync';

// Komponen kosong yg cuma jalanin side-effect — sync shifts ke OS
// scheduled notifications. Harus berada di dalam ShiftProvider + ProfileProvider.
function NotificationSync() {
  useShiftNotificationSync();
  return null;
}

// Hold native splash sampai useEffect bilang siap.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Aman di-ignore — biasanya error kalau dipanggil 2x (hot reload).
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    InstrumentSerif_400Regular,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    // Hide splash kalau font siap ATAU gagal (jangan stuck).
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Tunggu sampai font selesai loading. Kalau error, lanjut render
  // dengan system font fallback — UX lebih baik daripada blank screen.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <ProfileProvider>
              <ShiftProvider>
                <SwapProvider>
                  <ToastProvider>
                    <NotificationSync />
                    <Stack screenOptions={{ headerShown: false }} />
                    <StatusBar style="auto" />
                  </ToastProvider>
                </SwapProvider>
              </ShiftProvider>
            </ProfileProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
