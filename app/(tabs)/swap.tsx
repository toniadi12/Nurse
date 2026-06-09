// Tab 3 — Tukar (PRD F8 wa-based shift swap).
//
// Layout: header + list riwayat tukar + FAB "+" → /swap/new.
// Empty state ramah kalau belum ada tukar.

import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, ArrowLeftRight } from 'lucide-react-native';
import { useTheme } from '@/context/theme';
import { useSwaps } from '@/context/swap';
import { SwapListItem } from '@/components/swap/SwapListItem';
import {
  FLOATING_TAB_BAR_BOTTOM_GAP,
  FLOATING_TAB_BAR_VISIBLE_HEIGHT,
} from '@/components/navigation/FloatingTabBar';

const FAB_SIZE = 56;
// FAB harus lebih tinggi dari floating nav — kasih jarak 16pt antara.
const FAB_GAP_ABOVE_NAV = 16;

export default function SwapTab() {
  const { colors, spacing, typography, radius, shadow } = useTheme();
  const { state } = useSwaps();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fabBottom =
    insets.bottom +
    FLOATING_TAB_BAR_BOTTOM_GAP +
    FLOATING_TAB_BAR_VISIBLE_HEIGHT +
    FAB_GAP_ABOVE_NAV;

  // Sort terbaru dulu (descending by sentAt).
  const sortedSwaps = useMemo(() => {
    if (state.kind !== 'ready') return [];
    return Object.values(state.swaps).sort((a, b) => b.sentAt - a.sentAt);
  }, [state]);

  function handleNewPress() {
    router.push('/swap/new');
  }

  function handleItemPress(id: string) {
    router.push(`/swap/${id}`);
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
        <Text
          style={[
            typography.labelSM,
            { color: colors.primaryMuted, marginBottom: spacing.xs },
          ]}
        >
          Swap history
        </Text>
        <Text
          style={[
            typography.displayLG,
            { color: colors.textPrimary, marginBottom: spacing['2xl'] },
          ]}
        >
          Swap
        </Text>

        {sortedSwaps.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.primarySoft,
              borderRadius: radius.xl,
              padding: spacing['2xl'],
              alignItems: 'center',
            }}
          >
            <ArrowLeftRight
              color={colors.primary}
              size={32}
              strokeWidth={1.5}
            />
            <Text
              style={[
                typography.bodyLG,
                {
                  color: colors.textPrimary,
                  marginTop: spacing.md,
                  marginBottom: spacing.sm,
                  textAlign: 'center',
                },
              ]}
            >
              No swaps yet
            </Text>
            <Text
              style={[
                typography.bodyMD,
                { color: colors.textSecondary, textAlign: 'center' },
              ]}
            >
              Tap the + button to message a colleague on WhatsApp.
            </Text>
          </View>
        ) : (
          sortedSwaps.map((swap) => (
            <SwapListItem
              key={swap.id}
              swap={swap}
              onPress={() => handleItemPress(swap.id)}
            />
          ))
        )}
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
          onPress={handleNewPress}
          hitSlop={16}
          accessibilityLabel="New swap"
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
