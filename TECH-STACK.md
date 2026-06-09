# TECH-STACK.md — Jaga

**Keputusan teknis dan justifikasi untuk aplikasi Jaga**
Versi 1.0 · 25 Mei 2026

Dokumen ini menjelaskan **apa** yang dipakai dan **kenapa**. Setiap pilihan disertai alasan dan alternatif yang dipertimbangkan, supaya keputusan bisa di-review ulang kalau konteks berubah.

---

## 1. Ringkasan Stack

| Layer | Pilihan | Versi target |
|---|---|---|
| Framework | Expo SDK (managed) | SDK 54 (di-pin — Expo Go tester) |
| Bahasa | TypeScript | 5.3+ |
| UI | React Native | 0.74+ |
| Routing | Expo Router (file-based) | 3.x |
| State | React Context + useReducer | built-in |
| Storage | AsyncStorage (revised — lihat §6) | latest |
| Forms | react-hook-form + zod | 7.x / 3.x |
| Animations | React Native Reanimated | 3.x |
| Excel parsing | SheetJS (xlsx) | 0.20.x |
| Notifications | expo-notifications | latest |
| Date | date-fns | 3.x |
| Icons | lucide-react-native | latest |
| Linting | ESLint + Prettier | latest |
| Testing | Jest + React Native Testing Library | latest |

---

## 2. Framework — Expo (Managed Workflow)

### Pilihan: **Expo SDK 54** dengan EAS Build

> **Catatan revisi (2026-05-27):** SDK 56 sebelumnya ke-pick saat scaffold awal, tapi Expo Go tester pakai client SDK 54 (dari Play Store / device lama). Diturunkan ke SDK 54 supaya tester bisa pakai Expo Go langsung tanpa custom dev client. SDK 54 = React 19.1, RN 0.81 — masih sangat current.

### Kenapa Expo bukan Bare React Native

| Aspek | Expo Managed | Bare React Native |
|---|---|---|
| Setup awal | 5 menit (`npx create-expo-app`) | 1-2 jam (Xcode + Android Studio + native config) |
| Iterasi development | Expo Go, instan | Rebuild native tiap ada perubahan native |
| Native modules | Terbatas pada Expo SDK (tapi sudah sangat lengkap) | Apapun bisa |
| Build & deploy | EAS Build (cloud) | Build sendiri / fastlane |
| OTA updates | Built-in via EAS Update | Pakai CodePush atau setup sendiri |
| Cocok untuk | Personal app, MVP, indie dev | App dengan custom native module berat |

**Keputusan:** Jaga adalah personal-use MVP tanpa kebutuhan native modul khusus. Expo memberikan velocity 5-10x lebih tinggi. Kalau nanti perlu native module yang tidak ada di Expo SDK, bisa pakai **Expo Development Build** (custom dev client) — middle ground yang tetap punya benefit Expo tapi bisa tambah native code.

### Alternatif yang dipertimbangkan

- **Bare React Native** — terlalu overkill untuk MVP, slower iteration
- **Flutter** — bukan React, learning curve baru. RN lebih cocok kalau dev sudah JS/React.
- **Native (Swift + Kotlin)** — 2x effort untuk maintain 2 codebase, tidak masuk akal untuk MVP single dev.

---

## 3. Bahasa — TypeScript

### Pilihan: **TypeScript 5.3+** dengan strict mode

### Konfigurasi `tsconfig.json` (key settings)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Kenapa wajib pakai TypeScript

- Type safety untuk data shift (`ShiftCode`, dates) — mencegah bug "string yang seharusnya enum"
- IDE autocomplete = development lebih cepat
- Refactoring aman — rename property tertangkap di seluruh codebase
- Self-documenting — type signature = dokumentasi mini

### Anti-pattern yang dihindari

