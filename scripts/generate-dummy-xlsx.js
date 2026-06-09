// One-off script generate file Excel dummy untuk QA import jadwal.
// Output 3 file:
//   - dummy-jadwal-long.xlsx       — format simple long (Nama|Tanggal|Shift)
//   - dummy-jadwal-wide.xlsx       — format simple wide (Nama|1|2|...|31)
//   - dummy-jadwal-melati.xlsx     — REAL RS format (title + sub-header + summary)
//
// Cara pakai:
//   node scripts/generate-dummy-xlsx.js
//
// File hasil bisa kamu transfer ke HP (via WA / Drive / USB) lalu
// import di app: tab Saya → Import ulang Excel → pilih file.

const XLSX = require('xlsx');
const path = require('path');

// === Konfigurasi ===
//
// Nama perawat harus MATCH (case-insensitive partial) dengan nurseName
// yang kamu set di profile app. Default Rina. Kalau profile beda, edit
// `MY_NAME` di bawah ATAU edit file Excel hasil sebelum import.
const MY_NAME = 'Rina';
const OTHER_NAMES = ['Maya', 'Andika']; // perawat lain di file (akan di-skip parser)

// Range tanggal untuk simple files: 1-30 Juni 2026 (mostly future dari
// 28 Mei 2026 — bisa test notif + kalender).
const SIMPLE_YEAR = 2026;
const SIMPLE_MONTH = 6;
const SIMPLE_DAYS = 30;

// Range untuk file Melati: Mei 2026 (match dengan screenshot real user).
const MELATI_YEAR = 2026;
const MELATI_MONTH = 5;
const MELATI_DAYS = 31;
const MELATI_MONTH_NAME = 'MEI';

// Pattern shift per perawat (loop kalau pendek).
const SHIFT_PATTERNS = {
  Rina: ['P', 'P', 'S', 'S', 'M', 'L', 'L'],
  Maya: ['M', 'M', 'L', 'P', 'P', 'S', 'L'],
  Andika: ['S', 'S', 'P', 'L', 'C', 'C', 'C'],
};

// Nama hari di header sub-header (Mei 2026 mulai Jumat tanggal 1).
const MEI_2026_DAY_NAMES = [
  'Jum', 'Sab', 'Min', 'Sen', 'Sel', 'Rab', 'Kam',
  'Jum', 'Sab', 'Min', 'Sen', 'Sel', 'Rab', 'Kam',
  'Jum', 'Sab', 'Min', 'Sen', 'Sel', 'Rab', 'Kam',
  'Jum', 'Sab', 'Min', 'Sen', 'Sel', 'Rab', 'Kam',
  'Jum', 'Sab', 'Min',
];

// === Helper ===

function pad2(n) {
  return String(n).padStart(2, '0');
}

function isoDate(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function shiftForDay(name, day) {
  const pattern = SHIFT_PATTERNS[name];
  if (!pattern) return 'L';
  return pattern[(day - 1) % pattern.length];
}

function countShifts(shifts, code) {
  return shifts.filter((s) => s === code).length;
}

// === Generate Simple Long format (Nama | Tanggal | Shift) ===

function buildLongData() {
  const rows = [['Nama', 'Tanggal', 'Shift']];
  const allNames = [MY_NAME, ...OTHER_NAMES];
  for (const name of allNames) {
    for (let day = 1; day <= SIMPLE_DAYS; day++) {
      rows.push([name, isoDate(SIMPLE_YEAR, SIMPLE_MONTH, day), shiftForDay(name, day)]);
    }
  }
  return rows;
}

// === Generate Simple Wide format (Nama | 1 | 2 | ... | 30) ===

function buildWideData() {
  const header = ['Nama'];
  for (let day = 1; day <= SIMPLE_DAYS; day++) header.push(String(day));
  const rows = [header];

  const allNames = [MY_NAME, ...OTHER_NAMES];
  for (const name of allNames) {
    const row = [name];
    for (let day = 1; day <= SIMPLE_DAYS; day++) {
      row.push(shiftForDay(name, day));
    }
    rows.push(row);
  }
  return rows;
}

// === Generate REAL RS format (Melati) ===
//
// Struktur:
//   Row 1: Title "JADWAL JAGA PERAWAT — RUANG MELATI — MEI 2026"
//   Row 2: Info RS
//   Row 3: Header "Nama Perawat | 1 | 2 | ... | 31 | P | S | M | L | C"
//   Row 4: Sub-header day names "Jum, Sab, Min, ..."
//   Row 5+: Data perawat dengan summary count di kanan
//
// Test untuk verify parser bisa handle: header offset, fuzzy nama column,
// skip sub-header, stop di summary cols, extract bulan dari title.

function buildMelatiData() {
  const days = [];
  for (let day = 1; day <= MELATI_DAYS; day++) days.push(String(day));
  const summaryHeaders = ['P', 'S', 'M', 'L', 'C'];

  const allNames = [MY_NAME + ' Pratiwi', 'Maya Sari', 'Andi Wijaya'];
  // 8 perawat lengkap untuk realistis
  const extraNames = [
    'Dewi Lestari',
    'Bambang Hartono',
    'Siti Nurhaliza',
    'Joko Santoso',
    'Putri Kencana',
  ];

  const dataRows = [];
  for (const fullName of [...allNames, ...extraNames]) {
    const firstName = fullName.split(' ')[0];
    const shifts = [];
    for (let day = 1; day <= MELATI_DAYS; day++) {
      shifts.push(shiftForDay(firstName, day));
    }
    const summary = [
      countShifts(shifts, 'P'),
      countShifts(shifts, 'S'),
      countShifts(shifts, 'M'),
      countShifts(shifts, 'L'),
      countShifts(shifts, 'C'),
    ];
    dataRows.push([fullName, ...shifts, ...summary]);
  }

  return [
    [`JADWAL JAGA PERAWAT — RUANG MELATI — ${MELATI_MONTH_NAME} ${MELATI_YEAR}`],
    ['Rumah Sakit Bhakti Husada — Kepala Ruangan: Dr. Andriani, S.Kep'],
    ['Nama Perawat', ...days, ...summaryHeaders],
    ['', ...MEI_2026_DAY_NAMES, '', '', '', '', ''],
    ...dataRows,
  ];
}

// === Write files ===

function writeXlsx(data, filename, sheetName) {
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const outPath = path.join(__dirname, '..', filename);
  XLSX.writeFile(wb, outPath);
  console.log(`✓ Generated ${filename}`);
}

writeXlsx(buildLongData(), 'dummy-jadwal-long.xlsx', 'Jadwal');
writeXlsx(buildWideData(), 'dummy-jadwal-wide.xlsx', 'Jadwal');
writeXlsx(buildMelatiData(), 'dummy-jadwal-melati.xlsx', 'Jadwal Melati Mei 2026');

console.log(`\nFile siap di-import. Profile.nurseName harus match "${MY_NAME}".`);
console.log('  - dummy-jadwal-long.xlsx   = format simple long (1 row per shift)');
console.log('  - dummy-jadwal-wide.xlsx   = format simple wide (1 col per tanggal)');
console.log('  - dummy-jadwal-melati.xlsx = format REAL RS (title + sub-header + summary)');
