# DESIGN.md — Jaga Design System

**Sistem desain aplikasi Jaga**
Versi 1.0 · 25 Mei 2026

Dokumen ini adalah sumber kebenaran (source of truth) untuk semua keputusan visual. Setiap komponen yang dibuat harus mengikuti token dan aturan di sini.

---

## 1. Filosofi Desain

Jaga dipakai oleh perawat yang **lelah, sibuk, dan sering bekerja di lingkungan stres**. Desainnya harus:

- **Tenang, bukan klinis** — hindari estetika rumah sakit klise (putih steril + merah alarm).
- **Editorial, bukan dashboard** — banyak whitespace, tipografi berkarakter, layout asimetris.
- **Hierarki tegas** — info penting (jam shift) terbaca dalam 2 detik dari jarak 1 meter.
- **Hangat dan manusiawi** — sapaan natural, ilustrasi halus, bahasa Indonesia yang nyaman.
- **Anti-AI-slop** — tidak ada gradient ungu-biru, glassmorphism berlebihan, atau emoji 🏥 di mana-mana.

**Mantra desain:** *Jika seorang perawat lelah malam-malam membuka app ini, mereka harus merasa lega, bukan terbebani.*

---

## 2. Color Tokens

Semua warna disimpan sebagai konstanta TypeScript. Tidak pernah pakai hex literal di komponen.

### Light Mode (default)

```typescript
export const colorsLight = {
  // Primary — Sage family
  primary:         '#2D5F4E',  // Deep Sage    — tombol utama, header
  primaryHover:    '#244B3F',  // Forest       — hover state
  primarySoft:     '#DCE8DF',  // Mist         — background card sage
  primaryMuted:    '#5C8475',  // Sage         — text sekunder warna sage

  // Accent — Coral family
  accent:          '#E89B7A',  // Warm Coral   — highlight, badge pagi
  accentSoft:      '#FBE7DC',  // Peach        — background card hangat
  accentDark:      '#C5613A',  // Burnt Coral  — text on peach

  // Night shift — Plum family
  night:           '#4A3B5C',  // Deep Plum    — badge & card shift malam
  nightSoft:       '#EBE4F2',  // Lavender     — background lembut malam

  // Neutral
  background:      '#FAF6EF',  // Cream        — bg utama (BUKAN putih)
  surface:         '#FFFFFF',  // Paper        — bg card di atas cream
  border:          '#E5DDD0',  // Bone         — border lembut
  borderStrong:    '#B4B2A9',  // Stone        — border emphasized

  // Text
  textPrimary:     '#1A2E27',  // Forest       — text utama
  textSecondary:   '#5C7268',  // Sage Muted   — text sekunder
  textTertiary:    '#A5A39B',  // Stone Light  — text disabled/hint
  textInverse:     '#FAF6EF',  // Cream        — text pada bg gelap

  // Semantic
  success:         '#5C8475',  // Sage         — sukses (pakai sage, bukan hijau standar)
  warning:         '#D89542',  // Amber        — peringatan (jarang dipakai)
  danger:          '#B85450',  // Muted Brick  — error (TIDAK pakai merah cerah)
  info:            '#5B7A8E',  // Slate Blue   — informasi (jarang dipakai)
};
```

### Dark Mode

```typescript
export const colorsDark = {
  // Primary
  primary:         '#7FA897',  // Lighter Sage — kontras di dark
  primaryHover:    '#92BAA8',
  primarySoft:     '#2A3F37',  // Dark Sage bg
  primaryMuted:    '#6B8A7E',

  // Accent
  accent:          '#F0B399',  // Lighter Coral
  accentSoft:      '#3D2A22',  // Dark Coral bg
  accentDark:      '#F0B399',

  // Night
  night:           '#8B7CA0',  // Lighter Plum
  nightSoft:       '#2D2438',

  // Neutral
  background:      '#1A2E27',  // Deep Forest — bg utama dark
  surface:         '#243A33',  // Slightly lighter — card bg
  border:          '#3D5048',
  borderStrong:    '#5C7268',

  // Text
  textPrimary:     '#FAF6EF',  // Cream
  textSecondary:   '#B5C2BC',
  textTertiary:    '#7A8C84',
  textInverse:     '#1A2E27',

  // Semantic
  success:         '#7FA897',
  warning:         '#E5B068',
  danger:          '#D17570',
  info:            '#7A98AD',
};
```

