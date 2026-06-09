// Onboarding step 1 — input nama perawat (PRD F2).
//
// Spec:
//   - Input bebas, minimal 2 karakter
//   - Disimpan sebagai `nurseName` di ProfileContext (auto-persist ke AsyncStorage)
//   - Hint: "Ketik seperti tertulis di jadwal RS"
//   - Microcopy: "Siapa nama panggilanmu, sus?" (DESIGN.md section 11)
//
// Validation: react-hook-form + zod. Tombol "Lanjut" disabled selama invalid.
// Auto-focus input + return key submit, biar user tinggal ketik + Enter.

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '@/context/theme';
import { useProfile } from '@/context/profile';
import { getTimeBasedGreeting } from '@/lib/greeting';
import type { NotificationOffset } from '@/types/profile';

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 40;

// Default notification offset saat onboarding selesai. User bisa ganti
// nanti di tab Saya (F10). 60 menit dipilih karena cukup waktu untuk
// siap-siap berangkat shift tanpa terlalu cepat ngingatin.
const DEFAULT_NOTIFICATION_OFFSET: NotificationOffset = 60;

// Schema validasi — pakai zod jadi pesan error otomatis sesuai aturan.
// `.trim()` SEBELUM `.min()` biar spasi-spasi doang tidak dianggap valid.
const NameFormSchema = z.object({
  nurseName: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, `Name needs at least ${MIN_NAME_LENGTH} characters`)
    .max(MAX_NAME_LENGTH, `Name is too long (max ${MAX_NAME_LENGTH} characters)`),
});

type NameFormData = z.infer<typeof NameFormSchema>;

export default function OnboardingNameScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const { updateProfile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NameFormData>({
    resolver: zodResolver(NameFormSchema),
    mode: 'onChange', // validate setiap keystroke biar button real-time disabled/enabled
    defaultValues: { nurseName: '' },
  });

  const onSubmit = handleSubmit((data) => {
    // Cegah double-submit kalau user tap berulang.
    if (isSubmitting) return;
    setIsSubmitting(true);
    updateProfile({
      nurseName: data.nurseName.trim(),
      notificationOffset: DEFAULT_NOTIFICATION_OFFSET,
    });
    // push (bukan replace) — biar user bisa back ke step 1 dari step 2
    // kalau ada salah ketik nama. Replace baru dipakai di akhir flow
    // (import.tsx atau import-or-manual.tsx → /home).
    router.push('/onboarding/import-or-manual');
  });

  const greeting = getTimeBasedGreeting();
  const submitDisabled = !isValid || isSubmitting;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // iOS perlu 'padding' biar keyboard tidak nutupi button bawah.
        // Android handle sendiri via windowSoftInputMode (adjustResize default).
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={{
            flex: 1,
            padding: spacing['2xl'],
            justifyContent: 'space-between',
          }}
        >
          <View style={{ marginTop: spacing['4xl'] }}>
            <Text
              style={[
                typography.labelSM,
                { color: colors.primaryMuted, marginBottom: spacing.xs },
              ]}
            >
              Step 1 of 3
            </Text>

            <Text
              style={[
                typography.displayMD,
                { color: colors.textPrimary, marginBottom: spacing.md },
              ]}
            >
              {greeting}.
            </Text>

            <Text
              style={[
                typography.bodyMD,
                {
                  color: colors.textSecondary,
                  marginBottom: spacing['3xl'],
                },
              ]}
            >
              What should we call you? Jaga uses this for greetings and to
              match your name in Excel rosters.
            </Text>

            <Controller
              control={control}
              name="nurseName"
              render={({ field: { value, onChange, onBlur } }) => {
                const errorMessage = errors.nurseName?.message;
                const showError = !!errorMessage && value.length > 0;
                return (
                  <View>
                    <Text
                      style={[
                        typography.labelMD,
                        {
                          color: colors.textSecondary,
                          marginBottom: spacing.xs,
                        },
                      ]}
                    >
                      First name
                    </Text>
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={onSubmit}
                      placeholder="e.g. Sarah"
                      placeholderTextColor={colors.textTertiary}
                      autoFocus
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="done"
                      maxLength={MAX_NAME_LENGTH}
                      style={{
                        // Pakai sebagian dari typography token — jangan
                        // include lineHeight karena di Android bisa bikin
                        // text TextInput ke-clip.
                        fontFamily: typography.bodyLG.fontFamily,
                        fontSize: typography.bodyLG.fontSize,
                        color: colors.textPrimary,
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: showError
                          ? colors.danger
                          : colors.border,
                        borderRadius: radius.sm,
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
                      }}
                    />
                    <Text
                      style={[
                        typography.bodySM,
                        {
                          color: showError
                            ? colors.danger
                            : colors.textTertiary,
                          marginTop: spacing.xs,
                        },
                      ]}
                    >
                      {showError
                        ? errorMessage
                        : 'Type it the way it appears on your hospital roster.'}
                    </Text>
                  </View>
                );
              }}
            />
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={submitDisabled}
            accessibilityRole="button"
            accessibilityState={{ disabled: submitDisabled }}
            style={({ pressed }) => ({
              backgroundColor: submitDisabled
                ? colors.borderStrong
                : colors.primary,
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing['2xl'],
              borderRadius: radius.sm,
              alignItems: 'center',
              opacity: pressed && !submitDisabled ? 0.85 : 1,
            })}
          >
            <Text
              style={[typography.labelMD, { color: colors.textInverse }]}
            >
              Continue
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
