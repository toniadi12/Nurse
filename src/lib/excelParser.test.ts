// Tests untuk parseExcel() — long format + validasi awal + unknown layout.
//
// Wide format & real RS format dipisah ke excelParser.realFormat.test.ts
// karena describe block-nya tebal dan share concept (header offset, sub-header
// detection) yang lebih kohesif sebagai grup terpisah.
//
// Strategi umum: build buffer Excel in-memory pakai helpers di
// excelParser.testHelpers.ts (no fixture file, deterministic).

import { parseExcel } from './excelParser';
import { buildLongBuffer, sheetToBuffer } from './excelParser.testHelpers';
import * as XLSX from 'xlsx';

describe('parseExcel — validasi awal', () => {
  it('return error untuk buffer kosong', () => {
    const result = parseExcel(new ArrayBuffer(0), 'Sus Rina');
    expect(result.success).toBe(false);
    expect(result.errors).toContain('The file is empty.');
  });

  it('return failure untuk file rusak', () => {
    // SheetJS sering tidak throw untuk byte sampah — dia coba parse sebisanya,
    // hasilkan workbook aneh. Yang penting parseExcel return success=false
    // dan tampilkan setidaknya 1 pesan (warning atau error) ke user.
    const garbage = new ArrayBuffer(100);
    new Uint8Array(garbage).fill(0xff);
    const result = parseExcel(garbage, 'Sus Rina');
    expect(result.success).toBe(false);
    expect(result.warnings.length + result.errors.length).toBeGreaterThan(0);
  });

  it('return error untuk file > 5 MB', () => {
    const tooBig = new ArrayBuffer(6 * 1024 * 1024);
    const result = parseExcel(tooBig, 'Sus Rina');
    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatch(/too large/i);
  });
});

describe('parseExcel — long format', () => {
  it('parse 3 shift untuk nama yang match', () => {
    const buffer = buildLongBuffer([
      ['Sus Rina', new Date(2026, 0, 1), 'P'],
      ['Sus Rina', new Date(2026, 0, 2), 'S'],
      ['Sus Rina', new Date(2026, 0, 3), 'M'],
      ['Bro Andika', new Date(2026, 0, 1), 'M'],
    ]);

    const result = parseExcel(buffer, 'Sus Rina');

    expect(result.success).toBe(true);
    expect(result.layout).toBe('long');
    expect(result.shifts).toHaveLength(3);
    expect(result.shifts.map((s) => s.code)).toEqual(['P', 'S', 'M']);
    expect(result.shifts[0]?.date).toBe('2026-01-01');
  });

  it('match nama case-insensitive & partial', () => {
    const buffer = buildLongBuffer([
      ['Sus Rina Setyawati', new Date(2026, 0, 1), 'P'],
    ]);
    const result = parseExcel(buffer, 'rina'); // lowercase, partial
    expect(result.shifts).toHaveLength(1);
  });

  it('warning kalau nama tidak ketemu', () => {
    const buffer = buildLongBuffer([
      ['Sus Maya', new Date(2026, 0, 1), 'P'],
    ]);
    const result = parseExcel(buffer, 'Rina');
    expect(result.success).toBe(false);
    expect(result.shifts).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes('Rina'))).toBe(true);
  });

  it('warning kalau kode shift tidak dikenal', () => {
    const buffer = buildLongBuffer([
      ['Sus Rina', new Date(2026, 0, 1), 'XYZ'],
      ['Sus Rina', new Date(2026, 0, 2), 'P'], // ini valid
    ]);
    const result = parseExcel(buffer, 'Sus Rina');
    expect(result.shifts).toHaveLength(1); // hanya yang valid
    expect(result.warnings.some((w) => w.includes('XYZ'))).toBe(true);
  });

  it('kenal alias ID + EN: P/Pagi/Morning/S/Siang/Sore/M/Malam/Night/L/Libur/C', () => {
    const buffer = buildLongBuffer([
      ['Sus Rina', new Date(2026, 0, 1), 'P'],
      ['Sus Rina', new Date(2026, 0, 2), 'Pagi'],
      ['Sus Rina', new Date(2026, 0, 3), 'Morning'],
      ['Sus Rina', new Date(2026, 0, 4), 'S'],
      ['Sus Rina', new Date(2026, 0, 5), 'siang'],
      ['Sus Rina', new Date(2026, 0, 6), 'Sore'],
      ['Sus Rina', new Date(2026, 0, 7), 'M'],
      ['Sus Rina', new Date(2026, 0, 8), 'Malam'],
      ['Sus Rina', new Date(2026, 0, 9), 'NIGHT'],
      ['Sus Rina', new Date(2026, 0, 10), 'L'],
      ['Sus Rina', new Date(2026, 0, 11), 'Libur'],
      ['Sus Rina', new Date(2026, 0, 12), 'C'],
    ]);
    const result = parseExcel(buffer, 'Sus Rina');
    expect(result.shifts.map((s) => s.code)).toEqual([
      'P', 'P', 'P',
      'S', 'S', 'S',
      'M', 'M', 'M',
      'L', 'L',
      'C',
    ]);
  });

  it('parse tanggal format string ISO (yyyy-mm-dd)', () => {
    const buffer = buildLongBuffer([
      ['Sus Rina', '2026-01-15', 'P'],
    ]);
    const result = parseExcel(buffer, 'Sus Rina');
    expect(result.shifts).toHaveLength(1);
    expect(result.shifts[0]?.date).toBe('2026-01-15');
  });

  it('parse tanggal format DD/MM/YYYY (umum di EU/Indonesia)', () => {
    const buffer = buildLongBuffer([
      ['Sus Rina', '15/01/2026', 'P'],
    ]);
    const result = parseExcel(buffer, 'Sus Rina');
    expect(result.shifts).toHaveLength(1);
    expect(result.shifts[0]?.date).toBe('2026-01-15');
  });
});

describe('parseExcel — unknown layout', () => {
  it('return unknown kalau header tidak ada Nama', () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Foo', 'Bar', 'Baz'],
      ['a', 'b', 'c'],
    ]);
    const buffer = sheetToBuffer(ws);

    const result = parseExcel(buffer, 'Sus Rina');
    expect(result.layout).toBe('unknown');
    expect(result.success).toBe(false);
    expect(result.warnings[0]).toMatch(/mapping columns manually/i);
  });

  it('return unknown kalau cuma ada Nama (tanpa Tanggal/Shift atau day columns)', () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Nama', 'Catatan'],
      ['Sus Rina', 'note'],
    ]);
    const buffer = sheetToBuffer(ws);

    const result = parseExcel(buffer, 'Sus Rina');
    expect(result.layout).toBe('unknown');
  });
});
