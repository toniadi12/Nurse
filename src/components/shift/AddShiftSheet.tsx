// Bottom sheet untuk tambah/edit shift manual (PRD F4).
//
// Field: tanggal (text input — picker dropped untuk MVP karena tidak
// reliable di dalam @gorhom/bottom-sheet di Expo Go), jenis shift,
// opsi jam custom (kalau code=CUSTOM), ruangan optional, catatan
// optional. Auto-save tanpa konfirmasi tambahan, KECUALI kalau tanggal
// yg sama udah ada shift → confirm via ConfirmDialog.
//
// Form: react-hook-form + zod. Sheet: @gorhom/bottom-sheet (auto-expand
// saat mount, pan-down-to-close). Parent yg control lifecycle via prop
// `onClose` — sheet ini cuma render kalau parent set visible.
//
// Footer buttons di-extract ke AddShiftSheetActions.tsx supaya file ini
// stay di bawah 300 baris (CLAUDE.md hard limit).

import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
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

// Snap point: 70% normal, 95% saat keyboard buka.
// @gorhom/bottom-sheet keyboardBehavior='interactive' auto-snap ke tertinggi.
const SHEET_SNAP_POINTS = ['70%', '95%'] as const;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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
  const { colors, typography, spacing } = useTheme();
  const { state: shiftState, upsertShift } = useShifts();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [...SHEET_SNAP_POINTS], []);

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
    sheetRef.current?.close();
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
    <BottomSheet
      ref={sheetRef}
      // index={0} = mount open di snap point pertama (70%). Sebelumnya
      // pakai index={-1} + useEffect expand() — ref timing kadang race
      // di @gorhom v5 jadi sheet stuck closed walaupun mount.
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      // Keyboard handling — krusial supaya field & tombol Save gak ke-cover
      // saat user input ruangan/catatan. 'interactive' = sheet ikut naik
      // bareng keyboard, 'restore' = sheet kembali ke posisi awal saat blur.
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      onChange={(idx) => {
        if (idx === -1) onClose();
      }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.borderStrong }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          padding: spacing['2xl'],
          // Extra space di bottom — tombol Save harus tetap kelihatan
          // saat keyboard buka. Sheet auto-snap ke 95% via keyboardBehavior,
          // plus scroll buffer biar tombol gak nempel ke edge.
          paddingBottom: spacing['6xl'],
        }}
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
          onCancel={() => sheetRef.current?.close()}
          onSave={handleSubmit(onSubmit)}
        />
      </BottomSheetScrollView>

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
    </BottomSheet>
  );
}
