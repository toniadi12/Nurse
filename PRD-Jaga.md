# PRD — Jaga

**Shift scheduling app for expat nurses & international hospitals**
Versi 1.0 (MVP) · 25 Mei 2026

> **Language pivot (2026-05-28):** UI language switched from Indonesian to **UK English**.
> Target audience expanded from Indonesian nurses to expat nurses / international
> hospital chains (Siloam, RSIA, KPJ, etc.). Excel parser keeps Indonesian shift
> code aliases for backward compatibility with files from Indonesian RS.

---

## 1. Ringkasan

Jaga adalah aplikasi mobile (iOS & Android, React Native) yang membantu perawat individu mengelola jadwal shift mereka. Perawat bisa import jadwal dari file Excel yang dibagikan kepala ruangan, atau input manual hari per hari. App memberi pengingat sebelum shift, mendukung tukar jadwal antar kolega via WhatsApp, dan punya mode gelap untuk kenyamanan shift malam.

**Tagline:** *Jadwal jaga, dalam genggaman.*

---

## 2. Latar Belakang & Problem Statement

Perawat di Indonesia umumnya menerima jadwal jaga dalam bentuk file Excel atau lembaran kertas dari kepala ruangan, dengan format yang bervariasi per rumah sakit. Mereka mencatat ulang ke kalender HP atau buku catatan — proses manual yang rawan salah dan tidak responsif terhadap perubahan mendadak (tukar shift, izin sakit, cuti).

Aplikasi kalender umum (Google Calendar, dll) tidak punya konteks shift kesehatan: tidak mengenal istilah "pagi/siang/malam", tidak bisa parse format jadwal khas RS, dan tidak memberi insight relevan (jumlah malam beruntun, total jam, dsb).

**Pain points utama:**
- Capek ngintip file Excel di HP yang tidak dirancang untuk mobile
- Lupa shift karena tidak ada pengingat khusus
- Tukar shift via WA sulit di-track (lupa siapa tukar dengan siapa kapan)
- Shift malam bikin mata sensitif terhadap layar terang

---

## 3. Target Pengguna

**Persona utama: Sus Rina, 28 tahun**
- Perawat IGD di RS swasta Yogyakarta
- 5 tahun pengalaman, shift rotasi pagi/siang/malam
- Pakai HP Android mid-range (Samsung A-series / Xiaomi Redmi)
- Penggunaan utama: cek shift besok, set alarm, tukar shift sesekali
- Tidak techy, tapi familiar dengan WhatsApp dan kalender HP

**Persona sekunder: Bro Andika, 24 tahun**
- Perawat baru, masih probation
- iPhone, gen Z, lebih nyaman dengan UI modern
- Sering input ulang jadwal karena masih sering berubah

---

## 4. Tujuan & Metrik Sukses

### Tujuan utama
1. Perawat bisa lihat shift hari ini dalam < 5 detik buka app
2. 80% jadwal Excel format umum bisa di-parse otomatis
3. Tidak pernah lupa shift karena tidak ada notifikasi (zero missed-shift)

### Metrik (untuk versi rilis nanti)
- DAU/MAU ratio > 0.5 (dipakai harian)
- Onboarding completion rate > 70%
- Crash-free rate > 99.5%
- Rating Play Store ≥ 4.3

---

## 5. Fitur MVP — User Stories

### F1. Splash & First Launch
**Sebagai** perawat yang baru install,
**saya ingin** disambut dengan layar pembuka yang singkat,
**supaya** app terasa profesional dan saya tidak melihat layar kosong saat loading.

**Kriteria:**
- Splash tampil 1.5–2 detik, lalu auto-pindah
- Pertama install → onboarding; selanjutnya → langsung Beranda

---

### F2. Input Nama Perawat
**Sebagai** perawat baru pakai app,
**saya ingin** mengetik nama panggilan saya,
**supaya** app bisa menyapa saya dan mencocokkan nama di file Excel.

**Kriteria:**
- Input bebas, minimal 2 karakter
- Disimpan sebagai `nurseName` di local storage
- Bisa diedit kemudian di tab "Saya"
- Hint: "Ketik seperti tertulis di jadwal RS"

---

### F3. Import Jadwal dari Excel
**Sebagai** perawat yang menerima file jadwal dari kepala ruangan,
**saya ingin** unggah file .xlsx tersebut ke Jaga,
**supaya** semua shift saya otomatis masuk tanpa mengetik manual.

**Kriteria:**
- Mendukung format .xlsx, .xls, .csv
- Maks file size 5 MB
- Auto-detect kolom (Nama, Tanggal, Shift) dengan heuristik fuzzy match
- Tampilkan pratinjau jadwal yang ter-parse sebelum simpan
- Tampilkan error jelas kalau format tidak dikenali — kasih opsi mapping kolom manual

