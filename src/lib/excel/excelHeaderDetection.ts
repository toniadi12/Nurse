// Deteksi baris header di Excel jadwal jaga.
//
// Real-world Excel dari RS jarang punya header di row 1 — sering ada
// title row + nama RS + info kepala ruangan + empty row sebelum header
// sebenarnya. File ini scan 15 baris awal untuk cari header, lalu
// kasih tau caller: layout-nya long atau wide, dan kolom mana untuk apa.

import { isDayNumber, normalizeStr } from './excelCellHelpers';

// Scan maksimum N baris awal untuk cari header. Real-world Excel kadang
// punya 3-5 row pra-header (title + nama RS + info kepala ruangan + empty).
const MAX_HEADER_SCAN_ROWS = 15;

// Threshold minimum kolom numerik (1-31) di header buat detect "wide format".
// Pakai 7 supaya jadwal seminggu (paling pendek yang masuk akal) bisa
// ter-detect, tapi tidak salah-detect long format yang kebetulan ada
// 1-2 angka di header.
const MIN_WIDE_FORMAT_DAY_COLUMNS = 7;

// Pattern untuk fuzzy match kolom nama. Real-world variasi: "Nama",
// "Nama Perawat", "Perawat", "Nakes", "NAMA NAKES", "Petugas", "Staff".
const NAME_COLUMN_KEYWORDS = ['nama', 'perawat', 'nakes', 'petugas', 'staff', 'name'];

// Pattern untuk skip sub-header berisi nama hari (Sen/Sel/Rab/Kam/Jum/Sab/Min
// dan variannya). Real-world Excel sering punya row tambahan di bawah header
// tanggal angka untuk show hari yang sesuai.
const DAY_NAME_TOKENS = [
  'sen', 'senin', 'sel', 'selasa', 'rab', 'rabu',
  'kam', 'kamis', 'jum', 'jumat', 'sab', 'sabtu',
  'min', 'minggu', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
];

const DATE_COLUMN_KEYWORDS = ['tanggal', 'date', 'tgl'];
const SHIFT_COLUMN_KEYWORDS = ['shift', 'jadwal', 'jaga'];

// Nama bulan Indonesia → 0-based month index (untuk parse title "MEI 2026").
// V2: tambah English month names kalau target RS internasional non-ID.
const INDONESIAN_MONTH_MAP: Record<string, number> = {
  januari: 0, jan: 0,
  februari: 1, feb: 1, pebruari: 1,
  maret: 2, mar: 2,
  april: 3, apr: 3,
  mei: 4,
  juni: 5, jun: 5,
  juli: 6, jul: 6,
  agustus: 7, agu: 7, agt: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  oktober: 9, okt: 9, oct: 9,
  november: 10, nov: 10,
  desember: 11, des: 11, dec: 11,
};

export interface DayColumn {
  colIdx: number;
  day: number;
}

export interface HeaderInfo {
  rowIdx: number; // 0-based index baris header di rows[]
  layout: 'long' | 'wide';
  nameColIdx: number;
  // Untuk long format:
  dateColIdx?: number;
  shiftColIdx?: number;
  // Untuk wide format:
  dayColumns?: DayColumn[];
}

// Scan rows untuk cari satu baris yang punya kolom nama + (kolom tanggal+shift
// untuk long, atau ≥7 kolom angka 1-31 untuk wide).
// Return null kalau tidak ketemu sama sekali — caller fallback ke mapping
// manual.
export function findHeaderRow(rows: unknown[][]): HeaderInfo | null {
  const scanLimit = Math.min(MAX_HEADER_SCAN_ROWS, rows.length);

  for (let r = 0; r < scanLimit; r++) {
    const row = rows[r];
    if (!row) continue;
    const cells = row.map(normalizeStr);

    const nameColIdx = findNameColumn(cells);
    if (nameColIdx < 0) continue;

    const longHeader = tryLongLayout(cells, r, nameColIdx);
    if (longHeader) return longHeader;

    const wideHeader = tryWideLayout(cells, r, nameColIdx);
    if (wideHeader) return wideHeader;
  }

  return null;
}