- ❌ `any` (banned via ESLint rule `@typescript-eslint/no-explicit-any`)
- ❌ `as unknown as X` casting (banned kecuali ada komentar justifikasi)
- ✅ Pakai discriminated unions untuk state (`type State = { kind: 'loading' } | { kind: 'data'; value: T }`)

---

## 4. Routing — Expo Router

### Pilihan: **Expo Router 3.x** (file-based routing)

### Struktur folder routing

```
/app
  _layout.tsx                  # Root layout (theme provider, fonts)
  index.tsx                    # Splash → redirect
  /onboarding
    _layout.tsx               # Stack navigator untuk onboarding
    name.tsx                  # Step 1
    import-or-manual.tsx      # Step 2
    confirm.tsx               # Step 3
  /(tabs)
    _layout.tsx               # Bottom tab navigator
    index.tsx                 # Tab 1: Beranda
    schedule.tsx              # Tab 2: Jadwal
    swap.tsx                  # Tab 3: Tukar
    profile.tsx               # Tab 4: Saya
  /shift
    [id].tsx                  # Detail shift dynamic route
    new.tsx                   # Add manual shift (modal)
    edit/[id].tsx
  /swap
    new.tsx                   # New swap wizard
    [id].tsx                  # Detail swap
```

### Kenapa Expo Router bukan React Navigation langsung

- File-based = struktur app lebih jelas dari folder tree
- Deep linking otomatis (penting untuk notifikasi yang tap → buka shift detail)
- Pakai React Navigation di belakang layar, jadi semua API masih kompatibel
- Type-safe routing dengan `typed-routes` (auto-generate types)

---

## 5. State Management — React Context + useReducer

### Pilihan: **Built-in React (Context API + useReducer hook)**

Tidak pakai library state management eksternal (Zustand, Redux, MobX, dll). Kita pakai apa yang sudah ada di React.

### Kenapa Context + useReducer (bukan Zustand atau Redux)

| Kriteria | Context + useReducer | Zustand | Redux Toolkit |
|---|---|---|---|
| Library tambahan | Tidak (built-in React) | Ya (1.2 KB) | Ya (12 KB+) |
| Learning value | Tinggi (pattern React standar) | Rendah (abstraksi) | Tinggi (tapi over-engineered) |
| Boilerplate | Sedang | Sangat sedikit | Sedang (RTK kurangi) |
| Type safety | Excellent (full TS) | Excellent | Excellent |
| Cocok untuk Jaga | ✓ | ✓ | Overkill |

**Alasan utama:** App ini dibuat untuk **belajar**. Memahami `useReducer` + Context API = fondasi React yang akan kepakai di semua project React/RN ke depannya. Library seperti Zustand menyembunyikan kompleksitas yang justru perlu dipahami dulu.

### Pattern yang dipakai

Pattern standar: **State + Action + Reducer + Provider + Custom Hook**

```typescript
// src/context/shifts/shiftTypes.ts
// 1. Define state shape
export interface ShiftState {
  shifts: Record<string, Shift>; // keyed by ISO date "2026-05-25"
  isLoading: boolean;
  error: string | null;
}

// 2. Define semua aksi yang mungkin (discriminated union)
export type ShiftAction =
  | { type: 'SHIFTS_LOADED'; payload: Record<string, Shift> }
  | { type: 'SHIFT_ADDED'; payload: Shift }
  | { type: 'SHIFT_REMOVED'; payload: { date: string } }
  | { type: 'SHIFTS_IMPORTED'; payload: Shift[] }
  | { type: 'SHIFTS_CLEARED' }
  | { type: 'ERROR_OCCURRED'; payload: string };
```