**Format Excel yang dikenali (minimum):**

| Tipe layout | Contoh kolom | Catatan |
|---|---|---|
| Long format | Nama \| Tanggal \| Shift | Satu baris per shift |
| Wide format | Nama \| 1 \| 2 \| 3 … 31 | Satu kolom per tanggal |

**Kode shift yang dikenali:**
- `P` / `Pagi` / `Morning` → shift pagi (default 07.00–15.00)
- `S` / `Siang` / `Sore` / `Afternoon` → shift siang (default 15.00–23.00)
- `M` / `Malam` / `Night` → shift malam (default 23.00–07.00)
- `L` / `Libur` / `Off` / `-` → libur
- `C` / `Cuti` → cuti

---

### F4. Input Manual Shift
**Sebagai** perawat yang belum dapat file Excel,
**saya ingin** menambahkan shift satu per satu,
**supaya** saya bisa langsung pakai app tanpa nunggu file.

**Kriteria:**
- Akses via tombol "+" floating di tab Jadwal, atau tap kosong di kalender
- Bottom sheet modal: tanggal, jenis shift (P/S/M/L), opsi custom jam, ruangan opsional, catatan opsional
- Bisa input batch (pilih beberapa tanggal dengan shift sama sekaligus)
- Auto-save tanpa konfirmasi tambahan

---

### F5. Lihat Jadwal — Beranda (Tab 1)
**Sebagai** perawat yang sibuk pagi-pagi,
**saya ingin** buka app dan langsung lihat shift hari ini,
**supaya** saya tahu jam berapa harus berangkat.

**Kriteria:**
- Card hero: tanggal, jenis shift, jam mulai–selesai, ruangan, countdown ("18 menit lagi")
- Week strip 5–7 hari ke depan dengan color coding
- Sapaan personal: "Selamat pagi/siang/malam, Sus [Nama]"
- Kalau libur: card khusus "Kamu libur hari ini" yang positif

---

### F6. Lihat Jadwal — Kalender Bulanan (Tab 2)
**Sebagai** perawat,
**saya ingin** lihat overview seluruh shift bulan ini,
**supaya** bisa rencanakan kegiatan pribadi di hari libur.

**Kriteria:**
- Grid 7 kolom (Sen–Min)
- Setiap kotak: tanggal + huruf kecil shift (P/S/M)
- Color-coded: coral (pagi), peach (siang), plum (malam), dashed (libur)
- Tap kotak → detail shift / edit / hapus
- Navigasi bulan sebelumnya / berikutnya
- Card statistik di bawah: total shift, total jam, jumlah malam

---

### F7. Pengingat Pintar (Notifikasi)
**Sebagai** perawat yang gampang lupa setelah shift malam,
**saya ingin** dapat notifikasi sebelum shift dimulai,
**supaya** saya selalu siap berangkat tepat waktu.

**Kriteria:**
- Default reminder: 1 jam sebelum shift mulai
- Bisa diatur: 30 menit / 1 jam / 2 jam sebelum
- Pesan kontekstual per jenis shift:
  - Pagi: "Shift pagi 1 jam lagi. Sarapan dulu, sus!"
  - Siang: "Shift siang dimulai jam [X]. Siap-siap ya."
  - Malam: "Shift malam 1 jam lagi. Kopi sudah?"
- Bisa toggle off per jenis shift di pengaturan
- Permintaan izin notifikasi muncul sekali di onboarding selesai

---

### F8. Tukar Shift via WhatsApp
**Sebagai** perawat yang perlu tukar jadwal dengan kolega,
**saya ingin** kirim ajakan tukar lewat WhatsApp dari dalam app,
**supaya** prosesnya cepat dan terdokumentasi.

**Kriteria:**
- Wizard 3 langkah:
  1. Pilih shift saya yang mau dilepas
  2. Pilih shift kolega yang mau diambil (kalau kolega sudah pernah tukar sebelumnya, datanya tersimpan)
  3. Input nama + nomor WA kolega
- App generate pesan template dalam Bahasa Indonesia sopan
- Tap tombol → buka WhatsApp dengan deep link `wa.me/[nomor]?text=[pesan]`
- Simpan tukar sebagai "menunggu konfirmasi" di Riwayat Tukar
- User update manual statusnya ("disetujui" / "ditolak") setelah dapat balasan WA
- Kalau disetujui → tawarkan tombol "Tukar jadwal sekarang" yang otomatis swap dua shift di kalender

---

### F9. Mode Gelap
**Sebagai** perawat shift malam,
**saya ingin** tampilan app berubah gelap di malam hari,
**supaya** mata saya tidak silau saat ngecek jadwal di kasur.