function findNameColumn(cells: string[]): number {
  return cells.findIndex((c) =>
    NAME_COLUMN_KEYWORDS.some((kw) => c === kw || c.includes(kw)),
  );
}

function tryLongLayout(
  cells: string[],
  rowIdx: number,
  nameColIdx: number,
): HeaderInfo | null {
  const dateColIdx = cells.findIndex((c) => DATE_COLUMN_KEYWORDS.includes(c));
  const shiftColIdx = cells.findIndex((c) => SHIFT_COLUMN_KEYWORDS.includes(c));
  if (dateColIdx < 0 || shiftColIdx < 0) return null;

  return { rowIdx, layout: 'long', nameColIdx, dateColIdx, shiftColIdx };
}

// Wide layout: scan kolom-kolom setelah Nama buat ketemu deretan angka 1-31.
// Stop scan saat ketemu kolom non-angka setelah day numbers (= kolom summary
// P/S/M/L/C count yang sering ada di akhir).
function tryWideLayout(
  cells: string[],
  rowIdx: number,
  nameColIdx: number,
): HeaderInfo | null {
  const dayColumns: DayColumn[] = [];
  let inDaySection = false;

  for (let c = nameColIdx + 1; c < cells.length; c++) {
    const cell = cells[c] ?? '';
    if (isDayNumber(cell)) {
      dayColumns.push({ colIdx: c, day: parseInt(cell, 10) });
      inDaySection = true;
    } else if (inDaySection && cell.length > 0) {
      break;
    }
  }

  if (dayColumns.length < MIN_WIDE_FORMAT_DAY_COLUMNS) return null;

  return { rowIdx, layout: 'wide', nameColIdx, dayColumns };
}

// True kalau row tampak seperti baris sub-header nama hari, bukan data perawat.
// Heuristik: ≥50% kolom di posisi day-columns berisi nama hari pendek.
export function isDayNameRow(
  row: unknown[] | undefined,
  dayColumns: DayColumn[],
): boolean {
  if (!row) return false;
  const hits = dayColumns.reduce((count, { colIdx }) => {
    const cell = normalizeStr(row[colIdx]);
    return cell.length > 0 && DAY_NAME_TOKENS.includes(cell) ? count + 1 : count;
  }, 0);
  return hits >= Math.floor(dayColumns.length / 2);
}

// Scan rows[0..headerRowIdx-1] untuk text yang match nama bulan ID + tahun.
// Mis. "JADWAL JAGA PERAWAT — RUANG MELATI — MEI 2026" → month=4, year=2026.
// Fallback ke current month/year kalau tidak ketemu.
export function extractMonthYear(
  rows: unknown[][],
  headerRowIdx: number,
): { month: number; year: number } {
  const now = new Date();
  const fallback = { month: now.getMonth(), year: now.getFullYear() };

  // Sort longest-first supaya "februari" match sebelum "feb" (hindari ambiguitas).
  const monthEntries = Object.entries(INDONESIAN_MONTH_MAP).sort(
    ([a], [b]) => b.length - a.length,
  );

  for (let r = 0; r < headerRowIdx; r++) {
    const row = rows[r];
    if (!row) continue;
    const text = row.map((c) => String(c ?? '')).join(' ').toLowerCase();

    const monthHit = findMonthInText(text, monthEntries);
    if (monthHit == null) continue;

    const yearMatch = text.match(/\b(20\d{2})\b/);
    return {
      month: monthHit,
      year: yearMatch ? parseInt(yearMatch[1]!, 10) : fallback.year,
    };
  }
  return fallback;
}

function findMonthInText(
  text: string,
  monthEntries: Array<[string, number]>,
): number | null {
  for (const [name, idx] of monthEntries) {
    // Word boundary supaya "des" tidak match "deskripsi".
    if (new RegExp(`\\b${name}\\b`).test(text)) return idx;
  }
  return null;
}