```typescript
// src/context/shifts/shiftReducer.ts
import type { ShiftState, ShiftAction } from './shiftTypes';

export const initialShiftState: ShiftState = {
  shifts: {},
  isLoading: false,
  error: null,
};

// Pure function: (state, action) => newState
// Tidak boleh ada side-effect di sini!
export function shiftReducer(
  state: ShiftState,
  action: ShiftAction
): ShiftState {
  switch (action.type) {
    case 'SHIFTS_LOADED':
      return { ...state, shifts: action.payload, isLoading: false };

    case 'SHIFT_ADDED':
      return {
        ...state,
        shifts: {
          ...state.shifts,
          [action.payload.date]: action.payload,
        },
      };

    case 'SHIFT_REMOVED': {
      const { [action.payload.date]: _, ...remaining } = state.shifts;
      return { ...state, shifts: remaining };
    }

    case 'SHIFTS_IMPORTED': {
      const indexed = action.payload.reduce<Record<string, Shift>>(
        (acc, shift) => ({ ...acc, [shift.date]: shift }),
        {}
      );
      return { ...state, shifts: { ...state.shifts, ...indexed } };
    }

    case 'SHIFTS_CLEARED':
      return { ...state, shifts: {} };

    case 'ERROR_OCCURRED':
      return { ...state, error: action.payload, isLoading: false };

    default:
      return state;
  }
}
```

```typescript
// src/context/shifts/ShiftProvider.tsx
import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import { shiftReducer, initialShiftState } from './shiftReducer';
import { shiftStorage } from '@/lib/storage';
import type { Shift } from '@/types';

interface ShiftContextValue {
  state: ShiftState;
  addShift: (shift: Shift) => void;
  removeShift: (date: string) => void;
  importShifts: (shifts: Shift[]) => void;
  clearShifts: () => void;
}

export const ShiftContext = createContext<ShiftContextValue | null>(null);

export function ShiftProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(shiftReducer, initialShiftState);

  // Load shifts from storage saat app start
  useEffect(() => {
    const loaded = shiftStorage.loadAll();
    dispatch({ type: 'SHIFTS_LOADED', payload: loaded });
  }, []);

  // Persist setiap kali shifts berubah
  useEffect(() => {
    shiftStorage.saveAll(state.shifts);
  }, [state.shifts]);

  // Action creators dibungkus useCallback untuk stable reference
  const addShift = useCallback((shift: Shift) => {
    dispatch({ type: 'SHIFT_ADDED', payload: shift });
  }, []);

  const removeShift = useCallback((date: string) => {
    dispatch({ type: 'SHIFT_REMOVED', payload: { date } });
  }, []);

  const importShifts = useCallback((shifts: Shift[]) => {
    dispatch({ type: 'SHIFTS_IMPORTED', payload: shifts });
  }, []);

  const clearShifts = useCallback(() => {
    dispatch({ type: 'SHIFTS_CLEARED' });
  }, []);

  return (
    <ShiftContext.Provider
      value={{ state, addShift, removeShift, importShifts, clearShifts }}
    >
      {children}
    </ShiftContext.Provider>
  );
}
```

```typescript
// src/context/shifts/useShifts.ts
import { useContext } from 'react';
import { ShiftContext } from './ShiftProvider';

// Custom hook untuk consume context dengan safe-guard
export function useShifts() {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShifts harus dipakai di dalam <ShiftProvider>');
  }
  return context;
}
```

### Cara pakai di komponen

```typescript
// app/(tabs)/index.tsx
import { useShifts } from '@/context/shifts/useShifts';

export default function HomeScreen() {
  const { state, addShift } = useShifts();
  const todayShift = state.shifts[todayISO];

  return (
    <Screen>
      {todayShift ? (
        <TodayHeroCard shift={todayShift} />
      ) : (
        <EmptyState onAdd={() => addShift(newShift)} />
      )}
    </Screen>
  );
}
```

### Struktur Context yang dipakai

Ada **3 context terpisah** supaya tidak semua komponen re-render saat ada perubahan kecil:

| Context | State | Provider lokasi |
|---|---|---|
| `ShiftContext` | Semua shift, loading, error | Wrap (tabs) layout |
| `ProfileContext` | Nama, ruangan default, notif settings | Wrap root layout |
| `ThemeContext` | Mode gelap (light/dark/auto), tokens | Wrap root layout |

