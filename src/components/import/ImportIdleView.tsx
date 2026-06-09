// State idle untuk Import screen — sebelum user pilih file.
// Tampilkan instruksi singkat + tombol primer "Pilih file Excel".

import { Pressable, Text, View } from 'react-native';
import { FileSpreadsheet } from 'lucide-react-native';
import { useTheme } from '@/context/theme';

const ICON_SIZE = 20;
const ICON_STROKE = 1.5;

interface Props {
  onPick: () => void;
}

export function ImportIdleView({ onPick }: Props) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <View>
      <Text
        style={[
          typography.bodyMD,
          { color: colors.textSecondary, marginBottom: spacing['2xl'] },
        ]}
      >
        Pick the Excel file (.xlsx, .xls, .csv) from your ward manager.
        Jaga will find your name and extract your shifts automatically.
      </Text>

      <Pressable
        onPress={onPick}
        accessibilityRole="button"
        style={({ pressed }) => ({
          backgroundColor: colors.primary,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing['2xl'],
          borderRadius: radius.sm,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.sm,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <FileSpreadsheet
          color={colors.textInverse}
          size={ICON_SIZE}
          strokeWidth={ICON_STROKE}
        />
        <Text style={[typography.labelMD, { color: colors.textInverse }]}>
          Pick Excel file
        </Text>
      </Pressable>
    </View>
  );
}
