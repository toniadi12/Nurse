// Satu cell tanggal di CalendarGrid.
//
// Variasi visual:
//   - Bulan ini + ada shift     → bg shift color + huruf kode di pojok
//   - Bulan ini + libur (L/C)   → border dashed, no fill
//   - Bulan ini + kosong        → border halus, no fill
//   - Bukan bulan ini           → muted (text tertiary, no border)
//   - Hari ini                  → ring sage di luar
//
// Tap → call onPress dengan tanggal ISO.

import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/context/theme';
import { getShiftStyle } from '@/lib/shiftStyling';
import type { Shift } from '@/types/shift';
import type { CalendarCell as CellData } from '@/lib/calendarGrid';

interface Props {
  cell: CellData;
  // Explicit `| undefined` karena tsconfig exactOptionalPropertyTypes.
  shift?: Shift | undefined;
  onPress: (iso: string) => void;
}

const CELL_HEIGHT = 56;

export function CalendarCell({ cell, shift, onPress }: Props) {
  const { colors, typography, spacing, radius } = useTheme();
  const shiftStyle = shift ? getShiftStyle(shift.code, colors) : null;
  const muted = !cell.isCurrentMonth;

  return (
    <Pressable
      onPress={() => onPress(cell.iso)}
      accessibilityRole="button"
      accessibilityLabel={`${cell.dayNum}${shift ? `, ${shift.code}` : ''}`}
      style={({ pressed }) => ({
        flex: 1,
        height: CELL_HEIGHT,
        margin: 2,
        borderRadius: radius.sm,
        // Outer ring untuk hari ini — sage tegas.
        // Dashed border butuh borderWidth >= 2 di Android biar render
        // (bug lama RN — solid 1px OK, dashed 1px tidak muncul).
        borderWidth: cell.isToday ? 2 : shiftStyle?.borderDashed ? 2 : 1,
        borderStyle: shiftStyle?.borderDashed ? 'dashed' : 'solid',
        borderColor: cell.isToday
          ? colors.primary
          : shiftStyle?.border ?? (muted ? 'transparent' : colors.border),
        backgroundColor: shiftStyle?.bg ?? 'transparent',
        opacity: pressed ? 0.6 : muted ? 0.4 : 1,
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.xs,
        justifyContent: 'space-between',
      })}
    >
      <Text
        style={[
          typography.bodySM,
          {
            color: shiftStyle?.fg ?? (muted ? colors.textTertiary : colors.textPrimary),
            fontWeight: cell.isToday ? '500' : '400',
          },
        ]}
      >
        {cell.dayNum}
      </Text>
      {shift && (
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={[
              typography.monoMD,
              {
                color: shiftStyle?.fg ?? colors.textPrimary,
                fontSize: 10,
              },
            ]}
          >
            {shift.code === 'CUSTOM' ? 'K' : shift.code}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
