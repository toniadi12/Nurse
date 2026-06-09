# CLAUDE.md — Jaga

Aplikasi React Native (Expo) untuk perawat Indonesia mengelola jadwal jaga shift.

## Konteks Project

Dokumen detail di-import di bawah. Baca semuanya sebelum mengerjakan task apapun di codebase ini.

- Product requirements: @PRD-Jaga.md
- Design system & visual rules: @DESIGN.md
- Technical decisions & architecture: @TECH-STACK.md

## Tech Stack Ringkas

- **Framework:** Expo SDK 51+ (managed workflow), TypeScript strict mode
- **Routing:** Expo Router (file-based)
- **State:** React Context + useReducer (**JANGAN pakai Zustand, Redux, MobX, atau library state lainnya**)
- **Storage:** react-native-mmkv (sync access)
- **Forms:** react-hook-form + zod
- **Animations:** react-native-reanimated v3
- **Excel:** xlsx (SheetJS)
- **Notifications:** expo-notifications (local only, tidak ada push server)
- **Date:** date-fns (locale: id) — **JANGAN pakai moment.js atau dayjs**
- **Icons:** lucide-react-native (outline style, stroke 1.5)

## Language & Audience

- **All user-facing UI text in UK English** (natural, warm, professional — see DESIGN.md section 11)
- Target audience: expat nurses / international hospitals (e.g., Siloam, RSIA chains, KPJ). Use plain English, not corporate jargon.
- Use "you" not "one"; address nurse as "nurse" generically or by name. Avoid overly formal/clinical phrasing.
- UK spelling conventions: "colour" not "color", "favourite" not "favorite", "centre" not "center"
- Code comments OK in either ID or EN — but variable/function names always English (was already the rule)
- Excel parser keeps Indonesian shift code aliases (P/Pagi/M/Malam etc.) for backward compat with files from Indonesian hospitals

## Aturan Clean Code (WAJIB diikuti)

1. **Self-documenting code**: nama variabel dan fungsi jelas — `nightShiftCount` bukan `n`
2. **No magic numbers**: angka literal → konstanta bernama (`const NIGHT_SHIFT_HOURS = 8`)
3. **Single Responsibility**: satu fungsi = satu pekerjaan
4. **File size limit**: maksimal 300 baris per file — kalau lebih, split
5. **No `any`**: TypeScript strict, pakai `unknown` lalu narrow kalau perlu
6. **Folder by feature**: komponen domain shift di `/components/shift/`, bukan di `/components/`
7. **Komentar untuk "kenapa", bukan "apa"**: code menjelaskan apa, komentar menjelaskan alasan

### Contoh konkrit

```typescript
// ❌ Buruk
const x = s.filter(i => i.c === 'M').length;

// ✅ Bagus
const NIGHT_SHIFT_CODE = 'M' as const;
const nightShiftCount = shifts.filter(
  shift => shift.code === NIGHT_SHIFT_CODE
).length;
```

## Konvensi Naming

- **Komponen**: PascalCase — `TodayHeroCard.tsx`
- **Hook**: camelCase prefix `use` — `useShifts.ts`, `useTheme.ts`
- **Utility/helper**: camelCase — `excelParser.ts`, `dateUtils.ts`
- **Constants**: UPPER_SNAKE_CASE — `const SHIFT_CODES = { ... }`
- **Types & interfaces**: PascalCase — `interface Shift`, `type ShiftCode`
- **File test**: `[name].test.ts` sejajar dengan source file

## Struktur Folder

```
app/                    # Expo Router screens
src/
  components/
    ui/                 # Komponen primitif (Button, Card, Text, Screen)
    shift/              # Komponen domain shift
    swap/               # Komponen domain tukar shift
    calendar/           # Komponen kalender
  context/              # React Context providers
    shifts/             # shiftTypes, shiftReducer, ShiftProvider, useShifts
    profile/
    theme/
  lib/                  # Pure utility functions
    excelParser.ts
    dateUtils.ts
    storage.ts          # MMKV wrapper
    notifications.ts
    whatsapp.ts         # WA deep link helpers
  theme/                # Design tokens (colors, typography, spacing)
  hooks/                # Custom React hooks (di luar context)
  types/                # TypeScript types
  constants/            # Konstanta non-design
```

## Design Tokens (TIDAK BOLEH HARDCODE WARNA / FONT)

Selalu import dari `src/theme/`:

```typescript
// ❌ JANGAN
<View style={{ backgroundColor: '#2D5F4E', padding: 16 }}>

// ✅ HARUS
import { colors, spacing } from '@/theme';
<View style={{ backgroundColor: colors.primary, padding: spacing.lg }}>
```

Pakai hook `useTheme()` untuk akses theme yang otomatis ikut light/dark mode:

```typescript
const { colors, typography } = useTheme();
```

## Build Commands

```bash
# Development
npx expo start                  # Start Expo dev server
npx expo start --android        # Open di Android
npx expo start --ios            # Open di iOS

# Code quality (jalankan sebelum commit)
npm run lint                    # ESLint check
npm run lint:fix                # Auto-fix lint errors
npm run typecheck               # TypeScript check
npm test                        # Jest tests

# Build
eas build --profile development # Dev build
eas build --profile production  # Production build
```

## Aturan Saat Mengerjakan Task

1. **Sebelum bikin komponen baru**, cek `/src/components/ui/` — mungkin sudah ada primitif yang bisa dipakai
2. **Sebelum bikin utility baru**, cek `/src/lib/` — hindari duplikasi
3. **Setiap fitur baru harus punya types** di `/src/types/` atau co-located di file fitur
4. **State management**: kalau state cuma dipakai 1 komponen → `useState`. Kalau dipakai 2+ → angkat ke Context yang sesuai.
5. **Bahasa Excel parsing**: kode shift Indonesia (P/S/M/L) dan English (Morning/Night/Off) sama-sama harus dikenali — lihat PRD section 5 F3

## Yang DILARANG di Project Ini

❌ **Pakai library state management eksternal** (Zustand, Redux, MobX, Jotai) — pakai Context + useReducer
❌ **Pakai font generik** (Inter, Roboto, Arial) — pakai Instrument Serif + Plus Jakarta Sans
❌ **Hardcode warna hex di komponen** — selalu via theme tokens
❌ **Pakai `any` di TypeScript** — pakai `unknown` lalu narrow
❌ **Komponen "God" yang melakukan banyak hal** — split jadi komponen-komponen kecil
❌ **Gradient ungu-biru** atau gradient apapun untuk background (lihat DESIGN.md section 14)
❌ **Library yang tidak ada di TECH-STACK.md** tanpa diskusi dulu
❌ **Inline styles yang panjang** — extract ke StyleSheet atau styled wrapper
❌ **Mutate state langsung** — selalu return state baru di reducer
❌ **Skip TypeScript types** — semua props, return values, state harus ada type

## Catatan Untuk Sesi Coding

- Project ini adalah **proyek belajar** untuk pemilik (perawat / pengembang Indonesia). Tulis kode yang bisa diajarkan, bukan kode tercepat.
- Tambahkan komentar tutorial di file-file kritis (excelParser, shiftReducer, notifications scheduler) yang menjelaskan **kenapa** keputusan teknis diambil.
- Saat ragu antara "cara cepat" dan "cara yang lebih jelas", **pilih yang lebih jelas**.
- Setelah selesai task, **jelaskan apa yang dikerjakan** dengan bahasa awam — bagian mana yang menarik untuk dipelajari.

---

*Update file ini setiap kali ada keputusan teknis baru yang harus persist lintas session.*
