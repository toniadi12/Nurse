// Helper formatting tanggal — wrapper di atas date-fns biar:
//   1. Locale enGB di-import sekali, tidak tersebar di mana-mana
//   2. Format string standar diberi nama (DATE_FORMAT_*) sebagai konstanta
//   3. Defensive try/catch untuk input string yang belum tentu valid ISO
//
// Kapan pakai ini vs date-fns langsung?
//   - Pakai ini saat input bisa berupa string user (form input, URL param)
//   - Pakai date-fns langsung saat input dijamin Date object (mis. new Date())

import { format, parseISO } from 'date-fns';
import { enGB } from 'date-fns/locale';

// "Monday, 28 May 2026" — display utama di Add Shift preview & Swap detail.
const DATE_FORMAT_NATURAL = 'EEEE, d MMMM yyyy';

// Format ISO date string ke natural date (UK locale).
// Return null kalau parsing gagal — caller bisa fallback ke placeholder.
export function formatNaturalDate(isoDate: string): string | null {
  try {
    return format(parseISO(isoDate), DATE_FORMAT_NATURAL, { locale: enGB });
  } catch {
    return null;
  }
}
