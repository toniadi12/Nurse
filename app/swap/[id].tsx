// Detail swap — status update + auto-apply ke calendar (PRD F8).
//
// Flow status:
//   pending → user tap "Disetujui"/"Ditolak" setelah balasan WA
//   approved + !applied → tombol "Tukar jadwal sekarang" muncul
//   approved + applied → info "Sudah diterapkan"
//   rejected → tidak ada action lanjut, cuma hapus
//
// Auto-swap (saat user tap "Tukar jadwal sekarang"):
//   1. Shift saya di date A → upsert jadi 'L' (saya jadi libur)
//   2. Kalau ada info colleagueShift → upsert shift baru di date B
//   3. mark swap.applied = true

import { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import { enGB as dateLocale } from 'date-fns/locale';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/context/theme';
import { useSwaps } from '@/context/swap';
import { useShifts } from '@/context/shifts';
import { SwapStatusBadge } from '@/components/swap/SwapStatusBadge';
import { SwapInfoCard } from '@/components/swap/SwapInfoCard';
import { SwapStatusActions } from '@/components/swap/SwapStatusActions';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { SHIFT_LABEL_ID } from '@/constants/shiftCodes';
import { createShift } from '@/lib/shiftFactory';
import { notifySwapApplied } from '@/lib/notifications';
import { buildAutoSwapPlan } from '@/lib/whatsapp';
import type { SwapStatus } from '@/types/swap';

// Label friendly untuk toast per status change.
const STATUS_TOAST_LABEL: Record<SwapStatus, string> = {
  pending: 'Marked as pending',
  approved: 'Swap approved',
  rejected: 'Swap declined',
};

export default function SwapDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, spacing, radius } = useTheme();
  const { state: swapState, updateSwapStatus, markSwapApplied, removeSwap } =
    useSwaps();
  const { upsertShift } = useShifts();
  const { showToast } = useToast();
  const [confirmApply, setConfirmApply] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (swapState.kind !== 'ready') {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={['top']}
      >
        <View style={{ padding: spacing['2xl'] }}>
          <Text style={[typography.bodyMD, { color: colors.textSecondary }]}>
            Loading…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const swap = swapState.swaps[id];
  if (!swap) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={['top']}
      >
        <View style={{ padding: spacing['2xl'] }}>
          <Text style={[typography.bodyMD, { color: colors.textSecondary }]}>
            Swap not found. It may have been deleted.
          </Text>
          <Pressable
            onPress={() => router.replace('/swap')}
            style={{ marginTop: spacing.lg }}
          >
            <Text style={[typography.labelMD, { color: colors.primary }]}>
              Back to list
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  function handleUpdateStatus(status: SwapStatus) {
    if (!swap) return;
    updateSwapStatus(swap.id, status);
    showToast(STATUS_TOAST_LABEL[status], status === 'rejected' ? 'error' : 'success');
  }

  function handleApplyAutoSwap() {
    if (!swap) return;
    setConfirmApply(true);
  }

  function applyPlan() {
    if (!swap) return;
    const plan = buildAutoSwapPlan({
      myShiftDate: swap.myShiftDate,
      ...(swap.colleagueShiftDate && swap.colleagueShiftCode
        ? {
            colleagueShiftDate: swap.colleagueShiftDate,
            colleagueShiftCode: swap.colleagueShiftCode,
          }
        : {}),
    });

    // Shift saya → Libur. Upsert pakai date sbg key — otomatis overwrite.
    upsertShift(
      createShift({ date: plan.myDateToLibur, code: 'L', source: 'manual' }),
    );

    if (plan.newShift) {
      upsertShift(
        createShift({
          date: plan.newShift.date,
          code: plan.newShift.code,
          source: 'manual',
        }),
      );
    }

    markSwapApplied(swap.id);

    // Two layers of feedback — in-app toast (immediate) + OS notification
    // (persists in tray even if user puts the app to background right after).
    // Toast fire-and-forget; OS notif requires permission already granted via
    // useShiftNotificationSync. Wrapped in try/catch so a notif failure never
    // breaks the swap flow itself.
    showToast('Calendar updated', 'success');
    notifySwapApplied({ swapId: swap.id, colleagueName: swap.colleagueName }).catch(
      (err) => console.warn('notifySwapApplied failed:', err),
    );
  }

  function handleDelete() {
    if (!swap) return;
    setConfirmDelete(true);
  }

  function executeDelete() {
    if (!swap) return;
    removeSwap(swap.id);
    setConfirmDelete(false);
    router.replace('/swap');
  }

  function executeApply() {
    setConfirmApply(false);
    applyPlan();
  }

  const myDateLabel = format(parseISO(swap.myShiftDate), 'EEEE, d MMMM yyyy', {
    locale: dateLocale,
  });
  const colleagueDateLabel = swap.colleagueShiftDate
    ? format(parseISO(swap.colleagueShiftDate), 'EEEE, d MMMM yyyy', {
        locale: dateLocale,
      })
    : null;
  const sentLabel = format(new Date(swap.sentAt), 'd MMM yyyy, HH:mm', {
    locale: dateLocale,
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: spacing.lg,
          gap: spacing.md,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Back"
        >
          <ArrowLeft color={colors.textPrimary} size={24} strokeWidth={1.5} />
        </Pressable>
        <Text style={[typography.displaySM, { color: colors.textPrimary }]}>
          Swap details
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing['2xl'] }}>
        <View style={{ marginBottom: spacing['2xl'] }}>
          <SwapStatusBadge status={swap.status} />
          <Text
            style={[
              typography.bodySM,
              { color: colors.textTertiary, marginTop: spacing.sm },
            ]}
          >
            Sent {sentLabel}
          </Text>
        </View>

        <SwapInfoCard
          label="Your shift to give up"
          title={SHIFT_LABEL_ID[swap.myShiftCode]}
          subtitle={myDateLabel}
        />

        {colleagueDateLabel && swap.colleagueShiftCode && (
          <SwapInfoCard
            label="Colleague's shift to take"
            title={SHIFT_LABEL_ID[swap.colleagueShiftCode]}
            subtitle={colleagueDateLabel}
          />
        )}

        <SwapInfoCard
          label="Colleague"
          title={swap.colleagueName}
          subtitle={swap.colleaguePhone}
          titleVariant="body"
        />

        <SwapStatusActions
          swap={swap}
          onUpdateStatus={handleUpdateStatus}
          onApplyAutoSwap={handleApplyAutoSwap}
        />

        <Pressable
          onPress={handleDelete}
          accessibilityRole="button"
          style={({ pressed }) => ({
            marginTop: spacing['3xl'],
            paddingVertical: spacing.md,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: colors.danger,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: spacing.sm,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Trash2 color={colors.danger} size={16} strokeWidth={1.5} />
          <Text style={[typography.labelMD, { color: colors.danger }]}>
            Delete this swap
          </Text>
        </Pressable>
      </ScrollView>

      <ConfirmDialog
        visible={confirmApply}
        title="Swap shifts now?"
        body={
          'Your shift on this date will be changed to Off' +
          (swap.colleagueShiftDate
            ? ", and the colleague's shift will be added to your calendar."
            : '.')
        }
        confirmLabel="Swap"
        cancelLabel="Cancel"
        onCancel={() => setConfirmApply(false)}
        onConfirm={executeApply}
      />

      <ConfirmDialog
        visible={confirmDelete}
        title="Delete this swap?"
        body="The record will be removed. Your calendar isn't affected."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={executeDelete}
      />
    </SafeAreaView>
  );
}
