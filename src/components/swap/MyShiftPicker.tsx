// Visual picker shift saya untuk wizard tukar (PRD F8 improvement).
//
// Pengganti SwapShiftPicker (text input tanggal) — user feedback:
//   "user akan lupa dan harus cek kalender kembali melihat jadwal nya"
//
// Strategi: tampilkan **upcoming shifts** (today + 30 hari ke depan) sebagai
// list kartu visual. Tap kartu → select. Active state highlighted border sage.
//
// Termasuk Libur/Cuti — user mungkin mau tukar libur jadi kerja (mis. minta
// shift kolega supaya bisa cuti di tanggal lain).

import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { addDays, format, parseISO } from 'date-fns';
import { enGB as dateLocale } from 'date-fns/locale';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/context/theme';
import { SHIFT_LABEL_ID } from '@/constants/shiftCodes';
import { getShiftStyle } from '@/lib/shiftStyling';
import type { Shift } from '@/types/shift';
import type { ShiftMap } from '@/context/shifts';

interface Props {
  shifts: ShiftMap;
  selectedDate: string; // ISO atau '' kalau belum pilih
  onSelect: (date: string) => void;
}

const DAYS_AHEAD = 30;
const BADGE_SIZE = 40;
const ICON_STROKE = 2;

export function MyShiftPicker({ shifts, selectedDate, onSelect }: Props) {
  const { colors, typography, spacing, radius } = useTheme();

  // Compute upcoming shifts: today + 30 hari, sort ascending by date.
  // KENAPA bukan ambil semua future dari shifts state? Karena bisa ribuan kalau
  // user import jadwal setahun penuh — render list panjang = lag + UX buruk.
  // 30 hari = window realistis untuk minta tukar (jadwal RS biasanya 2-4 minggu).
  const upcomingShifts = useMemo(() => {
    const today = new Date();
    const todayISO = format(today, 'yyyy-MM-dd');
    const cutoffISO = format(addDays(today, DAYS_AHEAD), 'yyyy-MM-dd');

    return Object.values(shifts)
      .filter((s) => s.date >= todayISO && s.date <= cutoffISO)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [shifts]);

  if (upcomingShifts.length === 0) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.sm,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.lg,
          alignItems: 'center',
        }}
      >
        <Text
          style={[
            typography.bodyMD,
            { color: colors.textSecondary, textAlign: 'center' },
          ]}
        >
          No upcoming shifts yet.
        </Text>
        <Text
          style={[
            typography.bodySM,
            {
              color: colors.textTertiary,
              marginTop: spacing.xs,
              textAlign: 'center',
            },
          ]}
        >
          Add a shift in the Schedule tab first, then come back here.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      {upcomingShifts.map((shift) => (
        <ShiftPickerItem
          key={shift.id}
          shift={shift}
          selected={selectedDate === shift.date}
          onPress={() => onSelect(shift.date)}
        />
      ))}
    </View>
  );
}

// Sub-item — extracted biar parent map bersih.
function ShiftPickerItem({
  shift,
  selected,
  onPress,
}: {
  shift: Shift;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, typography, spacing, radius } = useTheme();
  const shiftStyle = getShiftStyle(shift.code, colors);

  // Format tanggal: "Sen, 28 Mei" — singkat tapi jelas.
  const dateLabel = format(parseISO(shift.date), 'EEE, d MMM', {
    locale: dateLocale,
  });
  const timeLabel =
    shift.startTime && shift.endTime
      ? `${shift.startTime}–${shift.endTime}`
      : SHIFT_LABEL_ID[shift.code];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${SHIFT_LABEL_ID[shift.code]} ${dateLabel}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primarySoft : colors.surface,
        opacity: pressed && !selected ? 0.7 : 1,
      })}
    >
      {/* Badge bulat warna shift code — visual yang sama kayak kalender */}
      <View
        style={{
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          borderRadius: BADGE_SIZE / 2,
          backgroundColor: shiftStyle.bg,
          borderWidth: shiftStyle.borderDashed ? 2 : 1,
          borderStyle: shiftStyle.borderDashed ? 'dashed' : 'solid',
          borderColor: shiftStyle.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={[typography.labelMD, { color: shiftStyle.fg }]}>
          {shift.code === 'CUSTOM' ? '★' : shift.code}
        </Text>
      </View>

      {/* Date + time block */}
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodyMD, { color: colors.textPrimary }]}>
          {dateLabel}
        </Text>
        <Text
          style={[
            typography.bodySM,
            { color: colors.textSecondary, marginTop: 2 },
          ]}
        >
          {SHIFT_LABEL_ID[shift.code]} · {timeLabel}
        </Text>
      </View>

      {/* Check icon saat selected */}
      {selected && (
        <Check color={colors.primary} size={20} strokeWidth={ICON_STROKE} />
      )}
    </Pressable>
  );
}
