// Tests untuk parseExcel() — wide format + real RS hospital format.
//
// Pisah dari excelParser.test.ts karena describe block-nya tebal &
// share concept: header offset, sub-header (day-name row), summary columns
// di kanan, extract bulan/tahun dari title row.

import * as XLSX from 'xlsx';
import { parseExcel } from './excelParser';
import { buildWideBuffer, sheetToBuffer } from './excelParser.testHelpers';

describe('parseExcel — wide format', () => {
  it('parse strip 31 hari untuk nama yang match', () => {
    const buffer = buildWideBuffer([
      {
        nama: 'Sus Rina',
        shifts: [
          'P','S','M','L','P', 'S','M','L','P','S',
          'M','L','P','S','M', 'L','P','S','M','L',
          'P','S','M','L','P', 'S','M','L','P','S','M',
        ],
      },
      {
        nama: 'Bro Andika',
        shifts: Array(31).fill('L'),
      },
    ]);
    const result = parseExcel(buffer, 'Sus Rina');
    expect(result.success).toBe(true);
    expect(result.layout).toBe('wide');
    expect(result.shifts).toHaveLength(31);
    expect(result.shifts[0]?.code).toBe('P');
    expect(result.shifts[30]?.code).toBe('M');
  });

  it('skip cell kosong di wide format', () => {
    const shifts = Array(31).fill('');
    shifts[0] = 'P';
    shifts[5] = 'S';
    shifts[15] = 'M';
    const buffer = buildWideBuffer([{ nama: 'Sus Rina', shifts }]);
    const result = parseExcel(buffer, 'Sus Rina');
    expect(result.shifts).toHaveLength(3);
  });

  it('warning kalau nama tidak ketemu di wide format', () => {
    const buffer = buildWideBuffer([
      { nama: 'Bro Andika', shifts: Array(31).fill('P') },
    ]);
    const result = parseExcel(buffer, 'Sus Rina');
    expect(result.success).toBe(false);
    expect(result.warnings.some((w) => w.includes('Sus Rina'))).toBe(true);
  });
});

describe('parseExcel — format real RS (header offset, sub-header, summary cols)', () => {
  // Simulasi struktur file jadwal RS asli:
  //   Row 1: Title "JADWAL JAGA PERAWAT — RUANG MELATI — MEI 2026"
  //   Row 2: Info "Rumah Sakit Bhakti Husada — ..."
  //   Row 3: Header "Nama Perawat | 1 | 2 | ... | 31 | P | S | M | L | C"
  //   Row 4: Sub-header "Jum, Sab, Min, Sen, Sel, Rab, Kam, ..."
  //   Row 5+: Data rows
  function buildRSFormatBuffer(): ArrayBuffer {
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
    const dayNames = [
      'Jum', 'Sab', 'Min', 'Sen', 'Sel', 'Rab', 'Kam',
      'Jum', 'Sab', 'Min', 'Sen', 'Sel', 'Rab', 'Kam',
      'Jum', 'Sab', 'Min', 'Sen', 'Sel', 'Rab', 'Kam',
      'Jum', 'Sab', 'Min', 'Sen', 'Sel', 'Rab', 'Kam',
      'Jum', 'Sab', 'Min',
    ];
    const summaryHeaders = ['P', 'S', 'M', 'L', 'C']; // count columns di kanan
    const rinaShifts = [
      'P', 'P', 'L', 'S', 'S', 'L', 'M', 'M', 'M', 'L',
      'L', 'P', 'P', 'S', 'L', 'L', 'C', 'C', 'C', 'C',
      'P', 'P', 'L', 'M', 'M', 'L', 'S', 'S', 'L', 'L', 'L',
    ];
    const ws = XLSX.utils.aoa_to_sheet([
      ['JADWAL JAGA PERAWAT — RUANG MELATI — MEI 2026'],
      ['Rumah Sakit Bhakti Husada — Kepala Ruangan: Dr. Andriani'],
      ['Nama Perawat', ...days, ...summaryHeaders],
      ['', ...dayNames, '', '', '', '', ''],
      ['Rina Pratiwi', ...rinaShifts, '6', '5', '5', '10', '5'],
      ['Maya Sari', ...Array.from({ length: 31 }, () => 'S'), '0', '31', '0', '0', '0'],
    ]);
    return sheetToBuffer(ws);
  }

  it('parse file dengan title row + sub-header day-names + summary columns', () => {
    const buffer = buildRSFormatBuffer();
    const result = parseExcel(buffer, 'Rina');

    expect(result.success).toBe(true);
    expect(result.layout).toBe('wide');
    expect(result.shifts.length).toBe(31);
    expect(result.shifts[0]!.date).toBe('2026-05-01');
    expect(result.shifts[30]!.date).toBe('2026-05-31');
    expect(result.shifts[0]!.code).toBe('P');
    expect(result.shifts[16]!.code).toBe('C'); // tanggal 17 = Cuti
  });

  it('cuma ambil baris yang match nama "Rina" (skip Maya)', () => {
    const buffer = buildRSFormatBuffer();
    const result = parseExcel(buffer, 'Rina');
    const allS = result.shifts.every((s) => s.code === 'S');
    expect(allS).toBe(false); // confirm bukan ambil baris Maya
  });

  it('fuzzy match "Nama Perawat" sebagai kolom nama', () => {
    const buffer = buildRSFormatBuffer();
    const result = parseExcel(buffer, 'Rina');
    expect(result.layout).toBe('wide');
    expect(result.success).toBe(true);
  });

  it('extract bulan + tahun dari title "MEI 2026"', () => {
    const buffer = buildRSFormatBuffer();
    const result = parseExcel(buffer, 'Rina');
    expect(result.shifts.every((s) => s.date.startsWith('2026-05-'))).toBe(true);
  });

  it('long format dengan title row di atas tetap bisa diparse', () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['JADWAL DINAS — IGD — JUNI 2026'],
      ['RS Sehat Sentosa'],
      ['Nama', 'Tanggal', 'Shift'],
      ['Rina', '2026-06-01', 'P'],
      ['Rina', '2026-06-02', 'M'],
    ]);
    const buffer = sheetToBuffer(ws);

    const result = parseExcel(buffer, 'Rina');
    expect(result.success).toBe(true);
    expect(result.layout).toBe('long');
    expect(result.shifts.length).toBe(2);
  });
});
