// Custom bottom tab bar — floating pill style (DESIGN.md filosofi:
// "tenang bukan klinis, editorial bukan dashboard").
//
// Spec:
//   - Pill rounded penuh, melayang dari edge bottom (margin)
//   - Shadow halus (shadow.md) supaya terlihat mengambang
//   - Tab aktif: bg sage soft di belakang icon + label muncul di sebelahnya
//   - Tab inactive: icon only, color textTertiary
//   - Layout flex: active tab sedikit lebih lebar (untuk akomodasi label)
//
// Dipakai via prop `tabBar` di <Tabs> dari Expo Router. Component menerima
// state/descriptors/navigation standard dari @react-navigation/bottom-tabs.

import { Pressable, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme';

const ICON_SIZE = 22;
const ICON_STROKE = 1.5;

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors, typography, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        // Mengambang dari bottom — kasih jarak ke gesture bar (insets) +
        // breathing room (spacing.md) supaya tidak rapat.
        bottom: insets.bottom + spacing.md,
        left: spacing['2xl'],
        right: spacing['2xl'],
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: radius.full,
        padding: spacing.xs,
        // Border tipis biar definisi tepi tetap ada di light mode (shadow doang
        // kurang nendang di bg cream).
        borderWidth: 1,
        borderColor: colors.border,
        ...shadow.md,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const descriptor = descriptors[route.key];
        if (!descriptor) return null; // defensive — seharusnya selalu ada
        const { options } = descriptor;
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : (options.title ?? route.name);

        function handlePress() {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        }

        function handleLongPress() {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        }

        // Active = bg primary (sage penuh) + icon/text inverse — kontras tegas
        // di light maupun dark mode. Sebelumnya pakai primarySoft tapi di dark
        // mode terlalu mirip dgn surface (primarySoft #2A3F37 vs surface
        // #243A33 = nyaris invisible).
        const iconColor = isFocused ? colors.textInverse : colors.textTertiary;
        const Icon = options.tabBarIcon;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={
              options.tabBarAccessibilityLabel ?? `Tab ${label}`
            }
            onPress={handlePress}
            onLongPress={handleLongPress}
            style={({ pressed }) => ({
              // Active tab lebih lebar (1.6) supaya label muat tanpa nge-squeeze
              // tab lain. Inactive flex 1 — sama rata.
              flex: isFocused ? 1.6 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.md,
              borderRadius: radius.full,
              backgroundColor: isFocused ? colors.primary : 'transparent',
              opacity: pressed && !isFocused ? 0.6 : 1,
            })}
          >
            {Icon &&
              Icon({
                color: iconColor,
                focused: isFocused,
                size: ICON_SIZE,
              })}
            {isFocused && (
              <Text
                style={[
                  typography.labelMD,
                  { color: colors.textInverse },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// Helper: hitung tinggi efektif floating nav supaya screen child bisa
// reserve paddingBottom yang pas (mengambang + tidak ketabrak konten).
// Dipakai dari hook useFloatingTabBarSpace di bawah.
export const FLOATING_TAB_BAR_VISIBLE_HEIGHT = 56; // icon + padding
export const FLOATING_TAB_BAR_BOTTOM_GAP = 12; // spacing.md
export { ICON_STROKE as TAB_ICON_STROKE };
