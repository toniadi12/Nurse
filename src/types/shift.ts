// Data model untuk shift jadwal jaga.
// Disimpan di ShiftContext + persist ke AsyncStorage.

// Kode shift sesuai PRD section 5 F3.
// - P/S/M = shift produktif (Pagi/Siang/Malam)
// - L = Libur (off day, default tanpa jam)
// - C = Cuti (cuti tahunan / izin, default tanpa jam)
// - CUSTOM = jam custom yang di-input user manual
export type ShiftCode = 'P' | 'S' | 'M' | 'L' | 'C' | 'CUSTOM';

// Sumber data shift — untuk track audit & deciding behavior re-import Excel.
// 'excel' = parsed dari file Excel. Kalau user re-import file baru, data
// 'excel' bisa di-overwrite. Data 'manual' biasanya dipertahankan kecuali
// user pilih "replace semua".
export type ShiftSource = 'excel' | 'manual';

export interface Shift {
  id: string; // uuid v4 — generate via crypto.randomUUID() di RN 0.81+
  date: string; // ISO date "YYYY-MM-DD" — JANGAN pakai full timestamp (timezone bug)
  code: ShiftCode;
  // Jam — opsional karena L/C tidak punya jam, dan P/S/M pakai default kalau
  // tidak di-set. Format "HH:MM" (24-jam). Wajib di-set kalau code === 'CUSTOM'.
  startTime?: string;
  endTime?: string;
  ward?: string; // ruangan (mis. "IGD", "ICU", "Bangsal Mawar")
  note?: string; // catatan bebas user
  source: ShiftSource;
  createdAt: number; // Date.now() — untuk sorting & audit
  updatedAt: number;
  // V2 multi-user: tambah `userId: string` (FK ke users.id di backend).
  // V2 ward manager view: `wardId?: string` untuk filter shift per ward.
}
