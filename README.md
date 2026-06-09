# Jaga

Shift scheduling for UK nurses and carers. Import your roster from Excel,
get reminders before each shift, and swap shifts with colleagues over
WhatsApp. Works offline, no account needed.

## Setup

```bash
npm install
npx expo start
```

Open with Expo Go on your phone (scan the QR code).

## Scripts

- `npm test` — run unit tests
- `npm run typecheck` — TypeScript check
- `npx expo start` — dev server

## Stack

Expo SDK 54, React Native, TypeScript. Routing via Expo Router. State with
React Context + useReducer. AsyncStorage for persistence. SheetJS for Excel.
date-fns for dates. expo-notifications for local reminders.

## Status

MVP, in QA before tester release.
