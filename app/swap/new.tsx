// Wizard tukar shift (PRD F8).
// MVP: single screen dengan 3 section visual — bukan true 3-step navigation
// karena lebih cepat dan tidak butuh state antar-screen.
//
// Flow:
//   1. Pilih shift saya (tanggal → auto-lookup dari ShiftMap)
//   2. Pilih shift kolega (opsional — kalau user tau jadwal kolega)
//   3. Input nama + nomor WA kolega
//   4. Tap "Lanjut ke WhatsApp" → generate pesan, save SwapRecord,
//      open Linking ke wa.me, redirect ke detail.

import { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/context/theme';
import { useShifts } from '@/context/shifts';
import { useSwaps } from '@/context/swap';
import { useProfile } from '@/context/profile';
import { ShiftCodeSelector } from '@/components/shift/ShiftCodeSelector';
import { MyShiftPicker } from '@/components/swap/MyShiftPicker';
import { ColleagueFields } from '@/components/swap/ColleagueFields';
import { FieldLabel } from '@/components/ui/FormTextField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  buildSwapMessage,
  buildWhatsAppLink,
  normalizePhoneForWhatsApp,
} from '@/lib/whatsapp';
import type { ShiftCode } from '@/types/shift';
import type { SwapRecord } from '@/types/swap';

export default function NewSwapScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const { state: shiftState } = useShifts();
  const { state: profileState } = useProfile();
  const { addSwap } = useSwaps();

  const [myShiftDate, setMyShiftDate] = useState('');
  const [colleagueShiftDate, setColleagueShiftDate] = useState('');
  const [colleagueShiftCode, setColleagueShiftCode] = useState<ShiftCode>('P');
  const [colleagueName, setColleagueName] = useState('');
  const [colleaguePhone, setColleaguePhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Info dialog state — pengganti native Alert.alert untuk pesan info.
  const [infoDialog, setInfoDialog] = useState<{
    title: string;
    body: string;
  } | null>(null);

  const shifts = shiftState.kind === 'ready' ? shiftState.shifts : {};
  const matchedShift = useMemo(
    () => shifts[myShiftDate] ?? null,
    [shifts, myShiftDate],
  );

  // Wizard valid kalau:
  //   - shift saya ketemu
  //   - nama kolega min 2 char
  //   - phone bisa di-normalize
  const phoneValid = colleaguePhone.length > 0
    ? normalizePhoneForWhatsApp(colleaguePhone) !== null
    : false;
  const nameValid = colleagueName.trim().length >= 2;
  const canSubmit =
    matchedShift !== null && nameValid && phoneValid && !submitting;

  async function handleSubmit() {
    if (!canSubmit || !matchedShift) return;
    if (profileState.kind !== 'ready') {
      setInfoDialog({
        title: 'Profile not ready',
        body: 'Hold on a moment and try again.',
      });
      return;
    }

    const normalizedPhone = normalizePhoneForWhatsApp(colleaguePhone);
    if (!normalizedPhone) {
      setInfoDialog({
        title: 'Invalid phone number',
        body: 'Check the number format and try again.',
      });
      return;
    }

    setSubmitting(true);

    const hasColleagueShift =
      colleagueShiftDate.length > 0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(colleagueShiftDate);

    const message = buildSwapMessage({
      myName: profileState.profile.nurseName,
      colleagueName: colleagueName.trim(),
      myShiftDate: matchedShift.date,
      myShiftCode: matchedShift.code,
      ...(hasColleagueShift && {
        colleagueShiftDate,
        colleagueShiftCode,
      }),
    });

    // ID swap pakai pattern yg konsisten dgn shift (s-{ts}-{rand}).
    const swapId = `swap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const record: SwapRecord = {
      id: swapId,
      myShiftDate: matchedShift.date,
      myShiftCode: matchedShift.code,
      ...(hasColleagueShift && {
        colleagueShiftDate,
        colleagueShiftCode,
      }),
      colleagueName: colleagueName.trim(),
      colleaguePhone,
      status: 'pending',
      messageSent: message,
      sentAt: Date.now(),
    };

    addSwap(record);

    // Buka WhatsApp. Kalau gagal (WA tidak terinstall di emulator), kasih
    // pesan ramah — swap tetap tersimpan biar user bisa coba kirim manual.
    const url = buildWhatsAppLink(normalizedPhone, message);
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        setInfoDialog({
          title: "WhatsApp not found",
          body: "The swap is saved in your history — you can copy the message from the details screen.",
        });
      }
    } catch (err) {
      console.warn('Linking.openURL gagal:', err);
    }

    // Redirect ke detail (replace biar back tidak ke wizard kosong).
    router.replace(`/swap/${swapId}`);
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'bottom']}
    >
      {/* Header dengan back button */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: spacing.lg,
          gap: spacing.md,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Back"
        >
          <ArrowLeft color={colors.textPrimary} size={24} strokeWidth={1.5} />
        </Pressable>
        <Text style={[typography.displaySM, { color: colors.textPrimary }]}>
          Swap shift
        </Text>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={{
          padding: spacing['2xl'],
          paddingBottom: spacing['5xl'],
        }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={spacing['2xl']}
      >
          {/* Section 1: Shift saya */}
          <FieldLabel>Your shift to give up</FieldLabel>
          <MyShiftPicker
            shifts={shifts}
            selectedDate={myShiftDate}
            onSelect={setMyShiftDate}
          />

          {/* Section 2: Shift kolega (opsional) */}
          <View style={{ marginTop: spacing['2xl'] }}>
            <FieldLabel>Colleague's shift you'd take (optional)</FieldLabel>
            <TextInput
              value={colleagueShiftDate}
              onChangeText={setColleagueShiftDate}
              placeholder="2026-05-30 (kosongkan kalau belum tau)"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              style={{
                fontFamily: typography.bodyMD.fontFamily,
                fontSize: typography.bodyMD.fontSize,
                color: colors.textPrimary,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.sm,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                marginBottom: spacing.md,
              }}
            />
            {colleagueShiftDate.length > 0 && (
              <ShiftCodeSelector
                value={colleagueShiftCode}
                onChange={setColleagueShiftCode}
              />
            )}
          </View>

          {/* Section 3: Info kolega */}
          <ColleagueFields
            name={colleagueName}
            onNameChange={setColleagueName}
            phone={colleaguePhone}
            onPhoneChange={setColleaguePhone}
            phoneValid={phoneValid}
          />

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
            style={({ pressed }) => ({
              marginTop: spacing['3xl'],
              backgroundColor: canSubmit ? colors.primary : colors.borderStrong,
              paddingVertical: spacing.lg,
              borderRadius: radius.sm,
              alignItems: 'center',
              opacity: pressed && canSubmit ? 0.85 : 1,
            })}
          >
            <Text style={[typography.labelMD, { color: colors.textInverse }]}>
              Send via WhatsApp
            </Text>
          </Pressable>
      </KeyboardAwareScrollView>

      <ConfirmDialog
        visible={infoDialog != null}
        title={infoDialog?.title ?? ''}
        body={infoDialog?.body}
        confirmLabel="OK"
        singleAction
        onCancel={() => setInfoDialog(null)}
        onConfirm={() => setInfoDialog(null)}
      />
    </SafeAreaView>
  );
}
