// Card "Re-import Excel" di tab Settings — buka onboarding import flow.
//
// Diekstrak dari profile.tsx supaya parent stay di bawah 300 baris dan
// supaya card ini bisa dipakai ulang kalau nanti ada entry point lain
// (mis. quick action di Home).

import { Pressable, Text, View } from 'react-native';
import { FileSpreadsheet } from 'lucide-react-native';
import { useTheme } from '@/context/theme';

const ICON_SIZE = 20;
const ICON_STROKE = 1.5;
const HELPER_TEXT_GAP = 2;

interface Props {
  onPress: () => void;
}

export function ReimportCard({ onPress }: Props) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Re-import Excel"
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <FileSpreadsheet color={colors.primary} size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodyMD, { color: colors.textPrimary }]}>
          Re-import Excel
        </Text>
        <Text
          style={[
            typography.bodySM,
            { color: colors.textTertiary, marginTop: HELPER_TEXT_GAP },
          ]}
        >
          Add new shifts from another Excel file. Existing data is kept.
        </Text>
      </View>
    </Pressable>
  );
}
