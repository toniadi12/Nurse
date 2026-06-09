// Reusable card pattern di detail swap: label kecil + title + subtitle.
// Dipakai untuk: shift saya, shift kolega, info kolega.

import { Text, View } from 'react-native';
import { useTheme } from '@/context/theme';

interface Props {
  label: string;
  title: string;
  subtitle: string;
  // Variant title: 'display' (besar untuk shift name) | 'body' (sedang untuk nama kolega).
  titleVariant?: 'display' | 'body';
}

export function SwapInfoCard({ label, title, subtitle, titleVariant = 'display' }: Props) {
  const { colors, typography, spacing, radius } = useTheme();
  const titleStyle = titleVariant === 'display' ? typography.displaySM : typography.bodyLG;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
      }}
    >
      <Text
        style={[
          typography.labelSM,
          { color: colors.primaryMuted, marginBottom: spacing.xs },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          titleStyle,
          { color: colors.textPrimary, marginBottom: spacing.xs },
        ]}
      >
        {title}
      </Text>
      <Text style={[typography.bodyMD, { color: colors.textSecondary }]}>
        {subtitle}
      </Text>
    </View>
  );
}
