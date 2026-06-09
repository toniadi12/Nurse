// Hero card di Beranda untuk shift hari ini (PRD F5).
//
// Dua state:
//   - Ada shift produktif (P/S/M/CUSTOM): kartu sage dengan jenis + jam +
//     ruangan + countdown
//   - Libur/Cuti (L/C): kartu lembut "Kamu libur hari ini" yang positif
//
// Tidak handle "tidak ada data sama sekali" — itu tugas parent (home.tsx)
// yang render EmptyState terpisah.

import { Text, View } from 'react-native';
import { Clock, MapPin } from 'lucide-react-native';
import { useTheme } from '@/context/theme';
import type { Shift } from '@/types/shift';
import { SHIFT_LABEL_ID } from '@/constants/shiftCodes';
import { getCountdownText } from '@/lib/shiftStyling';

interface Props {
  shift: Shift;
}

const ICON_SIZE = 16;
const ICON_STROKE = 1.5;

export function TodayHeroCard({ shift }: Props) {
  const { colors, typography, spacing, radius } = useTheme();
  const isOffDay = shift.code === 'L' || shift.code === 'C';

  if (isOffDay) {
    return (
      <View
        style={{
          backgroundColor: colors.primarySoft,
          borderRadius: radius.xl,
          padding: spacing['2xl'],
          marginBottom: spacing.lg,
        }}
      >
        <Text
          style={[
            typography.labelSM,
            { color: colors.primaryMuted, marginBottom: spacing.xs },
          ]}
        >
          Today
        </Text>
        <Text
          style={[
            typography.displayMD,
            { color: colors.textPrimary, marginBottom: spacing.sm },
          ]}
        >
          You're off today
        </Text>
        <Text style={[typography.bodyMD, { color: colors.textSecondary }]}>
          {shift.code === 'C'
            ? 'Leave day — enjoy it.'
            : 'Get some proper rest.'}
        </Text>
      </View>
    );
  }

  // Shift produktif — kartu sage dengan info shift.
  const countdown =
    shift.startTime != null ? getCountdownText(shift.startTime) : null;

  return (
    <View
      style={{
        backgroundColor: colors.primary,
        borderRadius: radius.xl,
        padding: spacing['2xl'],
        marginBottom: spacing.lg,
      }}
    >
      <Text
        style={[
          typography.labelSM,
          { color: colors.primarySoft, marginBottom: spacing.xs },
        ]}
      >
        Today's shift
      </Text>
      <Text
        style={[
          typography.displayLG,
          { color: colors.textInverse, marginBottom: spacing.md },
        ]}
      >
        {SHIFT_LABEL_ID[shift.code]}
      </Text>

      {shift.startTime && shift.endTime && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginBottom: spacing.xs,
          }}
        >
          <Clock
            color={colors.textInverse}
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
          />
          <Text
            style={[
              typography.bodyMD,
              { color: colors.textInverse, opacity: 0.9 },
            ]}
          >
            {shift.startTime} – {shift.endTime}
          </Text>
        </View>
      )}

      {shift.ward && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginBottom: countdown ? spacing.lg : 0,
          }}
        >
          <MapPin
            color={colors.textInverse}
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
          />
          <Text
            style={[
              typography.bodyMD,
              { color: colors.textInverse, opacity: 0.9 },
            ]}
          >
            {shift.ward}
          </Text>
        </View>
      )}

      {countdown && (
        <View
          style={{
            marginTop: spacing.lg,
            paddingTop: spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.primarySoft,
            opacity: 0.85,
          }}
        >
          <Text
            style={[
              typography.labelSM,
              { color: colors.primarySoft, marginBottom: 2 },
            ]}
          >
            Starts in
          </Text>
          <Text style={[typography.bodyLG, { color: colors.textInverse }]}>
            {countdown}
          </Text>
        </View>
      )}
    </View>
  );
}
