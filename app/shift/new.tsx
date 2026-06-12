// Form tambah shift manual (PRD F4) — route penuh.
//
// Field: tanggal (text input), jenis shift, opsi jam custom (kalau
// code=CUSTOM), ruangan optional, catatan optional. Auto-save tanpa
// konfirmasi tambahan, KECUALI kalau tanggal yg sama udah ada shift →
// confirm via ConfirmDialog.
//
// KENAPA route penuh + KeyboardAwareScrollView?
//   Expo SDK 54 mengaktifkan edge-to-edge di APK standalone. Di mode itu,
//   windowSoftInputMode=adjustResize TIDAK lagi mengecilkan window saat
//   keyboard buka — jadi KeyboardAvoidingView biasa gagal, keyboard nutup
//   field. Ini cuma muncul di APK, TIDAK di Expo Go (Expo Go tanpa edge-to-edge)
//   — makanya test di Expo Go menipu.
//   Solusi resmi Expo untuk form multi-field di edge-to-edge:
//   react-native-keyboard-controller → KeyboardAwareScrollView yang otomatis
//   scroll ke field yang lagi di-focus (butuh KeyboardProvider di root).
//
// Param `date` (opsional): prefill tanggal kalau user tap cell kalender.
//
// Form: react-hook-form + zod. Footer buttons di AddShiftSheetActions.tsx.

import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useTheme } from '@/context/theme';
import { useShifts } from '@/context/shifts';
import { ShiftCodeSelector } from '@/components/shift/ShiftCodeSelector';
import { TimeField } from '@/components/shift/TimeField';
import { AddShiftSheetActions } from '@/components/shift/AddShiftSheetActions';
import { AddShiftSchema, type AddShiftFormData } from '@/components/shift/addShiftSchema';
import { FieldLabel, FormTextField } from '@/components/ui/FormTextField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { createShift } from '@/lib/shiftFactory';
import { formatNaturalDate } from '@/lib/dateUtils';
import { SHIFT_DEFAULT_TIMES, SHIFT_LABEL_ID } from '@/constants/shiftCodes';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface PendingReplace {
  data: AddShiftFormData;
  existingLabel: string;
}

export default function NewShiftScreen() {
  const { colors, typography, spacing } = useTheme();
  const { state: shiftState, upsertShift } = useShifts();
  const params = useLocalSearchParams<{ date?: string }>();

  const todayISO = format(new Date(), 'yyyy-MM-dd');
  const startingDate = params.date ?? todayISO;

  const { control, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<AddShiftFormData>({
      resolver: zodResolver(AddShiftSchema),
      mode: 'onChange',
      defaultValues: {
        date: startingDate,
        code: 'P',
        startTime: '',
        endTime: '',
        ward: '',
        note: '',
      },
    });

  const code = watch('code');
  const dateStr = watch('date');
  const datePreview = ISO_DATE_PATTERN.test(dateStr) ? formatNaturalDate(dateStr) : null;
  const showTimeFields = code === 'P' || code === 'S' || code === 'M' || code === 'CUSTOM';

  // Auto-fill default time saat user pick P/S/M (biar custom field kelihatan
  // sudah ada nilai). Kalau pilih CUSTOM, kosongin biar user isi sendiri.
  useEffect(() => {
    if (code === 'P' || code === 'S' || code === 'M') {
      setValue('startTime', SHIFT_DEFAULT_TIMES[code].startTime);
      setValue('endTime', SHIFT_DEFAULT_TIMES[code].endTime);
    } else if (code === 'L' || code === 'C') {
      setValue('startTime', '');
      setValue('endTime', '');
    }
  }, [code, setValue]);

  const [pendingReplace, setPendingReplace] = useState<PendingReplace | null>(null);

  function commitSave(data: AddShiftFormData) {
    const shift = createShift({
      date: data.date,
      code: data.code,
      source: 'manual',
      ...(data.startTime ? { startTime: data.startTime } : {}),
      ...(data.endTime ? { endTime: data.endTime } : {}),
      ...(data.ward ? { ward: data.ward } : {}),
      ...(data.note ? { note: data.note } : {}),
    });
    upsertShift(shift);
    router.back();
  }

  function onSubmit(data: AddShiftFormData) {
    const existing =
      shiftState.kind === 'ready' ? shiftState.shifts[data.date] : undefined;
    if (existing) {
      setPendingReplace({ data, existingLabel: SHIFT_LABEL_ID[existing.code] });
      return;
    }
    commitSave(data);
  }

  function handleConfirmReplace() {
    if (!pendingReplace) return;
    commitSave(pendingReplace.data);
    setPendingReplace(null);
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'bottom']}
    >
      {/* Header: back button + judul */}
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
          accessibilityRole="button"
        >
          <ArrowLeft color={colors.textPrimary} size={24} strokeWidth={1.5} />
        </Pressable>
        <Text style={[typography.displaySM, { color: colors.textPrimary }]}>
          Add shift
        </Text>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingTop: spacing.md,
          paddingBottom: spacing['4xl'],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        // Jarak ekstra antara field yang di-focus dan keyboard supaya
        // field tidak mepet ke ujung keyboard.
        bottomOffset={spacing['2xl']}
      >
          <FieldLabel>Date</FieldLabel>
          <FormTextField
            control={control}
            name="date"
            placeholder="2026-05-27"
            error={errors.date?.message}
            keyboardType="numbers-and-punctuation"
          />
          <Text
            style={[
              typography.bodyXS,
              {
                color: datePreview ? colors.textSecondary : colors.textTertiary,
                marginTop: spacing.xs,
                marginBottom: spacing.lg,
              },
            ]}
          >
            {datePreview ?? 'Format: YYYY-MM-DD (e.g. 2026-05-27)'}
          </Text>

          <FieldLabel>Shift type</FieldLabel>
          <View style={{ marginBottom: spacing.lg }}>
            <Controller
              control={control}
              name="code"
              render={({ field }) => (
                <ShiftCodeSelector value={field.value} onChange={field.onChange} />
              )}
            />
          </View>

          {showTimeFields && (
            <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
              <View style={{ flex: 1 }}>
                <FieldLabel>Start</FieldLabel>
                <TimeField
                  control={control}
                  name="startTime"
                  error={errors.startTime?.message}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FieldLabel>End</FieldLabel>
                <TimeField
                  control={control}
                  name="endTime"
                  error={errors.endTime?.message}
                />
              </View>
            </View>
          )}

          <FieldLabel>Ward (optional)</FieldLabel>
          <FormTextField
            control={control}
            name="ward"
            placeholder="e.g. A&E, ICU, Ward 5"
          />
          <View style={{ height: spacing.lg }} />

          <FieldLabel>Note (optional)</FieldLabel>
          <FormTextField
            control={control}
            name="note"
            placeholder="e.g. swapped with Maya"
            multiline
          />

          <AddShiftSheetActions
            onCancel={() => router.back()}
            onSave={handleSubmit(onSubmit)}
          />
      </KeyboardAwareScrollView>

      <ConfirmDialog
        visible={pendingReplace != null}
        title="Replace shift?"
        body={
          pendingReplace
            ? `This date already has a ${pendingReplace.existingLabel} shift. Replace it?`
            : undefined
        }
        confirmLabel="Replace"
        cancelLabel="Cancel"
        variant="destructive"
        onCancel={() => setPendingReplace(null)}
        onConfirm={handleConfirmReplace}
      />
    </SafeAreaView>
  );
}
