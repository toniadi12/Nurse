// Helper untuk integrasi WhatsApp — generate template pesan tukar shift +
// buka deep link wa.me. PRD F8 wajib pesan dalam Bahasa Indonesia sopan.
//
// KENAPA wa.me bukan whatsapp:// scheme?
//   - wa.me/<phone>?text=<encoded> jalan baik di browser & WA app
//   - Kalau WA tidak terinstall, browser handle gracefully (tidak crash)
//   - whatsapp:// scheme bisa gagal silent kalau app tidak ada
//
// Phone normalization: WA wa.me butuh format internasional TANPA '+'.
// UK mobile: 07xxx xxx xxx atau +44 7xxx xxx xxx → semua jadi 447xxxxxxxxx.

import { format, parseISO } from 'date-fns';
import { enGB as enLocale } from 'date-fns/locale';
import type { Shift, ShiftCode } from '@/types/shift';
import { SHIFT_LABEL_ID } from '@/constants/shiftCodes';

// === Phone normalization ===

// Normalise UK mobile number to wa.me format (447xxxxxxxxx).
// Accepts: "07123456789", "+447123456789", "447123456789",
// "07123 456 789", "+44 7123 456789" — all valid.
// Returns null if format unrecognised (digits < 10 or odd prefix).
//
// UK mobile numbers always start with 7 after country code 44.
// Deployment target: UK NHS nurses + international hospitals worldwide.
export function normalizePhoneForWhatsApp(raw: string): string | null {
  // Strip semua non-digit (spasi, tanda kurung, dash, plus).
  const digitsOnly = raw.replace(/\D/g, '');
  if (digitsOnly.length < 10) return null;

  // Kalau mulai dari 0 (format lokal UK: 07xxx), ganti jadi 44.
  if (digitsOnly.startsWith('0')) {
    return '44' + digitsOnly.slice(1);
  }
  // Kalau sudah 44 di depan, biarkan apa adanya.
  if (digitsOnly.startsWith('44')) {
    return digitsOnly;
  }
  // Kalau langsung 7 di depan (user input singkat 7xxx tanpa 0/44), tambah 44.
  if (digitsOnly.startsWith('7')) {
    return '44' + digitsOnly;
  }
  // Format tidak dikenali — return null biar caller tampilkan error.
  return null;
}

// === Template pesan ===

interface BuildMessageParams {
  myName: string; // nama user (dari profile)
  colleagueName: string;
  myShiftDate: string; // ISO
  myShiftCode: ShiftCode;
  // Opsional — kalau user belum tau jadwal kolega, skip baris ini.
  colleagueShiftDate?: string;
  colleagueShiftCode?: ShiftCode;
}

// Generate WhatsApp message template in friendly UK English.
// Per DESIGN.md section 11: warm but professional, short, no corporate stiffness.
export function buildSwapMessage(params: BuildMessageParams): string {
  const {
    myName,
    colleagueName,
    myShiftDate,
    myShiftCode,
    colleagueShiftDate,
    colleagueShiftCode,
  } = params;

  const lines: string[] = [];
  lines.push(`Hi ${colleagueName},`);
  lines.push('');
  lines.push('Would you mind swapping shifts with me?');
  lines.push('');
  lines.push(
    `I'm scheduled for ${SHIFT_LABEL_ID[myShiftCode]} (${formatShiftCode(myShiftCode)}) ` +
      `on ${formatDateNatural(myShiftDate)}.`,
  );

  // If user filled colleague's shift info, add "I'd like to take" line.
  if (colleagueShiftDate && colleagueShiftCode) {
    lines.push(
      `If possible, I'd like to take your ${SHIFT_LABEL_ID[colleagueShiftCode]} shift ` +
        `on ${formatDateNatural(colleagueShiftDate)}.`,
    );
  }

  lines.push('');
  lines.push("Let me know if it works for you — I'll confirm with the ward manager.");
  lines.push('');
  lines.push('Thanks ever so much,');
  lines.push(myName);

  return lines.join('\n');
}

// === Deep link ===

// Build URL wa.me yang bisa dibuka pakai Linking.openURL().
// Hanya panggil ini kalau normalizePhoneForWhatsApp() return non-null.
export function buildWhatsAppLink(
  normalizedPhone: string,
  message: string,
): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encoded}`;
}

// === Helper internal ===

function formatDateNatural(dateISO: string): string {
  // Output: "Monday, 28 May 2026" — UK locale.
  return format(parseISO(dateISO), 'EEEE, d MMMM yyyy', { locale: enLocale });
}

function formatShiftCode(code: ShiftCode): string {
  // Compact display for WA message: "07:00–15:00" with shift code.
  // Only productive shifts have time. L/Off, C/Leave, CUSTOM show label only.
  switch (code) {
    case 'P':
      return '07:00–15:00';
    case 'S':
      return '15:00–23:00';
    case 'M':
      return '23:00–07:00';
    default:
      return code;
  }
}

// === Auto-swap helper ===
//
// Dipanggil saat user tap "Tukar jadwal sekarang" di detail swap yang
// statusnya approved. Logika sederhana:
//   - Shift saya di date A → ubah jadi 'L' (saya jadi libur, kolega yang kerja)
//   - Kalau ada info shift kolega di date B → tambah shift baru ke calendar
//     dengan code colleague (saya akan kerja di hari itu menggantikan kolega)
//
// Caller (detail screen) yang invoke upsertShift/removeShift dari ShiftContext.
// Function ini cuma menentukan APA yang harus di-update.

export interface AutoSwapPlan {
  // Shift saya yang harus diganti jadi Libur.
  myDateToLibur: string;
  // Shift baru yang harus dibuat — kalau user input info kolega.
  newShift?: {
    date: string;
    code: ShiftCode;
  };
}

export function buildAutoSwapPlan(params: {
  myShiftDate: string;
  colleagueShiftDate?: string;
  colleagueShiftCode?: ShiftCode;
}): AutoSwapPlan {
  const plan: AutoSwapPlan = {
    myDateToLibur: params.myShiftDate,
  };
  if (params.colleagueShiftDate && params.colleagueShiftCode) {
    plan.newShift = {
      date: params.colleagueShiftDate,
      code: params.colleagueShiftCode,
    };
  }
  return plan;
}

// Re-export Shift type biar caller tidak perlu double-import — kalau perlu.
export type { Shift };