### Auto-switching

Mode gelap default ikuti sistem (`Auto`). User bisa override di Pengaturan. Implementasi pakai React Context `<ThemeProvider>` yang expose `useTheme()` hook.

**Auto-trigger:** kalau jam sistem 19.00–05.00 dan mode = Auto, paksa dark.

---

## 3. Typography Tokens

### Font Families

```typescript
export const fonts = {
  display:  'InstrumentSerif-Regular',     // Jam, tanggal besar, hero headings
  body:     'PlusJakartaSans-Regular',     // Semua text UI
  bodyMed:  'PlusJakartaSans-Medium',      // Tombol, label, emphasis
  mono:     'JetBrainsMono-Regular',       // Kode shift (P/S/M), durasi
};
```

**Loading:** pakai `expo-font` di `App.tsx`, tunggu sampai loaded sebelum render UI. Kalau gagal load (offline first-launch), fallback ke `System` font.

**File assets:** download dari Google Fonts, simpan di `/assets/fonts/`:
- `InstrumentSerif-Regular.ttf`
- `PlusJakartaSans-Regular.ttf`
- `PlusJakartaSans-Medium.ttf`
- `JetBrainsMono-Regular.ttf`

### Type Scale

```typescript
export const typography = {
  // Display — pakai Instrument Serif
  displayXL: { fontFamily: fonts.display, fontSize: 52, lineHeight: 52, letterSpacing: -0.02 * 52 },  // Splash logo
  displayLG: { fontFamily: fonts.display, fontSize: 44, lineHeight: 48, letterSpacing: -0.02 * 44 },  // Jam shift utama
  displayMD: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36, letterSpacing: -0.01 * 32 },  // Heading screen
  displaySM: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26, letterSpacing: -0.01 * 22 },  // Nama user di header

  // Body — pakai Plus Jakarta Sans
  bodyLG:    { fontFamily: fonts.body, fontSize: 18, lineHeight: 26 },           // Body besar (jarang)
  bodyMD:    { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },           // Body default
  bodySM:    { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },           // Caption, helper
  bodyXS:    { fontFamily: fonts.body, fontSize: 11, lineHeight: 14 },           // Label kecil, metadata

  // Emphasis (medium 500, BUKAN bold 700)
  labelMD:   { fontFamily: fonts.bodyMed, fontSize: 14, lineHeight: 18 },        // Button text, label
  labelSM:   { fontFamily: fonts.bodyMed, fontSize: 12, lineHeight: 14, letterSpacing: 0.05 * 12, textTransform: 'uppercase' },  // ALL CAPS labels

  // Mono — pakai JetBrains Mono
  monoMD:    { fontFamily: fonts.mono, fontSize: 13, lineHeight: 18 },           // Kode shift, durasi
};
```

### Aturan tipografi

- **Hanya 2 berat font**: 400 (Regular) dan 500 (Medium). **Tidak ada 600 atau 700** — terlalu berat.
- **Sentence case** di semua tempat kecuali label ALL CAPS yang sudah ditentukan.
- **Tidak ada mid-sentence bold** di paragraf. Bold hanya untuk heading dan label.
- **Letter-spacing negatif** untuk display sizes (lebih elegan).
- **Letter-spacing positif** (0.05em) untuk label ALL CAPS (lebih terbaca).

---

## 4. Spacing Tokens

Pakai sistem **4-point grid** — semua spacing kelipatan 4.

```typescript
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
  '6xl': 72,
};
```

### Konvensi spacing

