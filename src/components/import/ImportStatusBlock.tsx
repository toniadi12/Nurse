// Komponen status sederhana — dipakai untuk state 'reading', 'saving', 'error'.
// Icon di tengah + title + body opsional + optional action button.

import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/context/theme';

interface Props {
  icon: React.ReactNode;
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void };
}

export function ImportStatusBlock({ icon, title, body, action }: Props) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: spacing['3xl'],
      }}
    >
      <View style={{ marginBottom: spacing.md }}>{icon}</View>

      <Text
        style={[
          typography.bodyMD,
          { color: colors.textPrimary, marginBottom: spacing.xs },
        ]}
      >
        {title}
      </Text>

      {body && body.length > 0 && (
        <Text
          style={[
            typography.bodySM,
            { color: colors.textSecondary, textAlign: 'center' },
          ]}
        >
          {body}
        </Text>
      )}

      {action && (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          style={({ pressed }) => ({
            marginTop: spacing.lg,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={[typography.labelMD, { color: colors.textPrimary }]}>
            {action.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
