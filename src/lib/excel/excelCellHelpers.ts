// Helpers untuk parse cell individual dari Excel sheet.
//
// File ini sengaja pure function semua — gampang di-unit-test, tidak
// punya state, tidak tergantung context apapun. Pisah dari parser utama
// supaya excelParser.ts bisa fokus ke flow tinggi (read file → detect
// layout → loop rows), sementara file ini handle nitty-gritty per-cell.

import { format } from 'date-fns';

export const ISO_DATE_FORMAT = 'yyyy-MM-dd';

// Excel epoch: serial 25569 = 1970-01-01 (Unix epoch). Excel pakai 1900
// sebagai tahun 1 dengan bug "1900 dianggap leap year" — offset 25569
// sudah include koreksi ini untuk semua tanggal pasca 1900-03-01.
const EXCEL_EPOCH_DAY_OFFSET = 25569;
const MS_PER_DAY = 86_400 * 1000;

const MIN_VALID_DAY = 1;
const MAX_VALID_DAY = 31;

// Standardised lowercase trimmed string — dipakai di mana-mana untuk
// case-insensitive matching (nama perawat, header kolom, dst).
export function normalizeStr(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

// True kalau value adalah angka 1-31 (tanggal valid dalam sebulan).
// String(n) === value guard mencegah "01" atau "1.0" lolos sebagai 1.
export function isDayNumber(value: string): boolean {
  const parsed = parseInt(value, 10);
  return (
    !isNaN(parsed) &&
    parsed >= MIN_VALID_DAY &&
    parsed <= MAX_VALID_DAY &&
    String(parsed) === value
  );
}

// Coba parse cell apapun jadi ISO date string "YYYY-MM-DD".
// Return null kalau cell bukan tanggal yang kita kenal.
//
// Tiga bentuk yang di-handle:
//   1. Date object (kalau SheetJS dipanggil dengan cellDates: true)
//   2. Excel serial number (mis. 45413 = 2024-04-01)
//   3. String ISO ("2026-01-15") atau DD/MM/YYYY ("15/01/2026")
export function parseCellDate(cell: unknown): string | null {
  if (cell instanceof Date) {
    return format(cell, ISO_DATE_FORMAT);
  }

  if (typeof cell === 'number') {
    return excelSerialToISO(cell);
  }

  if (typeof cell === 'string') {
    return parseDateString(cell.trim());
  }

  return null;
}

function parseDateString(trimmed: string): string | null {
  // ISO: 2026-01-15 atau 2026/01/15
  const iso = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (iso) {
    const [, year, month, day] = iso;
    return `${year}-${month!.padStart(2, '0')}-${day!.padStart(2, '0')}`;
  }
  // DD/MM/YYYY (umum di EU/Indonesia): 15/01/2026 atau 15-01-2026
  const dmy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) {
    const [, day, month, year] = dmy;
    return `${year}-${month!.padStart(2, '0')}-${day!.padStart(2, '0')}`;
  }
  return null;
}

// Konversi serial number Excel → ISO date string.
// Lewat UTC components biar hasil sama persis dengan apa yang user lihat
// di Excel, regardless of timezone local. (Excel sheets tidak simpan
// timezone info, jadi serial number = "tanggal absolut".)
function excelSerialToISO(serial: number): string {
  const utcDate = new Date((serial - EXCEL_EPOCH_DAY_OFFSET) * MS_PER_DAY);
  const localDate = new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
  );
  return format(localDate, ISO_DATE_FORMAT);
}
