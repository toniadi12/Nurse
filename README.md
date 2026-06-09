# Jaga

Shift scheduling app for nurses and carers in the UK.

Import your roster from Excel, get smart reminders before each shift, and swap shifts with colleagues via WhatsApp — all offline-first, no account required.

---

## Quick start

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or Camera (iOS).

## Scripts

| Command | Purpose |
|---|---|
| `npx expo start` | Launch dev server |
| `npm test` | Run Jest unit tests |
| `npm run typecheck` | TypeScript strict check |

## Tech

- **Expo SDK 54** (managed workflow) · **React Native 0.81** · **TypeScript strict**
- **Routing:** Expo Router (file-based)
- **State:** React Context + useReducer (no external state library)
- **Storage:** AsyncStorage (V2 candidate: MMKV via Dev Client)
- **Forms:** react-hook-form + zod
- **Excel parsing:** SheetJS (xlsx)
- **Notifications:** expo-notifications (local only)
- **Date:** date-fns (locale `enGB`)
- **Icons:** lucide-react-native

## Project structure

```
app/                       Expo Router screens (file-based routes)
src/
  components/              UI components, grouped by domain
    ui/                    Primitives (Button, Toast, Dialog)
    shift/                 Shift cards, week strip, add-shift sheet
    swap/                  Swap list, picker, status badge
    calendar/              Calendar grid + month header
    settings/              Settings sections
    splash/                Splash animation
    navigation/            Floating bottom tab bar
  context/                 React Context providers
    shifts/                shiftReducer + ShiftProvider + useShifts
    profile/
    swap/
    theme/
  lib/                     Pure utilities
    excelParser.ts         + excel/* helpers, header detection
    dateUtils.ts
    notifications.ts
    storage.ts             AsyncStorage wrapper
    whatsapp.ts            WA deep-link + message template
  hooks/                   useShiftNotificationSync, etc.
  theme/                   Design tokens (colours, typography, spacing)
  types/                   Shared TypeScript types
  constants/               Shift codes + aliases
```

## Design system

See [`DESIGN.md`](DESIGN.md) for tokens, typography, microcopy rules, and motion specs.

## Feature requirements

See [`PRD-Jaga.md`](PRD-Jaga.md) for MVP feature definitions (F1–F10).

## Architecture decisions

See [`TECH-STACK.md`](TECH-STACK.md) for justification of each library choice.

## Status

MVP feature-complete (F1–F10). Currently in QA / pre-deploy hardening.

## License

Private / unreleased. Built for nurses and carers in the UK.
