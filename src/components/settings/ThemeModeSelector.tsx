// Segmented control 3 mode tampilan (PRD F9).
// Auto / Terang / Gelap. Default Auto (ikuti sistem + paksa dark jam 19-05).
//
// Tidak pakai radio-style stack vertical — segmented control horizontal lebih
// ringkas & familiar di app modern (mirip iOS Settings).

import { Pressable, Text, View } from 'react-native';
import { Moon, Sun, SunMoon } from 'lucide-react-native';
import { useTheme } from '@/context/theme';
import type { ThemeMode } from '@/context/theme/themeTypes';

interface ModeOption {
  value: ThemeMode;
  label: string;
  Icon: typeof Sun;
}

// Urutan: Auto (default & paling sering dipakai) di tengah/kiri,
// disusul Terang & Gelap.
const MODE_OPTIONS: readonly ModeOption[] = [
  { value: 'auto', label: 'Auto', Icon: SunMoon },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

const ICON_SIZE = 16;
const ICON_STROKE = 1.5;

export function ThemeModeSelector() {
  const { mode, setMode, colors, typography, spacing, radius } = useTheme();

  // Subtitle helper text — beri tahu user apa arti mode aktif sekarang.
  const subtitle = (() => {
    switch (mode) {
      case 'auto':
        return 'Follow your device. Switches to dark between 19:00–05:00.';
      case 'light':
        return 'Always light, all day.';
      case 'dark':
        return 'Always dark — easier on the eyes for night shifts.';
    }
  })();

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.background,
          borderRadius: radius.sm,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 2, // gap kecil supaya active state terlihat "inset"
        }}
      >
        {MODE_OPTIONS.map((opt) => {
          const active = mode === opt.value;
          const { Icon } = opt;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setMode(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Mode ${opt.label}`}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: spacing.xs,
                paddingVertical: spacing.md,
                borderRadius: radius.sm,
                backgroundColor: active ? colors.primary : 'transparent',
                opacity: pressed && !active ? 0.6 : 1,
              })}
            >
              <Icon
                color={active ? colors.textInverse : colors.textSecondary}
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
              />
              <Text
                style={[
                  typography.labelMD,
                  {
                    color: active ? colors.textInverse : colors.textPrimary,
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text
        style={[
          typography.bodySM,
          {
            color: colors.textTertiary,
            marginTop: spacing.sm,
          },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
}
