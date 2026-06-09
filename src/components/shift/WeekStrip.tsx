// Week strip — 7 days ahead from today.
//
// Each pill shows:
//   - Day name (Mon/Tue/Wed/Thu/Fri/Sat/Sun)
//   - Day number
//   - Small coloured dot matching the shift (if any)
//   - Today is highlighted with sage border
//
// Horizontal scroll — minimum pill width 48pt (touch target).

import { ScrollView, Text, View } from 'react-native';
import { format, addDays } from 'date-fns';
import { enGB as dateLocale } from 'date-fns/locale';
import { useTheme } from '@/context/theme';
import type { ShiftMap } from '@/context/shifts';
import { getShiftStyle } from '@/lib/shiftStyling';

interface Props {
  shifts: ShiftMap;
}

const DAYS_AHEAD = 7;
const PILL_WIDTH = 56;
const DOT_SIZE = 6;

export function WeekStrip({ shifts }: Props) {
  const { colors, typography, spacing, radius } = useTheme();
  const today = new Date();
  const todayISO = format(today, 'yyyy-MM-dd');

  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const date = addDays(today, i);
    const iso = format(date, 'yyyy-MM-dd');
    return {
      iso,
      dayShort: format(date, 'EEE', { locale: dateLocale }), // Mon, Tue, ...
      dayNum: format(date, 'd'),
      isToday: iso === todayISO,
      shift: shifts[iso],
    };
  });

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text
        style={[
          typography.labelSM,
          {
            color: colors.primaryMuted,
            marginBottom: spacing.sm,
            paddingHorizontal: spacing['2xl'],
          },
        ]}
      >
        Next 7 days
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          gap: spacing.sm,
        }}
      >
        {days.map((day) => {
          const shiftStyle = day.shift
            ? getShiftStyle(day.shift.code, colors)
            : null;
          return (
            <View
              key={day.iso}
              style={{
                width: PILL_WIDTH,
                paddingVertical: spacing.md,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: day.isToday ? colors.primary : colors.border,
                backgroundColor: day.isToday
                  ? colors.primarySoft
                  : colors.surface,
                alignItems: 'center',
              }}
            >
              <Text
                style={[
                  typography.labelSM,
                  {
                    color: day.isToday ? colors.primary : colors.textTertiary,
                  },
                ]}
              >
                {day.dayShort}
              </Text>
              <Text
                style={[
                  typography.displaySM,
                  {
                    color: day.isToday ? colors.primary : colors.textPrimary,
                    marginVertical: 2,
                  },
                ]}
              >
                {day.dayNum}
              </Text>
              {/* Dot warna shift — atau placeholder transparent biar height konsisten.
                  Dashed border butuh borderWidth >= 2 di Android biar render. */}
              <View
                style={{
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  borderRadius: DOT_SIZE / 2,
                  backgroundColor: shiftStyle?.bg ?? 'transparent',
                  borderWidth: shiftStyle?.borderDashed ? 2 : 0,
                  borderStyle: shiftStyle?.borderDashed ? 'dashed' : 'solid',
                  borderColor: shiftStyle?.border,
                }}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
