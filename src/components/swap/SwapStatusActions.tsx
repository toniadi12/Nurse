// Bagian action di detail swap, kondisional berdasarkan status.
// Memisah dari [id].tsx biar parent screen tetap di bawah 300 baris.

import { Pressable, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useTheme } from '@/context/theme';
import type { SwapRecord, SwapStatus } from '@/types/swap';

interface Props {
  swap: SwapRecord;
  onUpdateStatus: (status: SwapStatus) => void;
  onApplyAutoSwap: () => void;
}

export function SwapStatusActions({
  swap,
  onUpdateStatus,
  onApplyAutoSwap,
}: Props) {
  const { colors, typography, spacing, radius } = useTheme();

  if (swap.status === 'pending') {
    return (
      <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
        <Text
          style={[
            typography.bodySM,
            { color: colors.textSecondary, marginBottom: spacing.xs },
          ]}
        >
          Update status after your colleague replies:
        </Text>
        <Pressable
          onPress={() => onUpdateStatus('approved')}
          accessibilityRole="button"
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            paddingVertical: spacing.md,
            borderRadius: radius.sm,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: spacing.sm,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Check color={colors.textInverse} size={18} strokeWidth={2} />
          <Text style={[typography.labelMD, { color: colors.textInverse }]}>
            Colleague approved
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onUpdateStatus('rejected')}
          accessibilityRole="button"
          style={({ pressed }) => ({
            paddingVertical: spacing.md,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: spacing.sm,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <X color={colors.textSecondary} size={18} strokeWidth={2} />
          <Text style={[typography.labelMD, { color: colors.textSecondary }]}>
            Colleague declined
          </Text>
        </Pressable>
      </View>
    );
  }

  if (swap.status === 'approved' && !swap.applied) {
    return (
      <Pressable
        onPress={onApplyAutoSwap}
        accessibilityRole="button"
        style={({ pressed }) => ({
          marginTop: spacing.lg,
          backgroundColor: colors.primary,
          paddingVertical: spacing.lg,
          borderRadius: radius.sm,
          alignItems: 'center',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={[typography.labelMD, { color: colors.textInverse }]}>
          Apply swap to calendar
        </Text>
      </Pressable>
    );
  }

  if (swap.status === 'approved' && swap.applied) {
    return (
      <View
        style={{
          marginTop: spacing.lg,
          backgroundColor: colors.primarySoft,
          padding: spacing.lg,
          borderRadius: radius.lg,
          alignItems: 'center',
        }}
      >
        <Text style={[typography.labelMD, { color: colors.primary }]}>
          Applied to your calendar
        </Text>
      </View>
    );
  }

  // status === 'rejected' → no action button (cuma hapus di parent)
  return null;
}
