// Segmented control 3 nilai offset notifikasi (PRD F7 + F10).
// Pilihan: 30 / 60 / 120 menit sebelum shift mulai.
//
// On change → updateProfile → useShiftNotificationSync hook auto re-runs
// (cancel + reschedule semua) karena dependency-nya `profileState`.

import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/context/theme';
import type { NotificationOffset } from '@/types/profile';

interface Props {
  value: NotificationOffset;
  onChange: (v: NotificationOffset) => void;
}

interface OffsetOption {
  value: NotificationOffset;
  label: string;
}

const OPTIONS: readonly OffsetOption[] = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
];

export function NotificationOffsetSelector({ value, onChange }: Props) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.background,
          borderRadius: radius.sm,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 2,
        }}
      >
        {OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Remind me ${opt.label} before shift`}
              style={({ pressed }) => ({
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: spacing.md,
                borderRadius: radius.sm,
                backgroundColor: active ? colors.primary : 'transparent',
                opacity: pressed && !active ? 0.6 : 1,
              })}
            >
              <Text
                style={[
                  typography.labelMD,
                  {
                    color: active ? colors.textInverse : colors.textPrimary,
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text
        style={[
          typography.bodySM,
          { color: colors.textTertiary, marginTop: spacing.sm },
        ]}
      >
        Reminders appear before each working shift starts.
      </Text>
    </View>
  );
}
