// Item riwayat tukar di Tab 3.
// Tap → router.push('/swap/[id]') untuk detail.

import { Pressable, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { enGB as dateLocale } from 'date-fns/locale';
import { ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/context/theme';
import { SHIFT_LABEL_ID } from '@/constants/shiftCodes';
import type { SwapRecord } from '@/types/swap';
import { SwapStatusBadge } from './SwapStatusBadge';

interface Props {
  swap: SwapRecord;
  onPress: () => void;
}

export function SwapListItem({ swap, onPress }: Props) {
  const { colors, typography, spacing, radius } = useTheme();
  const myDateLabel = format(parseISO(swap.myShiftDate), 'd MMM yyyy', {
    locale: dateLocale,
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Swap details with ${swap.colleagueName}`}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: spacing.sm,
        }}
      >
        <Text
          style={[
            typography.labelSM,
            { color: colors.primaryMuted, marginBottom: spacing.xs },
          ]}
        >
          {myDateLabel}
        </Text>
        <SwapStatusBadge status={swap.status} />
      </View>

      <Text
        style={[
          typography.bodyLG,
          { color: colors.textPrimary, marginBottom: spacing.xs },
        ]}
      >
        Swap with {swap.colleagueName}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
        }}
      >
        <Text style={[typography.bodySM, { color: colors.textSecondary }]}>
          {SHIFT_LABEL_ID[swap.myShiftCode]} (you)
        </Text>
        <ArrowRight color={colors.textTertiary} size={14} strokeWidth={1.5} />
        <Text style={[typography.bodySM, { color: colors.textSecondary }]}>
          {swap.colleagueShiftCode
            ? SHIFT_LABEL_ID[swap.colleagueShiftCode]
            : 'not set'}{' '}
          (colleague)
        </Text>
      </View>
    </Pressable>
  );
}
