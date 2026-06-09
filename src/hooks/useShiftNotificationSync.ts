// Hook side-effect — sync semua shifts ke OS scheduled notifications.
//
// Strategi: setiap kali shifts atau notificationOffset berubah, cancel all
// + schedule all yg masih future. Simple, idempotent, oke untuk skala
// <100 shift. Diff-based bisa ganti kalau performa jadi issue.
//
// Permission request: hanya sekali per session (ref guard) saat sync pertama.
// Kalau user denial, sync tetap jalan tapi schedule no-op (OS abaikan).

import { useEffect, useRef } from 'react';
import { useProfile } from '@/context/profile';
import { useShifts } from '@/context/shifts';
import {
  cancelAllShiftReminders,
  requestNotificationPermission,
  scheduleShiftReminder,
} from '@/lib/notifications';

export function useShiftNotificationSync() {
  const { state: shiftState } = useShifts();
  const { state: profileState } = useProfile();
  const permissionRequested = useRef(false);

  useEffect(() => {
    // Skip kalau salah satu context masih loading.
    if (shiftState.kind !== 'ready') return;
    if (profileState.kind !== 'ready') return;

    const { shifts } = shiftState;
    const { notificationOffset } = profileState.profile;

    async function sync() {
      // Request permission sekali per session. Kalau user denied, OS
      // remember — request berikutnya no-op (canAskAgain false).
      if (!permissionRequested.current) {
        permissionRequested.current = true;
        await requestNotificationPermission();
      }

      // Cancel all + reschedule. Skedul-fn handle "sudah lewat" sendiri.
      await cancelAllShiftReminders();
      const allShifts = Object.values(shifts);
      await Promise.all(
        allShifts.map((shift) =>
          scheduleShiftReminder(shift, notificationOffset),
        ),
      );
    }

    // Fire-and-forget — sync async tapi tidak block render.
    sync().catch((err) => {
      console.warn('useShiftNotificationSync failed:', err);
    });
  }, [shiftState, profileState]);
}