### Kenapa terpisah, bukan satu Context besar?

Kalau satu Context untuk semua, **setiap perubahan akan trigger re-render** semua komponen yang pakai context tersebut. Pisah berdasarkan domain → komponen yang cuma butuh tema tidak re-render saat shift baru ditambah.

### Trade-off yang harus dipahami

✅ **Pro:**
- Tidak ada library tambahan, bundle size minimum
- Pattern standar yang akan dipakai di project React manapun
- Eksplisit — action flow gampang di-trace (search "SHIFT_ADDED" di codebase)
- Easy testing — reducer adalah pure function

❌ **Con:**
- Boilerplate lebih banyak dari Zustand (~3x kode)
- Tidak ada DevTools built-in seperti Redux
- Performance memerlukan perhatian (Context value harus stable, pakai `useMemo`/`useCallback`)

Untuk app dengan skala Jaga (4 tab, ~10 screen), trade-off ini worth it untuk tujuan learning.

---

## 6. Storage — AsyncStorage (revised dari MMKV)

> **Keputusan revisi (2026-05-26):** semula MMKV, diubah ke AsyncStorage karena MMKV butuh native binary yang tidak ada di Expo Go. Target tester awal pakai HP low/mid-range Android dan distribusi via Expo Go (tidak perlu build custom APK). AsyncStorage cukup untuk skala data Jaga (~100–1000 shift). Kalau performa storage jadi bottleneck di production, bisa migrasi ke MMKV via Expo Dev Client tanpa ubah call-site (di-wrap di `src/lib/storage.ts`).

### Pilihan: **@react-native-async-storage/async-storage** (terinstall, Expo Go compatible)

### Catatan original (MMKV — disimpan untuk referensi V2)

### Kenapa bukan AsyncStorage

| Aspek | MMKV | AsyncStorage |
|---|---|---|
| Kecepatan | ~30x lebih cepat | Lambat |
| Sync API | Ya (tidak perlu await) | Tidak (semua async) |
| Encryption | Built-in (opsional) | Tidak |
| Ukuran data | Cocok untuk MB-level | < 6 MB rekomendasi |

Untuk Jaga, MMKV ideal karena data shift di-read sangat sering (setiap buka tab, render kalender). Akses sync bikin UX terasa instan.

### Alternatif yang dipertimbangkan

- **expo-sqlite** — overkill untuk data 100-1000 baris. Pakai nanti kalau perlu query kompleks.
- **realm-js** — heavy dependency, learning curve.

### Strategi data

- Semua data shift, profile, settings: MMKV
- File Excel asli: TIDAK disimpan (cuma di-parse, ambil data, lalu buang)
- File yang di-export (.ics, .pdf): simpan ke `expo-file-system` cache

---

## 7. Excel Parsing — SheetJS

### Pilihan: **xlsx (SheetJS Community Edition) 0.20.x**

### Kenapa SheetJS

- Mature (10+ tahun), de-facto standard untuk parse Excel di JS
- Support format: .xlsx, .xls, .csv, .ods
- Pure JS — tidak butuh native module
- Lisensi Apache 2.0 (free untuk komersial)

### Strategi parsing

```typescript
// src/lib/excelParser.ts
import * as XLSX from 'xlsx';

export interface ParsedShift {
  date: string;       // ISO
  code: ShiftCode;
  rawCell: string;    // untuk debugging
  rowIndex: number;
}

export interface ParseResult {
  success: boolean;
  shifts: ParsedShift[];
  layout: 'long' | 'wide' | 'unknown';
  warnings: string[];
  errors: string[];
}

export function parseExcel(
  buffer: ArrayBuffer,
  nurseName: string
): ParseResult {
  // 1. Read workbook
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });

  // 2. Detect layout (long vs wide)
  const layout = detectLayout(wb);

  // 3. Parse sesuai layout
  if (layout === 'long')  return parseLongFormat(wb, nurseName);
  if (layout === 'wide')  return parseWideFormat(wb, nurseName);

  // 4. Fallback: tampilkan UI mapping manual
  return { success: false, layout: 'unknown', /* ... */ };
}
```

