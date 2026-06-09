// Preview hasil parsing Excel. Tampilkan:
//   - Summary (jumlah shift + layout terdeteksi)
//   - Pratinjau 5 shift pertama (tanggal + label)
//   - List warnings (kalau ada)
//   - Tombol "Simpan X shift" (disabled kalau 0 shift)
//   - Tombol "Pilih file lain"

import { Pressable, Text, View } from 'react-native';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/context/theme';
import { SHIFT_LABEL_ID } from '@/constants/shiftCodes';
import type { ParseResult } from '@/lib/excelParser';

const PREVIEW_SHIFTS_LIMIT = 5;
const WARNINGS_PREVIEW_LIMIT = 3;
const ICON_SIZE = 20;
const ICON_STROKE = 1.5;

interface Props {
  result: ParseResult;
  fileName: string;
  onSave: () => void;
  onPickAgain: () => void;
}

export function ImportPreviewView({ result, fileName, onSave, onPickAgain }: Props) {
  const { colors, typography, spacing, radius } = useTheme();

  const shiftCount = result.shifts.length;
  const previewShifts = result.shifts.slice(0, PREVIEW_SHIFTS_LIMIT);
  const hasShifts = shiftCount > 0;
  const layoutLabel = result.layout === 'unknown' ? 'unrecognised' : result.layout;

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.xs,
        }}
      >
        {hasShifts ? (
          <CheckCircle2 color={colors.success} size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        ) : (
          <AlertCircle color={colors.warning} size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        )}
        <Text style={[typography.bodyMD, { color: colors.textPrimary, flex: 1 }]}>
          {hasShifts
            ? `Found ${shiftCount} ${shiftCount === 1 ? 'shift' : 'shifts'} in ${fileName}`
            : `No shifts found in ${fileName}`}
        </Text>
      </View>

      <Text
        style={[
          typography.bodySM,
          { color: colors.textTertiary, marginBottom: spacing.lg },
        ]}
      >
        Detected layout: {layoutLabel}
      </Text>

      {previewShifts.length > 0 && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.lg,
            marginBottom: spacing.lg,
          }}
        >
          <Text
            style={[
              typography.labelSM,
              { color: colors.primaryMuted, marginBottom: spacing.sm },
            ]}
          >
            Preview of first {previewShifts.length} shifts
          </Text>
          {previewShifts.map((shift) => (
            <View
              key={`${shift.date}-${shift.rowIndex}`}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: spacing.xs,
              }}
            >
              <Text style={[typography.bodySM, { color: colors.textSecondary }]}>
                {shift.date}
              </Text>
              <Text style={[typography.bodySM, { color: colors.textPrimary }]}>
                {SHIFT_LABEL_ID[shift.code]}
              </Text>
            </View>
          ))}
          {shiftCount > PREVIEW_SHIFTS_LIMIT && (
            <Text
              style={[
                typography.bodyXS,
                { color: colors.textTertiary, marginTop: spacing.xs },
              ]}
            >
              + {shiftCount - PREVIEW_SHIFTS_LIMIT} more
            </Text>
          )}
        </View>
      )}

      {result.warnings.length > 0 && (
        <View
          style={{
            backgroundColor: colors.accentSoft,
            borderRadius: radius.md,
            padding: spacing.lg,
            marginBottom: spacing.lg,
          }}
        >
          <Text
            style={[
              typography.labelSM,
              { color: colors.accentDark, marginBottom: spacing.xs },
            ]}
          >
            {result.warnings.length} {result.warnings.length === 1 ? 'warning' : 'warnings'}
          </Text>
          {result.warnings.slice(0, WARNINGS_PREVIEW_LIMIT).map((warning, i) => (
            <Text
              key={i}
              style={[
                typography.bodySM,
                { color: colors.accentDark, marginBottom: spacing.xs },
              ]}
            >
              • {warning}
            </Text>
          ))}
          {result.warnings.length > WARNINGS_PREVIEW_LIMIT && (
            <Text style={[typography.bodyXS, { color: colors.accentDark }]}>
              + {result.warnings.length - WARNINGS_PREVIEW_LIMIT} more
            </Text>
          )}
        </View>
      )}

      <Pressable
        onPress={onSave}
        disabled={!hasShifts}
        accessibilityRole="button"
        accessibilityState={{ disabled: !hasShifts }}
        style={({ pressed }) => ({
          backgroundColor: hasShifts ? colors.primary : colors.borderStrong,
          paddingVertical: spacing.lg,
          borderRadius: radius.sm,
          alignItems: 'center',
          marginBottom: spacing.md,
          opacity: pressed && hasShifts ? 0.85 : 1,
        })}
      >
        <Text style={[typography.labelMD, { color: colors.textInverse }]}>
          Simpan {shiftCount} shift
        </Text>
      </Pressable>

      <Pressable
        onPress={onPickAgain}
        accessibilityRole="button"
        style={({ pressed }) => ({
          paddingVertical: spacing.md,
          alignItems: 'center',
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <Text style={[typography.labelMD, { color: colors.textSecondary }]}>
          Pick a different file
        </Text>
      </Pressable>
    </View>
  );
}