**Kriteria:**
- 3 mode di pengaturan: Light / Dark / Auto (ikuti sistem)
- Default: Auto
- Mode gelap pakai palet: Forest (#1A2E27) sebagai bg utama, Cream (#FAF6EF) sebagai teks, tetap dengan aksen sage & coral yang disesuaikan kontras
- Transisi halus saat switch mode

---

### F10. Profil & Pengaturan (Tab 4)
**Sebagai** perawat,
**saya ingin** mengubah pengaturan dasar,
**supaya** app sesuai kebiasaan saya.

**Kriteria:**
- Edit nama panggilan
- Set ruangan default (untuk auto-fill input manual)
- Toggle & konfigurasi notifikasi
- Pilih mode gelap
- Import ulang file Excel (overwrite)
- Export jadwal ke .ics (kalender) atau .pdf
- Reset semua data (dengan konfirmasi ganda)
- Tentang app, versi, kebijakan privasi

---

## 6. Out of Scope (V1)

Fitur ini **tidak** masuk MVP, tapi sudah dipertimbangkan untuk V2+:

- ❌ Multi-user / akun cloud (semua data lokal di MVP)
- ❌ Sinkronisasi real-time antar perawat
- ❌ Approval tukar shift dari kepala ruangan
- ❌ Manajemen pasien / handover notes
- ❌ Statistik wellness / fatigue detection
- ❌ Integrasi sistem rumah sakit (HIS/HRIS)
- ❌ Bahasa Indonesia UI (V1 now UK English; ID locale dropped, ID Excel parsing aliases kept)
- ❌ Widget home screen
- ❌ Wear OS / Apple Watch companion

---

## 7. Asumsi & Constraint

### Asumsi
- Perawat punya HP smartphone dengan iOS 14+ atau Android 8+
- Perawat punya WhatsApp terinstall (untuk fitur tukar)
- File Excel jadwal dibagikan dalam format yang relatif konsisten per RS
- Perawat tahu nama panggilannya seperti tertulis di file jadwal

### Constraint teknis
- App ukuran < 30 MB
- Cold start < 2 detik di HP mid-range
- Offline-first: semua fitur kecuali tukar (yang butuh WA) jalan tanpa internet
- Data perawat tidak meninggalkan device di MVP (privacy by design)

### Constraint regulasi
- Tidak menyimpan data pasien (untuk hindari concern PDP/UU PDP)
- Tidak share data ke server pihak ketiga di MVP
- Tampilkan kebijakan privasi sederhana saat first launch

---

## 8. Edge Cases

| Skenario | Penanganan |
|---|---|
| File Excel format tidak dikenali | Tampilkan UI mapping manual (pilih kolom mana = Nama, Tanggal, Shift) |
| Nama perawat tidak ditemukan di file | Tawarkan: ketik ulang nama, atau pilih dari daftar nama yang ada di file |
| Multi-bulan dalam satu file Excel | Parse semua bulan, organize ke kalender masing-masing |
| Shift overlap (input manual 2x di tanggal sama) | Confirm dialog: replace atau cancel |
| Shift malam (23.00–07.00) | Diperlakukan sebagai shift di tanggal mulai, tapi notif besok pagi tetap aktif |
| HP offline saat tukar shift | Generate pesan, simpan ke "Draft", kirim ulang saat online |
| Mengubah jadwal Excel di tengah bulan (re-import) | Tawarkan: replace seluruh data, atau merge dengan input manual yang sudah ada |
| Tidak ada shift sama sekali | Beranda kosong yang ramah: "Belum ada jadwal. Tambah shift atau import Excel." |

---

## 9. Tech Stack

### Framework
- **Expo (managed workflow)** — lebih cepat develop, OTA updates, akses native API mudah. Cocok untuk personal-use MVP. Bisa eject ke bare React Native kalau perlu native module custom.

### Library utama

| Kategori | Library | Alasan |
|---|---|---|
| Navigation | `@react-navigation/native` + `bottom-tabs` + `native-stack` | Standar industri, dokumentasi bagus |
| Local storage | `@react-native-async-storage/async-storage` atau `react-native-mmkv` | MMKV lebih cepat 30x dari AsyncStorage |
| Database (opsional) | `expo-sqlite` | Kalau data shift > 1000 baris, query lebih cepat dengan SQL |
| Date handling | `date-fns` + `date-fns-tz` | Lebih ringan dari moment.js, locale ID bagus |
| Excel parsing | `xlsx` (SheetJS) | Standar, support .xlsx & .csv, mature |
| File picker | `expo-document-picker` | Pilih file dari penyimpanan HP |
| Notifications | `expo-notifications` | Local notification gratis, tidak perlu server |
| Forms | `react-hook-form` + `zod` | Validation type-safe |
| Animations | `react-native-reanimated` v3 | Untuk transisi smooth (splash → onboarding, swipe kalender) |
| Icons | `lucide-react-native` atau `@expo/vector-icons` | Outline style cocok dengan desain |
| Custom fonts | `expo-font` | Load Instrument Serif + Plus Jakarta Sans |
| Haptics | `expo-haptics` | Feedback halus saat tap penting |
| Linking (WA) | `expo-linking` | Built-in, deep link ke WA |
| State management | Zustand atau Context+useReducer | Zustand lebih simple untuk MVP ini |

### Data Model (sederhana)

```typescript
type ShiftCode = 'P' | 'S' | 'M' | 'L' | 'C' | 'CUSTOM';

interface Shift {
  id: string;            // uuid
  date: string;          // ISO date "2026-05-25"
  code: ShiftCode;
  startTime?: string;    // "07:00" — auto-set kalau bukan CUSTOM
  endTime?: string;      // "15:00"
  ward?: string;
  note?: string;
  source: 'excel' | 'manual';
  createdAt: number;     // unix timestamp
  updatedAt: number;
}

interface SwapRecord {
  id: string;
  myShiftId: string;
  colleagueShiftId?: string;  // bisa null kalau belum tau jadwal kolega
  colleagueName: string;
  colleaguePhone: string;
  status: 'pending' | 'approved' | 'rejected';
  messageSent: string;
  sentAt: number;
  resolvedAt?: number;
}

interface UserProfile {
  nurseName: string;
  defaultWard?: string;
  notificationOffset: 30 | 60 | 120;  // menit
  darkMode: 'light' | 'dark' | 'auto';
  excelLastImported?: number;
}
```

---

## 10. Skills yang Dipakai Nanti (Saat Coding)

Saat masuk fase implementasi, saya akan invoke skill `frontend-design` untuk pastikan komponen-komponen yang dibuat:
- Tidak generik (hindari Material Design default)
- Sesuai dengan design system Jaga (cream bg, sage primary, serif numbers)
- Mobile-first, touch target ≥ 44pt
- Accessible (label semantik, contrast WCAG AA)

---

## 11. Estimasi Timeline MVP

**Asumsi: 1 developer full-time, 1 designer part-time**

| Fase | Durasi | Output |
|---|---|---|
| Setup & design system | 1 minggu | Project init Expo, font loading, palet warna, komponen base (Button, Card, Input) |
| Onboarding + storage | 1 minggu | Splash, input nama, struktur navigasi, AsyncStorage/MMKV |
| Input manual + kalender | 1.5 minggu | Tab Jadwal, bottom sheet input shift, kalender bulanan |
| Import Excel | 1.5 minggu | File picker, parse .xlsx, pratinjau, error handling, mapping manual |
| Beranda + Notifikasi | 1 minggu | Tab Beranda, week strip, countdown, local notifications |
| Tukar shift (WA flow) | 1 minggu | Wizard tukar, generate pesan, deep link WA, riwayat tukar |
| Dark mode + Pengaturan | 0.5 minggu | Theme switching, tab Saya, edit profil, export |
| Polish, QA, deploy | 1.5 minggu | Animasi, microcopy, fix bug, build & upload Play Store / TestFlight |

**Total estimasi: ~9 minggu** (sekitar 2 bulan) untuk MVP siap rilis ke teman-teman perawat.

---

## 12. Risiko & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|
| Format Excel terlalu bervariasi, susah di-parse | Tinggi | Tinggi | Sediakan UI mapping manual sebagai fallback; collect contoh file dari early users |
| Perawat skeptis pakai app baru (vs Excel) | Sedang | Sedang | Onboarding sangat singkat (< 1 menit); demo video di Play Store |
| Notifikasi iOS dibatasi platform | Sedang | Rendah | Test extensively, dokumentasi clear soal permission |
| Tukar shift via WA terasa kurang "in-app" | Rendah | Rendah | Pesan template sangat rapi; status tracking jelas di app |
| Ada perubahan jadwal mendadak yang tidak ter-handle | Sedang | Tinggi | Input manual override selalu tersedia; edit shift selalu mudah |

---

## 13. Catatan untuk Fase Berikutnya

Dokumen ini fokus ke **apa** dan **kenapa**. Detail **bagaimana** (komponen React Native spesifik, struktur folder, naming convention) akan dibahas di dokumen technical spec terpisah setelah PRD ini di-approve.

Mockup desain berada di chat (6 layar utama: splash, onboarding nama, beranda, kalender bulanan, import Excel, input manual, tukar shift) — siap dipakai sebagai referensi visual.

**Next steps:**
1. Review PRD ini, kasih masukan / koreksi
2. Tentukan ada/tidak fitur tambahan yang harus masuk MVP
3. Setelah PRD final → mulai setup project Expo + design system
4. Build prototype Beranda + input manual dulu (paling sering dipakai)

---

*Dokumen ini hidup — akan diperbarui seiring belajar dari pengguna awal.*