### Edge case yang di-handle

- Multi-sheet workbook → ambil sheet pertama, atau biarkan user pilih
- Merged cells → unmerge sebelum parse
- Header di row ke-N (bukan row 1) → fuzzy detect baris header dengan keyword "Nama", "Tanggal"
- Tanggal sebagai serial number Excel → konversi ke ISO date
- Encoding aneh (CSV dari Windows) → coba UTF-8 dulu, fallback ke Windows-1252

---

## 8. Notifications — expo-notifications

### Pilihan: **expo-notifications**

### Strategi

- **Hanya local notifications** di MVP (tidak butuh server push)
- Schedule notification saat shift ditambah/diimpor
- Re-schedule semua notif saat user ubah offset di settings
- Cancel notif saat shift dihapus

### Contoh API

```typescript
import * as Notifications from 'expo-notifications';
import { subMinutes } from 'date-fns';

export async function scheduleShiftReminder(
  shift: Shift,
  offsetMinutes: number
) {
  const shiftStart = parseShiftStartTime(shift);
  const triggerDate = subMinutes(shiftStart, offsetMinutes);

  if (triggerDate < new Date()) return; // sudah lewat

  await Notifications.scheduleNotificationAsync({
    identifier: `shift-${shift.id}`,
    content: {
      title: getReminderTitle(shift.code),       // "Shift pagi 1 jam lagi"
      body: getReminderBody(shift.code),         // "Sarapan dulu, sus."
      data: { shiftId: shift.id, type: 'reminder' },
    },
    trigger: triggerDate,
  });
}
```

### Permission flow

1. Saat onboarding selesai, tawarkan: "Mau aktifkan pengingat shift?"
2. Trigger `Notifications.requestPermissionsAsync()`
3. Kalau ditolak, simpan flag — jangan tanya lagi sampai user buka Pengaturan

---

## 9. Date Handling — date-fns

### Pilihan: **date-fns 3.x** (bukan moment.js, bukan dayjs)

### Kenapa date-fns

- Tree-shakeable — hanya bundle fungsi yang dipakai (vs moment.js yang 67KB minimum)
- Immutable — semua fungsi return Date baru, tidak mutate
- Locale support bagus — `date-fns/locale/id` untuk Bahasa Indonesia

### Fungsi yang sering dipakai

```typescript
import { format, parseISO, addDays, differenceInMinutes, isToday } from 'date-fns';
import { id } from 'date-fns/locale';

format(new Date(), "EEEE, d MMMM yyyy", { locale: id });
// → "Senin, 25 Mei 2026"

differenceInMinutes(shiftStartDate, new Date());
// → 18 (menit sampai shift mulai)
```

### Timezone

Aplikasi pakai timezone device. Tidak ada konversi UTC karena semua shift dalam zona waktu lokal perawat. Simpan tanggal sebagai **"YYYY-MM-DD"** string (bukan ISO timestamp full) untuk hindari bug timezone shift.

---

## 10. Forms — react-hook-form + zod

### Pilihan: **react-hook-form 7.x** + **zod 3.x**

### Kenapa kombinasi ini

- `react-hook-form` — performant (minimal re-render), API simple
- `zod` — runtime validation + TypeScript type inference dari schema

### Contoh

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const ShiftFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  code: z.enum(['P', 'S', 'M', 'L', 'CUSTOM']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  ward: z.string().max(50).optional(),
  note: z.string().max(200).optional(),
});

type ShiftFormData = z.infer<typeof ShiftFormSchema>;

