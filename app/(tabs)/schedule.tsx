// Tab 2 — Jadwal (PRD F6 kalender bulanan).
//
// Layout: MonthHeader + CalendarGrid + MonthStats + FAB.
// State: viewMonth (Date) untuk navigasi. Tambah shift → navigate ke
// route /shift/new (full screen, keyboard-safe). Tap cell kalender
// prefill tanggal via query param ?date=.

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/context/theme';
import { useShifts } from '@/context/shifts';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { MonthHeader } from '@/components/calendar/MonthHeader';
import { MonthStats } from '@/components/calendar/MonthStats';
import { generateMonthGrid, shiftMonth } from '@/lib/calendarGrid';
import { getMonthStats } from '@/lib/shiftStats';
import {
  FLOATING_TAB_BAR_BOTTOM_GAP,
  FLOATING_TAB_BAR_VISIBLE_HEIGHT,
} from '@/components/navigation/FloatingTabBar';

const FAB_SIZE = 56;
// FAB harus lebih tinggi dari floating nav — kasih jarak 16pt antara.
const FAB_GAP_ABOVE_NAV = 16;

export default function ScheduleTab() {
  const { colors, spacing, radius, shadow } = useTheme();
  const { state } = useShifts();
  const insets = useSafeAreaInsets();
  const fabBottom =
    insets.bottom +
    FLOATING_TAB_BAR_BOTTOM_GAP +
    FLOATING_TAB_BAR_VISIBLE_HEIGHT +
    FAB_GAP_ABOVE_NAV;
  const [viewMonth, setViewMonth] = useState(() => new Date());

  const shifts = state.kind === 'ready' ? state.shifts : {};
  const cells = useMemo(() => generateMonthGrid(viewMonth), [viewMonth]);
  const stats = useMemo(() => getMonthStats(shifts, viewMonth), [shifts, viewMonth]);

  function handleCellPress(iso: string) {
    router.push(`/shift/new?date=${iso}`);
  }

  function handleFabPress() {
    router.push('/shift/new'); // default ke hari ini
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={{
          padding: spacing['2xl'],
          // FAB + floating nav clearance.
          paddingBottom: fabBottom + FAB_SIZE + spacing.lg,
        }}
      >
        <MonthHeader
          monthDate={viewMonth}
          onPrev={() => setViewMonth((m) => shiftMonth(m, -1))}
          onNext={() => setViewMonth((m) => shiftMonth(m, 1))}
        />

        <CalendarGrid
          cells={cells}
          shifts={shifts}
          onCellPress={handleCellPress}
        />

        <MonthStats stats={stats} />
      </ScrollView>

      <View
        collapsable={false}
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          right: spacing.xl,
          bottom: fabBottom,
          zIndex: 999,
          elevation: 12,
        }}
      >
        <Pressable
          onPress={handleFabPress}
          hitSlop={16}
          accessibilityLabel="Add shift"
          accessibilityRole="button"
          style={({ pressed }) => ({
            width: FAB_SIZE,
            height: FAB_SIZE,
            borderRadius: radius.full,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
            ...shadow.md,
          })}
        >
          <Plus color={colors.textInverse} size={28} strokeWidth={2} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
