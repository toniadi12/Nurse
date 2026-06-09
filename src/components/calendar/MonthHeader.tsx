// Header bulan untuk kalender — title bulan + 2 tombol navigasi.
// Title pakai Instrument Serif (typography.displaySM) biar editorial feel.

import { Pressable, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';
import { enGB as dateLocale } from 'date-fns/locale';
import { useTheme } from '@/context/theme';

interface Props {
  monthDate: Date;
  onPrev: () => void;
  onNext: () => void;
}

const ICON_SIZE = 24;
const ICON_STROKE = 1.5;
const NAV_BUTTON_SIZE = 40;

export function MonthHeader({ monthDate, onPrev, onNext }: Props) {
  const { colors, typography, spacing, radius } = useTheme();
  const title = format(monthDate, 'MMMM yyyy', { locale: dateLocale });

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
      }}
    >
      <Text
        style={[typography.displaySM, { color: colors.textPrimary, flex: 1 }]}
      >
        {title}
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
        <NavButton
          onPress={onPrev}
          icon={<ChevronLeft color={colors.textPrimary} size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
          accessibilityLabel="Previous month"
          colors={colors}
          radius={radius}
        />
        <NavButton
          onPress={onNext}
          icon={<ChevronRight color={colors.textPrimary} size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
          accessibilityLabel="Next month"
          colors={colors}
          radius={radius}
        />
      </View>
    </View>
  );
}

interface NavButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  accessibilityLabel: string;
  colors: ReturnType<typeof useTheme>['colors'];
  radius: ReturnType<typeof useTheme>['radius'];
}

function NavButton({ onPress, icon, accessibilityLabel, colors, radius }: NavButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => ({
        width: NAV_BUTTON_SIZE,
        height: NAV_BUTTON_SIZE,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {icon}
    </Pressable>
  );
}