function AddShiftForm() {
  const { control, handleSubmit } = useForm<ShiftFormData>({
    resolver: zodResolver(ShiftFormSchema),
  });
  // ...
}
```

---

## 11. Animations — Reanimated 3

### Pilihan: **react-native-reanimated 3.x**

### Kenapa bukan `Animated` built-in

- Reanimated jalan di **UI thread** (60 FPS smooth, tidak ke-block JS thread)
- Worklets — bisa write animation logic di JS, dijalankan native
- Library standar untuk animasi kompleks di RN

### Pemakaian di Jaga

- Splash logo (jam berputar)
- Bottom sheet (slide up dengan spring)
- Card tap feedback (scale 0.98)
- Countdown angka (flip subtle)
- Page transitions (cross-fade)

---

## 12. Icons — lucide-react-native

### Pilihan: **lucide-react-native** (outline style)

### Alternatif yang ditolak

- `@expo/vector-icons` — banyak set (Ionicons, MaterialIcons), tapi gaya kurang konsisten
- `react-native-vector-icons` — lama, manual link
- `Phosphor` — bagus, tapi lebih heavy

Lucide punya 1400+ icon, outline-only, stroke konsisten — cocok dengan estetika Jaga.

---

## 13. Linting & Code Quality

### ESLint config

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@react-native',
    'plugin:@typescript-eslint/strict',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

### Prettier config

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

### Pre-commit hook

Pakai `husky` + `lint-staged` — auto-format dan auto-lint setiap commit.

---

## 14. Testing Strategy

### Level testing

| Level | Tool | Coverage target |
|---|---|---|
| Unit (utils, parsers) | Jest | 80%+ |
| Component | React Native Testing Library | Komponen kritis: shift card, calendar, form |
| Integration | RNTL + MSW | Flow onboarding, import Excel, add shift |
| E2E | Maestro (opsional, V2) | Smoke test path utama |

### Yang HARUS di-test

1. `excelParser.ts` — semua varian format Excel
2. `dateUtils.ts` — edge case shift malam (overflow ke hari berikutnya)
3. `notificationScheduler.ts` — re-schedule saat ubah offset
4. Component `<TodayHeroCard>` — countdown akurat

---

## 15. Performance Targets

| Metrik | Target | Cara ukur |
|---|---|---|
| Cold start (Android mid-range) | < 2 detik | `expo-perf-monitor` |
| Tab switch | < 100ms | Reanimated frame time |
| Render kalender bulanan | < 200ms | React DevTools Profiler |
| Parse Excel 100 baris | < 500ms | `console.time` |
| Bundle size (Android APK) | < 30 MB | Android Studio analyzer |

### Optimisasi yang sudah direncanakan

- Lazy load tab Tukar dan Saya (jarang dipakai dibanding Beranda)
- Memoize render kalender cell dengan `React.memo`
- Pakai `FlatList` untuk list riwayat tukar (bukan `ScrollView`)
- Image splash dimuat eager, asset lain lazy

---

## 16. Build & Deploy

### Pilihan: **EAS Build** + **EAS Submit**

```bash
# Development build (untuk testing native module custom kalau perlu)
eas build --profile development --platform android

