// Footer button row untuk AddShiftSheet — Cancel + Save.
//
// Diekstrak supaya AddShiftSheet.tsx stay di bawah 300 baris (CLAUDE.md
// hard limit) dan supaya tombol-tombol ini bisa dikomposisi ulang kalau
// nanti ada sheet lain dengan layout footer mirip (mis. Edit Shift).

import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/context/theme';

// Touch target ≥ 48dp per accessibility rule untuk senior users.
const MIN_BUTTON_HEIGHT = 52;

const CANCEL_FLEX = 1;
const SAVE_FLEX = 2;

interface Props {
  onCancel: () => void;
  onSave: () => void;
}

export function AddShiftSheetActions({ onCancel, onSave }: Props) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing['2xl'] }}>
      <Pressable
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Cancel add shift"
        style={({ pressed }) => ({
          flex: CANCEL_FLEX,
          minHeight: MIN_BUTTON_HEIGHT,
          justifyContent: 'center',
          borderRadius: radius.sm,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          alignItems: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={[typography.labelMD, { color: colors.textSecondary }]}>
          Cancel
        </Text>
      </Pressable>
      <Pressable
        onPress={onSave}
        accessibilityRole="button"
        accessibilityLabel="Save shift"
        style={({ pressed }) => ({
          flex: SAVE_FLEX,
          minHeight: MIN_BUTTON_HEIGHT,
          justifyContent: 'center',
          borderRadius: radius.sm,
          backgroundColor: colors.primary,
          alignItems: 'center',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text
          style={[
            typography.labelMD,
            { color: colors.textInverse, fontWeight: '500' },
          ]}
        >
          Save
        </Text>
      </Pressable>
    </View>
  );
}
