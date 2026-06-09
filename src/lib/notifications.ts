// Wrapper for expo-notifications — schedule local reminder before shift starts.
// PRD F7: 30/60/120 minutes before shift, contextual message per shift code.
//
// MVP limitations:
//   - Sync strategy = cancelAll + reschedule all future shifts. Simple,
//     idempotent, fine for <100 shifts. Could switch to diff-based later.
//   - Permission requested on first sync (via useShiftNotificationSync).
//   - No per-shift-type toggle off (deferred to F10 Settings).

import * as Notifications from 'expo-notifications';
import { parseISO } from 'date-fns';
import type { Shift, ShiftCode } from '@/types/shift';
import type { NotificationOffset } from '@/types/profile';

// Set up global handler — safe at module top level. Required by
// expo-notifications so notifications show while app is in foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIF_ID_PREFIX = 'shift-';
const SWAP_NOTIF_ID_PREFIX = 'swap-';

// === Permission ===

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  // Only ask if not permanently denied. If permanent, request is a no-op —
  // user must enable manually in OS settings.
  if (settings.status === 'denied' && !settings.canAskAgain) {
    return false;
  }
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

// === Scheduling ===

export async function scheduleShiftReminder(
  shift: Shift,
  offsetMinutes: NotificationOffset,
): Promise<void> {
  // Off / Leave have no start time — no reminder needed.
  if (!shift.startTime) return;

  const triggerDate = computeTriggerDate(shift.date, shift.startTime, offsetMinutes);
  if (triggerDate == null) return; // already past, skip

  await Notifications.scheduleNotificationAsync({
    identifier: `${NOTIF_ID_PREFIX}${shift.id}`,
    content: {
      title: getReminderTitle(shift.code, offsetMinutes),
      body: getReminderBody(shift.code, shift.startTime),
      data: { shiftId: shift.id, type: 'reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

export async function cancelShiftReminder(shiftId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    `${NOTIF_ID_PREFIX}${shiftId}`,
  );
}

export async function cancelAllShiftReminders(): Promise<void> {
  // Cancels SHIFT reminders only — by identifier prefix. Sebelumnya pakai
  // cancelAllScheduledNotificationsAsync() yang nuke semua notif, termasuk
  // swap-applied yang baru saja di-fire dari notifySwapApplied(). Race
  // condition di sync hook setelah swap → swap notif ke-cancel sebelum
  // sempat di-deliver. Filter by prefix supaya cuma shift-* yang ke-cancel.
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(NOTIF_ID_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

// === Swap event notification ===
//
// Fires segera (trigger=null = immediate) ketika user apply swap di [id].tsx.
// Tujuan: konfirmasi di OS tray supaya user lihat walau app di-background,
// dan supaya tetap ada record di notification history kalau toast in-app
// kelewat (lihat Toast.tsx — 2.5 detik lalu menghilang).
export async function notifySwapApplied(params: {
  swapId: string;
  colleagueName: string;
}): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: `${SWAP_NOTIF_ID_PREFIX}${params.swapId}`,
    content: {
      title: 'Swap applied',
      body: `Your calendar has been updated for the swap with ${params.colleagueName}.`,
      data: { swapId: params.swapId, type: 'swap-applied' },
    },
    // null trigger = fire immediately
    trigger: null,
  });
}

// === Internal helpers ===

function computeTriggerDate(
  dateISO: string,
  startTimeHHMM: string,
  offsetMinutes: number,
): Date | null {
  const shiftStart = parseISO(dateISO);
  const parts = startTimeHHMM.split(':');
  const h = parseInt(parts[0] ?? '', 10);
  const m = parseInt(parts[1] ?? '', 10);
  if (isNaN(h) || isNaN(m)) return null;
  shiftStart.setHours(h, m, 0, 0);
  const triggerMs = shiftStart.getTime() - offsetMinutes * 60_000;
  const trigger = new Date(triggerMs);
  if (trigger <= new Date()) return null; // already past
  return trigger;
}

function formatOffsetText(minutes: NotificationOffset): string {
  if (minutes === 30) return '30 minutes';
  if (minutes === 60) return '1 hour';
  return '2 hours';
}

function getReminderTitle(code: ShiftCode, offset: NotificationOffset): string {
  const offsetText = formatOffsetText(offset);
  switch (code) {
    case 'P':
      return `Morning shift in ${offsetText}`;
    case 'S':
      return `Afternoon shift in ${offsetText}`;
    case 'M':
      return `Night shift in ${offsetText}`;
    case 'CUSTOM':
      return `Shift in ${offsetText}`;
    default:
      // L/C shouldn't reach here (filtered in scheduleShiftReminder),
      // but defensive fallback.
      return 'Shift reminder';
  }
}

function getReminderBody(code: ShiftCode, startTime: string): string {
  switch (code) {
    case 'P':
      return 'Time for breakfast.';
    case 'S':
      return `Starts at ${startTime}. Get ready.`;
    case 'M':
      return 'Got your coffee?';
    case 'CUSTOM':
      return `Starts at ${startTime}.`;
    default:
      return '';
  }
}
