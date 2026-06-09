// Splash + decision route (URL "/").
//
// Tugas (PRD F1):
//   1. Tampilkan splash visual 1.5–2 detik dengan logo jam animasi.
//   2. Tunggu ProfileContext selesai load dari AsyncStorage.
//   3. Redirect:
//      - state.kind === 'no-profile' → /onboarding/name (first launch)
//      - state.kind === 'ready'      → /home (sudah onboarding)
//
// Visual sesuai mockup (2026-05-28 update):
//   - AnimatedClock di tengah (sage outline + jarum oranye+sage, jarum
//     berputar pelan via reanimated — DESIGN.md section 9 "jam ber-tick")
//   - "ROYAL BRITISH LEGION" serif (displayMD karena 20 chars — displayXL overflow)
//   - Tagline "Made for nurses and carers"
//   - Footer: garis pemisah halus + "MADE FOR NURSES" ALL CAPS

import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useTheme } from '@/context/theme';
import { useProfile } from '@/context/profile';
import { AnimatedClock } from '@/components/splash/AnimatedClock';

const SPLASH_MIN_DURATION_MS = 3000;
const FOOTER_DIVIDER_WIDTH = 40;

export default function SplashRoute() {
  const { colors, typography, spacing } = useTheme();
  const { state } = useProfile();
  const [minDelayElapsed, setMinDelayElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setMinDelayElapsed(true),
      SPLASH_MIN_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, []);

  const profileReady = state.kind !== 'loading';
  const shouldRedirect = profileReady && minDelayElapsed;

  if (shouldRedirect) {
    if (state.kind === 'no-profile') {
      return <Redirect href="/onboarding/name" />;
    }
    return <Redirect href="/home" />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing['2xl'],
      }}
    >
      {/* Konten utama centered vertically */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatedClock />
        <Text
          style={[
            typography.displayMD,
            {
              color: colors.textPrimary,
              marginTop: spacing['2xl'],
              textAlign: 'center',
            },
          ]}
        >
          ROYAL BRITISH LEGION
        </Text>
        <Text
          style={[
            typography.bodyMD,
            {
              color: colors.textSecondary,
              fontStyle: 'italic',
              marginTop: spacing.sm,
            },
          ]}
        >
          Made for nurses and carers
        </Text>
      </View>

      {/* Footer "UNTUK PERAWAT INDONESIA" */}
      <View style={{ alignItems: 'center', paddingBottom: spacing['2xl'] }}>
        <View
          style={{
            width: FOOTER_DIVIDER_WIDTH,
            height: 2,
            backgroundColor: colors.primary,
            borderRadius: 1,
            marginBottom: spacing.lg,
          }}
        />
        <Text
          style={[
            typography.labelSM,
            { color: colors.textSecondary, letterSpacing: 1.5 },
          ]}
        >
          MADE FOR NURSES
        </Text>
      </View>
    </View>
  );
}
