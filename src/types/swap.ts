// Data model untuk pencatatan tukar shift (PRD F8).
//
// KENAPA snapshot data shift (date+code) di dalam SwapRecord, bukan referensi
// by Shift.id?
//   1. Shift bisa dihapus/diubah user setelah swap dikirim — kalau by-ref,
//      riwayat tukar bisa "broken" (shift hilang). Snapshot bikin riwayat
//      self-contained.
//   2. Field `colleagueShift*` memang bukan shift di calendar kita (Jaga
//      = single-user, kolega tidak ada di data) — cuma info yang user input.
//
// Tracking status (pending → approved/rejected) di-update manual oleh user
// setelah dapat balasan WA. Tidak ada integrasi automatic (di luar scope MVP).

import type { ShiftCode } from './shift';

export type SwapStatus = 'pending' | 'approved' | 'rejected';

export interface SwapRecord {
  id: string;
  // Shift saya yang mau dilepas (snapshot saat send time).
  myShiftDate: string; // ISO "YYYY-MM-DD"
  myShiftCode: ShiftCode;
  // Shift kolega yang mau diambil (opsional — kalau belum tau).
  colleagueShiftDate?: string;
  colleagueShiftCode?: ShiftCode;
  // Info kolega — disimpan supaya next time bisa di-suggest auto-fill.
  colleagueName: string;
  colleaguePhone: string; // raw user input (mis. "07123456789" atau "+44...")
  // Status & audit.
  status: SwapStatus;
  messageSent: string; // pesan template yang dibuka di WA
  sentAt: number; // Date.now()
  resolvedAt?: number; // di-set saat user tap "Disetujui"/"Ditolak"
  // Flag untuk track "udah di-apply swap-nya ke calendar belum".
  // Kalau status=approved tapi flag false → tampilkan tombol "Tukar jadwal sekarang".
  applied?: boolean;
}
