// Grid kalender 7 kolom × 6 baris = 42 cell (PRD F6).
//
// Header row: Sen/Sel/Rab/Kam/Jum/Sab/Min (mengikuti Indonesia & DESIGN.md).
// Body: 6 baris masing-masing 7 cell, di-render dari `generateMonthGrid()`.

import { Text, View } from 'react-native';
import { useTheme } from '@/context/theme';
import { CalendarCell } from './CalendarCell';
import type { CalendarCell as CellData } from '@/lib/calendarGrid';
import type { ShiftMap } from '@/context/shifts';

interface Props {
  cells: CellData[];
  shifts: ShiftMap;
  onCellPress: (iso: string) => void;
}

const WEEKDAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const COLS_PER_ROW = 7;
const ROWS = 6;

export function CalendarGrid({ cells, shifts, onCellPress }: Props) {
  const { colors, typography, spacing } = useTheme();

  // Pecah 42 cell jadi 6 baris × 7 cell untuk render per row.
  const rows: CellData[][] = [];
  for (let r = 0; r < ROWS; r++) {
    rows.push(cells.slice(r * COLS_PER_ROW, (r + 1) * COLS_PER_ROW));
  }

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: spacing.xs,
          marginBottom: spacing.xs,
        }}
      >
        {WEEKDAY_LABELS.map((label) => (
          <Text
            key={label}
            style={[
              typography.labelSM,
              {
                flex: 1,
                color: colors.textTertiary,
                textAlign: 'center',
              },
            ]}
          >
            {label}
          </Text>
        ))}
      </View>

      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={{ flexDirection: 'row' }}>
          {row.map((cell) => (
            <CalendarCell
              key={cell.iso}
              cell={cell}
              shift={shifts[cell.iso]}
              onPress={onCellPress}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