- **Padding card**: `xl` (20) horizontal, `lg` (16) vertical
- **Padding screen**: `2xl` (24) horizontal di top-level, `xl` (20) di nested
- **Gap antar section**: `3xl` (32) di screen utama, `2xl` (24) di sub-screen
- **Gap antar item dalam list**: `md` (12) kalau dense, `lg` (16) kalau biasa
- **Touch target minimum**: 44pt (iOS) / 48dp (Android) — wajib untuk tombol/clickable

---

## 5. Border Radius

```typescript
export const radius = {
  none: 0,
  xs: 4,    // Pill kecil, badge
  sm: 8,    // Button, input
  md: 12,   // Card kecil
  lg: 16,   // Card utama
  xl: 20,   // Card hero (today's shift)
  '2xl': 24,// Modal sheet
  full: 9999, // Pill, circular avatar
};
```

**Aturan:** card di atas card (nested) selalu pakai radius lebih kecil dari parent. Bottom sheet pakai radius hanya di atas (`borderTopLeftRadius`, `borderTopRightRadius`).

---

## 6. Shadow / Elevation

**Filosofi: shadow minimal**. Pakai border atau bg color difference dulu sebelum shadow.

```typescript
export const shadow = {
  none: {
    elevation: 0,
    shadowColor: 'transparent',
  },

  // Card biasa — barely there
  sm: {
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },

  // Floating elements (bottom sheet, FAB)
  md: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  // Modal overlay
  lg: {
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
};
```

**TIDAK** ada glow, drop shadow yang menonjol, atau neon effect.

---

## 7. Component Library

Komponen base yang harus dibangun pertama, di folder `/components/ui/`:

### Primitif
- `<Text>` — wrapper teks dengan variant prop (`displayLG`, `bodyMD`, dll)
- `<Box>` — wrapper layout dengan padding/margin props (mirip Chakra)
- `<Stack>` — vertical layout, `<HStack>` horizontal
- `<Divider>` — pemisah halus (1px border)

### Form & Input
- `<Button>` — variant: `primary`, `secondary`, `ghost`, `danger`. Size: `sm`, `md`, `lg`.
- `<TextInput>` — bordered, dengan label di atas dan helper di bawah
- `<Select>` — picker dengan bottom sheet
- `<DatePicker>` — wrapper modal date picker
- `<Toggle>` — switch on/off
- `<RadioGroup>` — untuk pilih satu (jenis shift)

### Layout
- `<Card>` — surface card dengan padding & radius default
- `<Screen>` — root layout dengan safe area & background
- `<BottomSheet>` — modal yang slide dari bawah
- `<Header>` — header screen dengan back button + title + action

### Display
- `<ShiftBadge>` — pill bertuliskan PAGI/SIANG/MALAM/LIBUR dengan warna sesuai
- `<ShiftCard>` — card display 1 shift (date, time, ward)
- `<TodayHeroCard>` — card besar di Beranda dengan countdown
- `<WeekStrip>` — horizontal scroll 5-7 hari
- `<CalendarGrid>` — kalender bulanan 7x6
- `<EmptyState>` — saat list kosong, dengan ilustrasi & CTA

### Feedback
- `<Toast>` — notifikasi sementara di atas
- `<Dialog>` — confirm dialog
- `<LoadingSpinner>` — sage colored, tidak generic gray

---

## 8. Iconography

**Library:** `lucide-react-native` (outline style, bukan filled).

**Aturan:**
- Stroke width: **1.5** (default), boleh 2 untuk emphasis
- Size: 16 (small), 20 (default), 24 (large), 32 (hero)
- Color: ikuti `textSecondary` di state default, `primary` saat aktif
- Tidak pernah dipakai sebagai dekorasi — selalu punya makna

