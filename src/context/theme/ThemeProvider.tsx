// ThemeProvider — sumber semua design tokens runtime.
//
// Alur:
//   1. Mount → load mode dari AsyncStorage (default 'auto' kalau belum ada).
//   2. Compute effectiveScheme berdasarkan mode + system + jam.
//   3. Re-render anak saat mode/system/jam berubah.
//
// LIMITASI saat ini: kalau user buka app jam 18:59 lalu diem sampai 19:00,
// auto-switch ke dark TIDAK akan terjadi sampai user re-open app atau
// system colorScheme berubah. Untuk MVP cukup. Nanti bisa pakai setInterval
// re-compute tiap menit kalau benar-benar perlu.

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '@/lib/storage';
import {
  colorsLight,
  colorsDark,
  typography,
  spacing,
  radius,
  shadow,
  motion,
} from '@/theme';
import type {
  ColorSchemeName,
  ThemeContextValue,
  ThemeMode,
} from './themeTypes';

const STORAGE_KEY = 'jaga:theme:v1';
const NIGHT_START_HOUR = 19; // 19.00 ke atas = malam
const NIGHT_END_HOUR = 5; // 05.00 ke bawah = masih malam

// Helper terisolasi — testable, pure function.
function isNightTime(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

function computeEffectiveScheme(
  mode: ThemeMode,
  systemScheme: ColorSchemeName,
): ColorSchemeName {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  // mode === 'auto'
  if (isNightTime()) return 'dark';
  return systemScheme;
}

// State + reducer untuk mode (sederhana, tapi konsisten pattern app).
type ThemeState = { mode: ThemeMode; isLoaded: boolean };

type ThemeAction =
  | { type: 'MODE_LOADED'; payload: ThemeMode }
  | { type: 'MODE_CHANGED'; payload: ThemeMode };

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'MODE_LOADED':
      return { mode: action.payload, isLoaded: true };
    case 'MODE_CHANGED':
      return { ...state, mode: action.payload };
    default:
      return state;
  }
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, {
    mode: 'auto', // default sebelum AsyncStorage selesai load
    isLoaded: false,
  });

  // Hook bawaan RN — auto re-render kalau user ganti theme HP.
  const systemScheme = (useColorScheme() ?? 'light') as ColorSchemeName;

  // Load saved mode sekali saat mount.
  useEffect(() => {
    storage.get<ThemeMode>(STORAGE_KEY).then((saved) => {
      dispatch({ type: 'MODE_LOADED', payload: saved ?? 'auto' });
    });
  }, []);

  // Persist mode setiap kali berubah (tapi skip initial load supaya
  // tidak nulis 'auto' ke storage waktu pertama kali buka app).
  useEffect(() => {
    if (!state.isLoaded) return;
    storage.set(STORAGE_KEY, state.mode);
  }, [state.mode, state.isLoaded]);

  const setMode = useCallback((mode: ThemeMode) => {
    dispatch({ type: 'MODE_CHANGED', payload: mode });
  }, []);

  // useMemo supaya context value reference stabil — kalau bikin object baru
  // tiap render, SEMUA consumer akan re-render walau warnanya sama.
  const value = useMemo<ThemeContextValue>(() => {
    const effectiveScheme = computeEffectiveScheme(state.mode, systemScheme);
    const colors = effectiveScheme === 'dark' ? colorsDark : colorsLight;
    return {
      mode: state.mode,
      effectiveScheme,
      colors,
      typography,
      spacing,
      radius,
      shadow,
      motion,
      setMode,
    };
  }, [state.mode, systemScheme, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
