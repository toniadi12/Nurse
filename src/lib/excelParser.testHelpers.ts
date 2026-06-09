// Helpers untuk build buffer Excel in-memory di test parser.
//
// Kenapa pisah file dari test? Dua test file (excelParser.test.ts +
// excelParser.realFormat.test.ts) pakai helper yang sama — extract supaya
// tidak duplicate code, dan supaya jika nanti add format ketiga (CSV?)
// tinggal tambah builder di sini.

import * as XLSX from 'xlsx';

export type LongRow = readonly [string, string | Date | number, string];

// Build buffer Excel long format: 1 baris header (Nama|Tanggal|Shift) +
// N baris data.
export function buildLongBuffer(rows: readonly LongRow[]): ArrayBuffer {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Nama', 'Tanggal', 'Shift'],
    ...rows.map((r) => [r[0], r[1], r[2]]),
  ]);
  return sheetToBuffer(ws);
}

// Build buffer Excel wide format: 1 baris header (Nama|1|2|...|N) +
// N baris data dengan kode shift per kolom hari.
export function buildWideBuffer(
  rows: ReadonlyArray<{ nama: string; shifts: readonly string[] }>,
  daysInMonth = 31,
): ArrayBuffer {
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
  const header = ['Nama', ...days];
  const data = rows.map((r) => [r.nama, ...r.shifts]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
  return sheetToBuffer(ws);
}

// Build buffer pakai pre-built sheet — untuk test format aneh (title row,
// sub-header, dll) yang tidak fit ke buildLongBuffer/buildWideBuffer.
export function sheetToBuffer(sheet: XLSX.WorkSheet): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Jadwal');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
}
