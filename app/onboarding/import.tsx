// Onboarding step 2a — pilih file Excel, parse, preview, simpan.
//
// State machine:
//   idle    → user belum pilih file. Tombol "Pilih file Excel".
//   reading → file lagi di-baca + di-parse. Show spinner.
//   preview → ada hasil. Show jumlah shift + warnings + tombol simpan.
//   saving  → calling importShifts + navigasi ke Beranda.
//   error   → error fatal (file read failed). Tombol retry.
//
// Sub-views (Idle / Preview / Status) di-extract ke src/components/import/
// supaya file ini tetap di bawah 300 baris (rule CLAUDE.md).

import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { ArrowLeft, AlertCircle } from 'lucide-react-native';
import {
  ImportIdleView,
  ImportPreviewView,
  ImportStatusBlock,
} from '@/components/import';
import { useTheme } from '@/context/theme';
import { useProfile } from '@/context/profile';
import { useShifts } from '@/context/shifts';
import { parseExcel, type ParsedShift, type ParseResult } from '@/lib/excelParser';
import type { Shift } from '@/types/shift';

// MIME types untuk filter picker — pakai array biar device platform
// (Android/iOS) bisa pilih file Excel/CSV aja, bukan semua.
const PICKER_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  // Beberapa cloud storage (Drive, iCloud) tag .xlsx jadi octet-stream.
  'application/octet-stream',
];

const ICON_STROKE = 1.5;

type ImportState =
  | { kind: 'idle' }
  | { kind: 'reading'; fileName: string }
  | { kind: 'preview'; result: ParseResult; fileName: string }
  | { kind: 'saving' }
  | { kind: 'error'; message: string };

export default function ImportScreen() {
  const { colors, typography, spacing } = useTheme();
  const { state: profileState } = useProfile();
  const { importShifts } = useShifts();
  const [state, setState] = useState<ImportState>({ kind: 'idle' });
  // Mode: dari onboarding ('onboarding' default) atau dari tab Saya ('settings').
  // Header label & redirect setelah save berbeda.
  const { from } = useLocalSearchParams<{ from?: string }>();
  const isSettingsMode = from === 'settings';

  const nurseName =
    profileState.kind === 'ready' ? profileState.profile.nurseName : '';

  async function handlePickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: PICKER_MIME_TYPES,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      await readAndParse(asset.uri, asset.name);
    } catch (err) {
      setState({
        kind: 'error',
        message: `Gagal buka file: ${err instanceof Error ? err.message : 'unknown'}`,
      });
    }
  }

  async function readAndParse(uri: string, fileName: string) {
    setState({ kind: 'reading', fileName });
    try {
      const file = new File(uri);
      const buffer = await file.arrayBuffer();
      const result = parseExcel(buffer, nurseName);
      setState({ kind: 'preview', result, fileName });
    } catch (err) {
      setState({
        kind: 'error',
        message: `Gagal baca file: ${err instanceof Error ? err.message : 'unknown'}`,
      });
    }
  }

  function handleSave() {
    if (state.kind !== 'preview') return;
    setState({ kind: 'saving' });
    const fullShifts = hydrateShifts(state.result.shifts);
    importShifts(fullShifts);
    // Settings mode → balik ke tab Saya. Onboarding mode → ke Beranda.
    router.replace(isSettingsMode ? '/profile' : '/home');
  }

  function handleReset() {
    setState({ kind: 'idle' });
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: spacing['2xl'] }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Kembali"
          style={({ pressed }) => ({
            marginBottom: spacing.lg,
            opacity: pressed ? 0.5 : 1,
            alignSelf: 'flex-start',
          })}
          hitSlop={8}
        >
          <ArrowLeft
            color={colors.textSecondary}
            size={24}
            strokeWidth={ICON_STROKE}
          />
        </Pressable>

        <Text
          style={[
            typography.labelSM,
            { color: colors.primaryMuted, marginBottom: spacing.xs },
          ]}
        >
          {isSettingsMode ? 'Settings' : 'Step 2 of 3'}
        </Text>
        <Text
          style={[
            typography.displayMD,
            { color: colors.textPrimary, marginBottom: spacing.lg },
          ]}
        >
          {isSettingsMode ? 'Re-import Excel' : 'Import your roster'}
        </Text>

        {state.kind === 'idle' && <ImportIdleView onPick={handlePickFile} />}

        {state.kind === 'reading' && (
          <ImportStatusBlock
            icon={<ActivityIndicator color={colors.primary} />}
            title="Reading file…"
            body={state.fileName}
          />
        )}

        {state.kind === 'preview' && (
          <ImportPreviewView
            result={state.result}
            fileName={state.fileName}
            onSave={handleSave}
            onPickAgain={handleReset}
          />
        )}

        {state.kind === 'saving' && (
          <ImportStatusBlock
            icon={<ActivityIndicator color={colors.primary} />}
            title="Saving…"
          />
        )}

        {state.kind === 'error' && (
          <ImportStatusBlock
            icon={
              <AlertCircle
                color={colors.danger}
                size={32}
                strokeWidth={ICON_STROKE}
              />
            }
            title="Something went wrong"
            body={state.message}
            action={{ label: 'Try again', onPress: handleReset }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Hydrate ParsedShift (yg cuma date+code+raw) → Shift lengkap untuk simpan.
// ID: timestamp + random base36 + rowIndex — cukup unik untuk single-user
// local app. Hindari crypto.randomUUID() karena dependability di Hermes lama
// belum konsisten.
function hydrateShifts(parsed: ParsedShift[]): Shift[] {
  const now = Date.now();
  return parsed.map((p) => ({
    id: `s-${now}-${Math.random().toString(36).slice(2, 10)}-${p.rowIndex}`,
    date: p.date,
    code: p.code,
    source: 'excel' as const,
    createdAt: now,
    updatedAt: now,
  }));
}
