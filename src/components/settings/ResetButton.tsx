// Tombol "Reset all data" di tab Settings (Danger Zone).
//
// Visual: outline merah (danger), bukan filled — supaya kelihatan destructive
// tapi tidak terlalu mencolok untuk user yang sekedar scrolling.
// Confirm flow (2 ConfirmDialog berurutan) di-handle parent — komponen ini
// cuma tampil + onPress.

import { Pressable, Text } from 'react-native';
import { useTheme } from '@/context/theme';

interface Props {
  onPress: () => void;
}

export function ResetButton({ onPress }: Props) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Reset all data"
      style={({ pressed }) => ({
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.danger,
        alignItems: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={[typography.labelMD, { color: colors.danger }]}>
        Reset all data
      </Text>
    </Pressable>
  );
}