# Preview build (TestFlight / internal testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit ke store
eas submit --platform ios
eas submit --platform android
```

### Environment variables

Pakai `expo-constants` + `.env`:

```
# .env.production
APP_ENV=production
SUPPORT_EMAIL=halo@jaga.app
PRIVACY_URL=https://jaga.app/privacy
```

### Code signing

- iOS: auto-managed by EAS (tidak perlu cert manual)
- Android: keystore stored di EAS secrets, auto-sign

---

## 17. Folder Structure (Final)

```
jaga/
├── app/                      # Expo Router screens
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── onboarding/
│   ├── (tabs)/
│   ├── shift/
│   └── swap/
├── src/
│   ├── components/
│   │   ├── ui/              # Komponen primitif (Button, Card, dll)
│   │   ├── shift/           # Komponen domain shift
│   │   ├── swap/
│   │   └── calendar/
│   ├── context/             # React Context providers (Shift, Profile, Theme)
│   │   ├── shifts/
│   │   │   ├── shiftTypes.ts
│   │   │   ├── shiftReducer.ts
│   │   │   ├── ShiftProvider.tsx
│   │   │   └── useShifts.ts
│   │   ├── profile/
│   │   └── theme/
│   ├── lib/                 # Utility, helpers
│   │   ├── excelParser.ts
│   │   ├── dateUtils.ts
│   │   ├── notifications.ts
│   │   ├── storage.ts       # MMKV wrapper
│   │   └── whatsapp.ts      # WA deep link helpers
│   ├── theme/               # Design tokens (lihat DESIGN.md)
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   ├── hooks/               # Custom React hooks
│   ├── constants/           # Konstanta non-design (shift codes, dll)
│   └── types/               # TypeScript types
├── assets/
│   ├── fonts/
│   └── images/
├── __tests__/
├── .env.example
├── app.json                 # Expo config
├── eas.json                 # EAS Build config
├── tsconfig.json
├── package.json
└── README.md
```

---

## 18. Dependency Install Commands

```bash
# Project init
npx create-expo-app@latest jaga --template tabs

cd jaga

# Core
npm install react-native-mmkv

# UI / Animations
npm install react-native-reanimated react-native-gesture-handler
npm install @gorhom/bottom-sheet
npm install lucide-react-native

# Forms
npm install react-hook-form zod @hookform/resolvers

# Date & Excel
npm install date-fns xlsx

# Expo modules
npx expo install expo-font expo-document-picker expo-notifications expo-file-system expo-haptics expo-linking expo-constants

# Dev dependencies
npm install -D @react-native/eslint-config @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
npm install -D husky lint-staged
npm install -D @testing-library/react-native @testing-library/jest-native
```

---

## 19. Risiko Teknis

| Risiko | Probabilitas | Mitigasi |
|---|---|---|
| Expo SDK upgrade breaking | Sedang | Pin versi di package.json, upgrade tiap quarter setelah testing |
| Excel format terlalu beragam | Tinggi | Fallback ke UI mapping manual, kumpulkan sampel file dari users |
| Notifications iOS dibatasi platform | Sedang | Test extensif, dokumentasi user clear |
| MMKV migration kalau ganti device | Sedang | V2: tambah export/backup ke .json file |
| Build size > 30MB | Rendah | Strip unused fonts, optimize images, pakai `expo-image` |

---

## 20. Timeline Implementasi (Update dari PRD)

Sama dengan PRD section 11, total **~9 minggu**. Detail lagi:

| Minggu | Fokus | Deliverable |
|---|---|---|
| 1 | Setup & design system | Project init, theme tokens, base components (`Button`, `Card`, `Text`, `Screen`) |
| 2 | Storage + routing | MMKV setup, Context providers (Shift, Profile, Theme), Expo Router structure, splash + first launch |
| 3 | Onboarding | Input nama, navigasi 3 langkah, simpan ke storage |
| 4-5 | Jadwal (manual + kalender) | Tab Jadwal, kalender bulanan, bottom sheet add shift, edit/delete |
| 6-7 | Excel import | Document picker, parser (long & wide format), pratinjau, mapping manual fallback |
| 7 | Beranda + Notifikasi | Tab Beranda, hero card, week strip, countdown, schedule notifications |
| 8 | Tukar shift | Wizard tukar, generate pesan, WA deep link, riwayat tukar |
| 8 | Dark mode + Pengaturan | Theme switching, tab Saya, edit profil, export |
| 9 | Polish + QA + deploy | Animasi, microcopy, fix bug, build EAS, upload TestFlight + Play Console internal track |

---

*Stack ini akan di-review tiap 3 bulan. Kalau ada library/pattern baru yang lebih cocok, dokumentasi update.*
