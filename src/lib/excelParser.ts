// Parser file Excel jadwal jaga (PRD section 5 F3).
//
// Input  : ArrayBuffer file + nama perawat
// Output : ParseResult — shifts ter-parse + layout + warnings/errors
//
// Strategi:
//   1. Validasi ukuran file (max 5 MB per PRD)
//   2. Read workbook pakai SheetJS (`cellDates: true` biar Date object
//      langsung, bukan serial number)
//   3. Ambil sheet pertama (per PRD edge case: multi-sheet → first)
//   4. Convert ke 2D array, scan untuk cari header row (lihat
//      excelHeaderDetection.ts — handle title row + sub-header day-names)
//   5. Deteksi layout: long (Nama|Tanggal|Shift per row) vs wide
//      (Nama|1|2|...|31)
//   6. Loop rows, match nurseName case-insensitive partial, normalize
//      shift code via parseShiftCode() (kenal ID + EN aliases)
//
// File ini sengaja diatur thin — heavy lifting dipisah ke:
//   - excel/excelHeaderDetection.ts (findHeaderRow, extractMonthYear, isDayNameRow)
//   - excel/excelCellHelpers.ts     (parseCellDate, normalizeStr, isDayNumber)
//
// LIMITASI MVP (defer ke V2 / mapping manual fallback):
//   - Merged cells diabaikan (bisa muncul empty di tengah row, tapi skip)
//   - Multi-bulan dalam 1 file wide format tidak di-handle
//   - CSV encoding non-UTF8 (Windows-1252) tidak di-handle

import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { ShiftCode } from '@/types/shift';
import { parseShiftCode } from '@/constants/shiftCodes';
import {
  ISO_DATE_FORMAT,
  normalizeStr,
  parseCellDate,
} from './excel/excelCellHelpers';
import {
  extractMonthYear,
  findHeaderRow,
  isDayNameRow,
  type HeaderInfo,
} from './excel/excelHeaderDetection';

// PRD F3: max file size 5 MB
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export interface ParsedShift {
  date: string; // ISO "YYYY-MM-DD"
  code: ShiftCode;
  rawCell: string; // isi cell asli (untuk debugging & warning message)
  rowIndex: number; // 0-based index di sheet (untuk "error baris X")
}

export type LayoutType = 'long' | 'wide' | 'unknown';

export interface ParseResult {
  success: boolean; // true kalau setidaknya 1 shift ter-parse
  layout: LayoutType;
  shifts: ParsedShift[];
  warnings: string[]; // soft (mis. cell unrecognized — skipped tapi tetap lanjut)
  errors: string[]; // fatal (mis. file rusak / format tidak dikenali sama sekali)
}

// === PUBLIC API ===

export function parseExcel(buffer: ArrayBuffer, nurseName: string): ParseResult {
  const validation = validateBuffer(buffer);
  if (validation) return validation;

  const sheet = readFirstSheet(buffer);
  if ('error' in sheet) return failResult(sheet.error);

  const rows = sheetToRows(sheet.workbook, sheet.firstSheetName);
  if (rows.length === 0) return failResult('Sheet is empty (no rows).');

  const headerInfo = findHeaderRow(rows);
  if (headerInfo == null) {
    return {
      success: false,
      layout: 'unknown',
      shifts: [],
      warnings: ["Couldn't recognise this file layout. Try mapping columns manually."],
      errors: [],
    };
  }

  switch (headerInfo.layout) {
    case 'long':
      return parseLongFormat(rows, headerInfo, nurseName);
    case 'wide':
      return parseWideFormat(rows, headerInfo, nurseName);
  }
}

// === FILE READING ===

function validateBuffer(buffer: ArrayBuffer): ParseResult | null {
  if (buffer.byteLength === 0) return failResult('The file is empty.');
  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    return failResult('File is too large (maximum 5 MB).');
  }
  return null;
}

type SheetReadOutcome =
  | { workbook: XLSX.WorkBook; firstSheetName: string }
  | { error: string };

function readFirstSheet(buffer: ArrayBuffer): SheetReadOutcome {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  } catch {
    return { error: "Couldn't read the file. Make sure it's .xlsx, .xls, or .csv." };
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return { error: 'No sheets found in this file.' };

  return { workbook, firstSheetName };
}

