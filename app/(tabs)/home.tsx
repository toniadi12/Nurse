// Tab 1 — Beranda (PRD F5).
//
// Struktur:
//   - Greeting time-based ("Selamat pagi, Sus Rina.") + tanggal hari ini
//   - TodayHeroCard (shift hari ini) atau empty state card
//   - WeekStrip 7 hari ke depan dengan color coding
//
// Live countdown defer ke polish phase — sekarang computed once on mount.

import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { enGB as dateLocale } from 'date-fns/locale';
import { useTheme } from '@/context/theme';
import { useProfile } from '@/context/profile';
import { useShifts } from '@/context/shifts';
import { TodayHeroCard } from '@/components/shift/TodayHeroCard';
import { WeekStrip } from '@/components/shift/WeekStrip';
import { getTimeBasedGreeting } from '@/lib/greeting';
import {
  FLOATING_TAB_BAR_BOTTOM_GAP,
  FLOATING_TAB_BAR_VISIBLE_HEIGHT,
} from '@/components/navigation/FloatingTabBar';

export default function HomeTab() {
  const { colors, typography, spacing, radius } = useTheme();
  const { state: profileState } = useProfile();
  const { state: shiftState } = useShifts();
  const insets = useSafeAreaInsets();
  const scrollBottomPad =
    insets.bottom +
    FLOATING_TAB_BAR_BOTTOM_GAP +
    FLOATING_TAB_BAR_VISIBLE_HEIGHT +
    spacing['2xl'];

  const nurseName =
    profileState.kind === 'ready' ? profileState.profile.nurseName : '';
  const greeting = getTimeBasedGreeting();
  const todayDateLong = format(new Date(), 'EEEE, d MMMM yyyy', {
    locale: dateLocale,
  });
  const todayISO = format(new Date(), 'yyyy-MM-dd');

  const shifts = shiftState.kind === 'ready' ? shiftState.shifts : {};
  const todayShift = shifts[todayISO];
  const totalShifts = Object.keys(shifts).length;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing['2xl'],
          paddingBottom: scrollBottomPad,
        }}
      >
        <View
          style={{
            paddingHorizontal: spacing['2xl'],
            marginBottom: spacing['2xl'],
          }}
        >
          <Text
            style={[
              typography.labelSM,
              { color: colors.primaryMuted, marginBottom: spacing.xs },
            ]}
          >
            {todayDateLong}
          </Text>
          <Text
            style={[typography.displayMD, { color: colors.textPrimary }]}
          >
            {greeting}
            {nurseName ? `, ${nurseName}` : ''}.
          </Text>
        </View>

        <View style={{ paddingHorizontal: spacing['2xl'] }}>
          {todayShift ? (
            <TodayHeroCard shift={todayShift} />
          ) : (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                borderWidth: 1,
                borderColor: colors.border,
                borderStyle: 'dashed',
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
                  typography.displaySM,
                  { color: colors.textPrimary, marginBottom: spacing.sm },
                ]}
              >
                {totalShifts === 0
                  ? 'No shifts yet'
                  : 'No shift today'}
              </Text>
              <Text
                style={[typography.bodyMD, { color: colors.textSecondary }]}
              >
                {totalShifts === 0
                  ? 'Add a shift in the Schedule tab or import from Excel.'
                  : 'Enjoy your day off.'}
              </Text>
            </View>
          )}
        </View>

        <WeekStrip shifts={shifts} />

        {totalShifts > 0 && (
          <Text
            style={[
              typography.bodySM,
              {
                color: colors.textTertiary,
                paddingHorizontal: spacing['2xl'],
                marginTop: spacing.md,
              },
            ]}
          >
            {totalShifts === 1 ? '1 shift' : `${totalShifts} shifts`} saved
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
