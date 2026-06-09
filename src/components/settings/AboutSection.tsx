// Section "Tentang" di tab Saya — versi app + privacy.
//
// Versi: dari app.json via expo-constants. Tidak ada server check —
// MVP local-only.
//
// Privacy policy: belum ada URL hosted, jadi text statis singkat.
// Nanti F11+ bisa link ke website.

import { Text, View } from 'react-native';
import Constants from 'expo-constants';
import { useTheme } from '@/context/theme';

export function AboutSection() {
  const { colors, typography, spacing, radius } = useTheme();
  // expoConfig?.version diisi dari app.json. Fallback ke 'dev' kalau gak ada.
  const appVersion = Constants.expoConfig?.version ?? 'dev';

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        gap: spacing.md,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={[typography.bodyMD, { color: colors.textSecondary }]}>
          App version
        </Text>
        <Text style={[typography.monoMD, { color: colors.textPrimary }]}>
          {appVersion}
        </Text>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: colors.border,
        }}
      />

      <View>
        <Text
          style={[
            typography.bodyMD,
            { color: colors.textPrimary, marginBottom: spacing.xs },
          ]}
        >
          Privacy
        </Text>
        <Text style={[typography.bodySM, { color: colors.textSecondary }]}>
          All your data — name, shifts, swap history — stays on this device.
          Nothing is sent to any server.
        </Text>
      </View>
    </View>
  );
}
