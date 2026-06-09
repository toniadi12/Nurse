// Card statistik bulan — total shift, total jam, jumlah malam.
// 3 item horizontal, masing-masing punya angka besar (serif) + label kecil.

import { Text, View } from 'react-native';
import { useTheme } from '@/context/theme';
import type { MonthStats as Stats } from '@/lib/shiftStats';

interface Props {
  stats: Stats;
}

export function MonthStats({ stats }: Props) {
  const { colors, typography, spacing, radius } = useTheme();

  // Format jam — pakai 1 desimal kalau ada pecahan, integer kalau bulat.
  const hoursLabel =
    stats.totalHours % 1 === 0
      ? String(stats.totalHours)
      : stats.totalHours.toFixed(1);

  const items: Array<{ value: string; label: string }> = [
    { value: String(stats.totalShifts), label: 'shift' },
    { value: hoursLabel, label: 'jam' },
    { value: String(stats.nightCount), label: 'malam' },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        marginTop: spacing.lg,
      }}
    >
      {items.map((item, i) => (
        <View
          key={item.label}
          style={{
            flex: 1,
            alignItems: 'center',
            borderLeftWidth: i > 0 ? 1 : 0,
            borderLeftColor: colors.border,
          }}
        >
          <Text style={[typography.displayMD, { color: colors.textPrimary }]}>
            {item.value}
          </Text>
          <Text
            style={[
              typography.labelSM,
              { color: colors.textTertiary, marginTop: spacing.xs },
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
