// Badge kecil untuk status tukar — pending/disetujui/ditolak.
// Dipakai di list & detail screen.

import { Text, View } from 'react-native';
import { useTheme } from '@/context/theme';
import type { SwapStatus } from '@/types/swap';

interface Props {
  status: SwapStatus;
}

const STATUS_LABEL: Record<SwapStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Declined',
};

export function SwapStatusBadge({ status }: Props) {
  const { colors, typography, spacing, radius } = useTheme();

  // Mapping warna sesuai status — pakai tone yang sudah ada di theme.
  // Pending = warning amber, approved = sage success, rejected = muted brick.
  const styles = (() => {
    switch (status) {
      case 'pending':
        return { bg: colors.accentSoft, fg: colors.accentDark };
      case 'approved':
        return { bg: colors.primarySoft, fg: colors.primary };
      case 'rejected':
        return { bg: colors.surface, fg: colors.danger };
    }
  })();

  return (
    <View
      style={{
        backgroundColor: styles.bg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        alignSelf: 'flex-start',
        borderWidth: status === 'rejected' ? 1 : 0,
        borderColor: status === 'rejected' ? colors.danger : 'transparent',
      }}
    >
      <Text style={[typography.labelSM, { color: styles.fg }]}>
        {STATUS_LABEL[status]}
      </Text>
    </View>
  );
}