function sheetToRows(wb: XLSX.WorkBook, sheetName: string): unknown[][] {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: '',
  });
}

// === LONG FORMAT PARSER ===

function parseLongFormat(
  rows: unknown[][],
  header: HeaderInfo,
  nurseName: string,
): ParseResult {
  const { rowIdx, nameColIdx, dateColIdx, shiftColIdx } = header;
  if (dateColIdx == null || shiftColIdx == null) {
    return failResult('Incomplete header (need Name, Date, and Shift columns).');
  }

  const normalizedName = nurseName.trim().toLowerCase();
  const shifts: ParsedShift[] = [];
  const warnings: string[] = [];
  let nameFound = false;

  for (let i = rowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const cellName = normalizeStr(row[nameColIdx]);
    if (!cellName.includes(normalizedName)) continue;

    nameFound = true;
    const parsedRow = parseLongRow(row, i, dateColIdx, shiftColIdx);
    if ('warning' in parsedRow) {
      warnings.push(parsedRow.warning);
    } else {
      shifts.push(parsedRow.shift);
    }
  }

  if (!nameFound) {
    warnings.push(`Couldn't find the name "${nurseName}" in this file.`);
  }

  return { success: shifts.length > 0, layout: 'long', shifts, warnings, errors: [] };
}

function parseLongRow(
  row: unknown[],
  rowIndex: number,
  dateColIdx: number,
  shiftColIdx: number,
): { shift: ParsedShift } | { warning: string } {
  const rowLabel = rowIndex + 1; // 1-based untuk pesan ke user
  const date = parseCellDate(row[dateColIdx]);
  if (date == null) {
    return { warning: `Row ${rowLabel}: couldn't read the date "${String(row[dateColIdx])}".` };
  }
  const code = parseShiftCode(String(row[shiftColIdx]));
  if (code == null) {
    return { warning: `Row ${rowLabel}: unrecognised shift code "${String(row[shiftColIdx])}".` };
  }
  return {
    shift: { date, code, rawCell: String(row[shiftColIdx]), rowIndex },
  };
}

// === WIDE FORMAT PARSER ===

function parseWideFormat(
  rows: unknown[][],
  header: HeaderInfo,
  nurseName: string,
): ParseResult {
  const { rowIdx, nameColIdx, dayColumns } = header;
  if (dayColumns == null || dayColumns.length === 0) {
    return failResult('No date columns (1-31) found.');
  }

  // Bulan/tahun dari title row di atas header, fallback ke current month.
  const { month, year } = extractMonthYear(rows, rowIdx);

  // Skip baris sub-header (nama hari) kalau ada. Real-world: row tepat
  // setelah header tanggal angka berisi "Sen, Sel, Rab..." sebagai sub-info.
  const dataStartRow = isDayNameRow(rows[rowIdx + 1], dayColumns)
    ? rowIdx + 2
    : rowIdx + 1;

  const normalizedName = nurseName.trim().toLowerCase();
  const shifts: ParsedShift[] = [];
  const warnings: string[] = [];
  let nameFound = false;

  for (let i = dataStartRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const cellName = normalizeStr(row[nameColIdx]);
    if (!cellName.includes(normalizedName)) continue;

    nameFound = true;
    for (const { colIdx, day } of dayColumns) {
      const cell = row[colIdx];
      if (cell == null || cell === '') continue;
      const code = parseShiftCode(String(cell));
      if (code == null) {
        warnings.push(`Row ${i + 1}, day ${day}: unrecognised code "${String(cell)}".`);
        continue;
      }
      shifts.push({
        date: format(new Date(year, month, day), ISO_DATE_FORMAT),
        code,
        rawCell: String(cell),
        rowIndex: i,
      });
    }
    break; // wide format: ambil row pertama yang match nama
  }

  if (!nameFound) {
    warnings.push(`Couldn't find the name "${nurseName}" in this file.`);
  }

  return { success: shifts.length > 0, layout: 'wide', shifts, warnings, errors: [] };
}

// === HELPERS ===

function failResult(error: string): ParseResult {
  return {
    success: false,
    layout: 'unknown',
    shifts: [],
    warnings: [],
    errors: [error],
  };
}