**Icon mapping (sering dipakai):**
- Home: `Home`
- Calendar: `Calendar`, `CalendarDays`
- Swap: `ArrowLeftRight`, `ArrowsUpDown`
- Profile: `User`, `UserCircle`
- Add: `Plus`
- Edit: `Pencil`
- Delete: `Trash2`
- Time: `Clock`
- Location: `MapPin`
- WhatsApp: `MessageCircle` (atau custom WA logo dari assets)
- Excel/file: `FileSpreadsheet`
- Settings: `Settings`
- Bell: `Bell`
- Moon (dark mode): `Moon`
- Sun (light mode): `Sun`

---

## 9. Motion & Animation

**Filosofi: animasi punya makna, bukan dekorasi.**

### Durasi standar

```typescript
export const motion = {
  duration: {
    fast: 150,      // Hover, tap feedback
    base: 250,      // Default — transisi screen, modal
    slow: 400,      // Bottom sheet, drawer
    deliberate: 600, // Splash, onboarding step transition
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',     // Material standard
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',   // Enter
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',     // Exit
    spring: { damping: 18, stiffness: 200 },         // React Native Reanimated
  },
};
```

### High-impact moments (pakai animasi penuh)

1. **Splash → Onboarding:** fade + slight scale (0.95 → 1)
2. **Splash logo:** jam icon ber-tick sebentar (jarum jam berputar)
3. **Countdown shift:** angka menit berubah dengan flip subtle
4. **Bottom sheet:** slide up 400ms dengan spring (sedikit overshoot)
5. **Switch tab:** cross-fade 150ms
6. **Card tap:** scale 0.98 saat ditekan, kembali 1

### Hindari

- Animasi loop tanpa henti (mengganggu, boros battery)
- Bounce/elastic yang berlebihan
- Parallax pada hover (RN tidak ada hover sentuh)
- Particle effects

### Reduce Motion

Hormati setting OS: `AccessibilityInfo.isReduceMotionEnabled()`. Kalau true, durasi → 0, hanya opacity yang berubah.

---

## 10. Dark Mode Specs

### Aturan konversi

Saat switch dari light ke dark, **bukan** sekadar invert warna. Setiap warna punya pasangan yang dipilih manual untuk preserve mood.

| Token | Light | Dark | Catatan |
|---|---|---|---|
| `background` | Cream `#FAF6EF` | Deep Forest `#1A2E27` | Forest bukan hitam — masih sage di dalamnya |
| `primary` | Deep Sage `#2D5F4E` | Lighter Sage `#7FA897` | Lebih terang biar kontras di dark |
| `accent` | Warm Coral `#E89B7A` | Lighter Coral `#F0B399` | Sedikit lebih soft di dark |
| `text` | Forest `#1A2E27` | Cream `#FAF6EF` | Cream sebagai text, bukan putih murni |

### Komponen-spesifik

