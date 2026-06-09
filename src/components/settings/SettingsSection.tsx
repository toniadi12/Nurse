// Wrapper section di tab Saya — title ALL CAPS di atas + content card.
// Dipakai berkali-kali (mode tampilan, nama, notifikasi, dll) — extract
// supaya tidak duplikasi styling.

import { Text, View } from 'react-native';
import { useTheme } from '@/context/theme';

interface Props {
  title: string;
  children: React.ReactNode;
  // Spacing bawah — default 3xl, tapi bisa override (mis. terakhir = 0).
  marginBottom?: number;
}

export function SettingsSection({ title, children, marginBottom }: Props) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={{ marginBottom: marginBottom ?? spacing['3xl'] }}>
      <Text
        style={[
          typography.labelSM,
          {
            color: colors.textSecondary,
            marginBottom: spacing.sm,
            textTransform: 'uppercase',
          },
        ]}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}
