// Reusable TextInput wrapper untuk react-hook-form.
//
// Pakai generic <T extends FieldValues> biar bisa dipakai di berbagai form
// (AddShiftSheet, F10 Settings, dll). Visual: border halus, border merah
// kalau error, label di atas terpisah (parent yg render).
//
// Prop `bottomSheet`: kalau true, pakai BottomSheetTextInput dari
// @gorhom/bottom-sheet. Ini bikin sheet auto-scroll ke field yang lagi
// di-focus saat keyboard muncul — jadi tidak ke-cover keyboard.
// Pakai true CUMA kalau komponen ini di-render di dalam <BottomSheet>.

import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { useTheme } from '@/context/theme';

interface FormTextFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  // Explicit `| undefined` karena tsconfig pakai exactOptionalPropertyTypes:
  // caller boleh pass `errors.field?.message` (yg type-nya `string | undefined`)
  // tanpa harus conditional-spread.
  placeholder?: string | undefined;
  error?: string | undefined;
  multiline?: boolean | undefined;
  keyboardType?: TextInputProps['keyboardType'] | undefined;
  bottomSheet?: boolean | undefined;
}

export function FormTextField<TFieldValues extends FieldValues>({
  control,
  name,
  placeholder,
  error,
  multiline,
  keyboardType,
  bottomSheet,
}: FormTextFieldProps<TFieldValues>) {
  const { colors, typography, spacing, radius } = useTheme();
  const InputComponent = bottomSheet ? BottomSheetTextInput : TextInput;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur } }) => (
        <View>
          <InputComponent
            value={(value ?? '') as string}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            multiline={multiline}
            keyboardType={keyboardType ?? 'default'}
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
              minHeight: multiline ? 80 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
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

// Label kecil ALL CAPS di atas form field — sesuai DESIGN.md section 3 labelSM.
export function FieldLabel({ children }: { children: React.ReactNode }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <Text
      style={[
        typography.labelSM,
        { color: colors.textSecondary, marginBottom: spacing.xs },
      ]}
    >
      {children}
    </Text>
  );
}
