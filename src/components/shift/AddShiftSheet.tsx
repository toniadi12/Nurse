// Modal tambah/edit shift manual (PRD F4).
//
// Field: tanggal (text input), jenis shift, opsi jam custom (kalau
// code=CUSTOM), ruangan optional, catatan optional. Auto-save tanpa
// konfirmasi tambahan, KECUALI kalau tanggal yg sama udah ada shift →
// confirm via ConfirmDialog.
//
// KENAPA Modal + KeyboardAvoidingView + ScrollView, bukan @gorhom/bottom-sheet?
//   Bottom sheet + form panjang + keyboard = sumber bug keyboard nutup
//   field (terutama Note di paling bawah, terutama di standalone APK).
//   Pola Modal + KeyboardAvoidingView + ScrollView ini sama persis dengan
//   app/swap/new.tsx yang sudah terbukti jalan tanpa masalah keyboard.
//
// Form: react-hook-form + zod. Footer buttons di AddShiftSheetActions.tsx.

import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useTheme } from '@/context/theme';
import { useShifts } from '@/context/shifts';
import { ShiftCodeSelector } from './ShiftCodeSelector';
import { TimeField } from './TimeField';
import { AddShiftSheetActions } from './AddShiftSheetActions';
import { AddShiftSchema, type AddShiftFormData } from './addShiftSchema';
import { FieldLabel, FormTextField } from '@/components/ui/FormTextField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { createShift } from '@/lib/shiftFactory';
import { formatNaturalDate } from '@/lib/dateUtils';
import { SHIFT_DEFAULT_TIMES, SHIFT_LABEL_ID } from '@/constants/shiftCodes';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Sheet maksimal 90% tinggi layar — sisanya backdrop transparan di atas.
const SHEET_MAX_HEIGHT = '90%';

interface Props {
  onClose: () => void;
  // Optional — kalau di-set, form starts dengan tanggal ini (mis. user tap
  // cell di kalender). Default: hari ini.
  initialDate?: string | undefined;
}

interface PendingReplace {
  data: AddShiftFormData;
  existingLabel: string;
}

export function AddShiftSheet({ onClose, initialDate }: Props) {
  const { colors, typography, spacing, radius } = useTheme();
  const { state: shiftState, upsertShift } = useShifts();

  const todayISO = format(new Date(), 'yyyy-MM-dd');
  const startingDate = initialDate ?? todayISO;

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
    onClose();
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
    <Modal
      visible
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop transparan — tap di luar sheet untuk close. */}
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={onClose}
      />

      <KeyboardAvoidingView
        // iOS perlu 'padding' supaya konten naik di atas keyboard. Android
        // pakai undefined + andalkan windowSoftInputMode=adjustResize (di-set
        // di app.json android.softwareKeyboardLayoutMode) — window resize
        // otomatis, ScrollView dapat ruang.
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <SafeAreaView
          edges={['bottom']}
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius['2xl'],
            borderTopRightRadius: radius['2xl'],
            maxHeight: SHEET_MAX_HEIGHT,
          }}
        >
          {/* Handle indicator — visual cue "ini sheet". */}
          <View style={{ alignItems: 'center', paddingTop: spacing.md }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.borderStrong,
              }}
            />
          </View>

          <ScrollView
            contentContainerStyle={{
              padding: spacing['2xl'],
              paddingBottom: spacing['4xl'],
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={[
                typography.displaySM,
                { color: colors.textPrimary, marginBottom: spacing['2xl'] },
              ]}
            >
              Add shift
            </Text>

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
              onCancel={onClose}
              onSave={handleSubmit(onSubmit)}
            />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

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
    </Modal>
  );
}