- **Hero card** (today's shift): bg Deep Sage di light → tetap Deep Sage di dark (tidak perlu change, sudah gelap)
- **Card surface**: `#FFFFFF` di light → `#243A33` di dark (slightly lighter dari bg)
- **Border**: visible di light, hampir invisible di dark (gunakan border-strong only kalau perlu)
- **Status bar**: ikuti theme (`StatusBar` style `dark-content` di light, `light-content` di dark)

---

## 11. Microcopy & Voice

UK English — warm, professional, conversational. Never corporate-sterile, never overly clinical.

### Rules

- Address the user as **"you"** — never "the user" or "one"
- Use the nurse's first name when known (from profile), otherwise just "Hi" or no salutation
- Avoid stiff verbs: "Submit" → "Save", "OK" → "Done" or "Got it", "Cancel" → "Cancel" (fine)
- UK spelling: colour, favourite, organise, behaviour, centre
- Error messages don't blame the user — describe what happened + how to fix
- Keep it short. A nurse on a 12-hour shift doesn't want to read prose.

### Microcopy examples

| Context | ❌ Bad | ✅ Good |
|---|---|---|
| Name input | "Please enter your full name" | "What should we call you?" |
| Home empty state | "No data available" | "No shifts yet. Add one or import from Excel." |
| Excel parse error | "Invalid format" | "Couldn't read this file. Try mapping the columns manually." |
| Save success | "Data saved successfully" | "Saved." |
| Day off card | "No shift today" | "You're off today." |
| Morning shift reminder | "Your shift starts soon" | "Morning shift in 1 hour. Time for breakfast." |
| Night shift reminder | "Night shift reminder" | "Night shift in 1 hour. Got your coffee?" |
| Swap confirm | "Confirm swap" | "Swap your shift with Maya?" |
| Reset confirm | "Are you sure?" | "Reset everything? This can't be undone." |

### Time-based greetings

- 04:00–11:59: "Good morning"
- 12:00–17:59: "Good afternoon"
- 18:00–21:59: "Good evening"
- 22:00–03:59: "Working late?" or "Good night"

### Shift label vocabulary (UK nursing context)

- P → **Morning** (07:00–15:00, "early shift" in NHS)
- S → **Afternoon** (15:00–23:00, "late shift" in NHS)
- M → **Night** (23:00–07:00)
- L → **Off** (rest day)
- C → **Leave** (annual leave / planned time off)
- CUSTOM → **Custom**

---

## 12. Accessibility

### Minimum requirements

- **Contrast ratio**: WCAG AA — 4.5:1 untuk body text, 3:1 untuk text besar
- **Touch target**: minimum 44pt × 44pt (iOS), 48dp × 48dp (Android)
- **Screen reader**: semua tombol dan input punya `accessibilityLabel`
- **Focus indicator**: visible saat keyboard navigation (untuk Android dengan keyboard)
- **Reduce motion**: hormati setting OS (lihat section Motion)
- **Font scaling**: dukung dynamic type, batasi maksimum 1.3x scale supaya layout tidak rusak

### Cek otomatis

Pakai library `react-native-a11y-checker` di dev mode.

---

## 13. Asset Pipeline

### Folder structure

```
/assets
  /fonts/
    InstrumentSerif-Regular.ttf
    PlusJakartaSans-Regular.ttf
    PlusJakartaSans-Medium.ttf
    JetBrainsMono-Regular.ttf
  /images/
    splash-logo.png       (3x: 192px)
    splash-logo@2x.png
    splash-logo@3x.png
    empty-no-shift.png    (ilustrasi empty state)
    empty-no-swap.png
  /icons/
    (kalau ada custom icon di luar Lucide)
```

### Image specs

- App icon: 1024×1024 PNG (untuk store), generate ukuran lain pakai `expo-cli`
- Splash logo: 192×192 minimum, SVG kalau bisa
- Ilustrasi empty state: WebP atau PNG, max 80KB per file

---

## 14. Don'ts — Hal yang Dilarang

❌ Pakai font Inter, Roboto, San Francisco default
❌ Gradient ungu-biru atau gradient apapun untuk background utama
❌ Drop shadow tebal yang bikin floating berlebihan
❌ Emoji di label / button (boleh sebagai konten user, bukan UI)
❌ Border-radius lebih besar dari `2xl` (24) — kecuali pill
❌ Warna merah cerah (#FF0000) untuk error — pakai `danger` token (muted brick)
❌ Animasi loop tanpa henti (loading spinner OK karena ada konteks)
❌ Toast lebih dari 3 detik
❌ Modal di atas modal (kecuali alert OS)
❌ Lebih dari 2 warna primary di satu screen

---

## 15. Referensi Inspirasi

Untuk konsistensi tone aesthetic, lihat:
- **Headspace** mobile app — calming, editorial type
- **Linear** desktop — restraint, intentional spacing
- **Arc browser** — playful tapi tidak childish
- **Things 3** (Cultured Code) — clean, tidak generic

**Bukan referensi:**
- Material Design default (terlalu generik)
- Apple Health (terlalu klinis)
- Aplikasi rumah sakit konvensional

---

*Dokumen ini di-update setiap kali ada keputusan desain baru. Setiap perubahan harus didiskusikan dulu sebelum merge.*
