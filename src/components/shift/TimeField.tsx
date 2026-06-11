// Time input dengan auto-normalize: user ketik "21.00" / "2100" → "21:00".
// Hindari frustrasi user karena keyboard numerik HP default delimiter titik
// (.), bukan titik dua (:).
//
// Pakai BottomSheetTextInput (bukan TextInput biasa) karena komponen ini
// selalu di-render di dalam AddShiftSheet — supaya sheet auto-scroll ke
// field yang lagi di-focus saat keyboard muncul.

import { Text, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Controller, type Control } from 'react-hook-form';
import { useTheme } from '@/context/theme';
import {
  type AddShiftFormData,
  normalizeTimeInput,
} from './addShiftSchema';

interface Props {
  control: Control<AddShiftFormData>;
  name: 'startTime' | 'endTime';
  error?: string | undefined;
}

const TIME_MAX_LENGTH = 5; // "HH:MM"

export function TimeField({ control, name, error }: Props) {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur } }) => (
        <View>
          <BottomSheetTextInput
            value={(value ?? '') as string}
            onChangeText={(raw) => onChange(normalizeTimeInput(raw))}
            onBlur={onBlur}
            placeholder="07:00"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numbers-and-punctuation"
            maxLength={TIME_MAX_LENGTH}
            style={{
              fontFamily: typography.bodyMD.fontFamily,
              fontSize: typography.bodyMD.fontSize,
              color: colors.textPrimary,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: error ? colors.danger : colors.border,
              borderRadius: radius.sm,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            }}
          />
          {error && (
            <Text
              style={[
                typography.bodyXS,
                { color: colors.danger, marginTop: spacing.xs },
              ]}
            >
              {error}
            </Text>
          )}
        </View>
      )}
    />
  );
}
