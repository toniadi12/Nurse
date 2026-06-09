// Logo jam berputar untuk splash (PRD F1 + DESIGN.md section 9
// "jam icon ber-tick sebentar, jarum jam berputar").
//
// Implementasi pakai View biasa + react-native-reanimated rotation —
// SENGAJA tanpa SVG karena:
//   1. Lebih ringan di HP low-end (sesuai prinsip [[low-end-device-target]])
//   2. SVG render di Android Hermes ada overhead awal saat splash
//   3. View + transform sudah cukup untuk shape sederhana
//
// Animasi: jarum menit rotasi penuh 360° tiap 3 detik, jarum jam jauh lebih
// lambat (proporsi realistis 12x). withRepeat -1 = infinite tapi splash
// cuma tampil ~1.5s jadi efektif satu rotasi+ aja.
//
// CPU footprint: dua transform rotate di UI thread = trivial.

import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/context/theme';

// Dimensi & timing — konstanta supaya gampang tweak.
const CLOCK_SIZE = 80;
const BORDER_WIDTH = 2.5;
const HOUR_HAND_LENGTH = CLOCK_SIZE * 0.24;
const MINUTE_HAND_LENGTH = CLOCK_SIZE * 0.34;
const HAND_THICKNESS = 2.5;
const CENTER_DOT_SIZE = 5;

// Per "ringan tidak berat": 3 detik per full rotasi = pelan tapi terlihat
// hidup. Easing linear = no acceleration spike.
const MINUTE_ROTATION_MS = 3000;
const HOUR_ROTATION_MS = 36000; // 12× lebih lambat dari menit

export function AnimatedClock() {
  const { colors } = useTheme();
  const minuteAngle = useSharedValue(0);
  const hourAngle = useSharedValue(0);

  useEffect(() => {
    minuteAngle.value = withRepeat(
      withTiming(360, {
        duration: MINUTE_ROTATION_MS,
        easing: Easing.linear,
      }),
      -1, // infinite (tapi splash cepat unmount)
      false,
    );
    hourAngle.value = withRepeat(
      withTiming(360, {
        duration: HOUR_ROTATION_MS,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [minuteAngle, hourAngle]);

  const minuteStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${minuteAngle.value}deg` }],
  }));
  const hourStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${hourAngle.value}deg` }],
  }));

  // Hand positioning: anchored di tengah clock dengan transformOrigin 'bottom'
  // supaya pivot rotasi = bottom edge hand = pas di pusat clock face.
  // bottom: '50%' = bottom edge sejajar dengan vertical center parent.
  const handCommon = {
    position: 'absolute' as const,
    bottom: '50%' as const,
    transformOrigin: 'bottom' as const,
  };

  return (
    <View
      style={{
        width: CLOCK_SIZE,
        height: CLOCK_SIZE,
        borderRadius: CLOCK_SIZE / 2,
        borderWidth: BORDER_WIDTH,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Jarum jam (oranye) — pendek tebal */}
      <Animated.View
        style={[
          handCommon,
          {
            width: HAND_THICKNESS,
            height: HOUR_HAND_LENGTH,
            backgroundColor: colors.accent,
            borderRadius: HAND_THICKNESS / 2,
          },
          hourStyle,
        ]}
      />
      {/* Jarum menit (sage) — lebih panjang */}
      <Animated.View
        style={[
          handCommon,
          {
            width: HAND_THICKNESS,
            height: MINUTE_HAND_LENGTH,
            backgroundColor: colors.primary,
            borderRadius: HAND_THICKNESS / 2,
          },
          minuteStyle,
        ]}
      />
      {/* Titik tengah */}
      <View
        style={{
          width: CENTER_DOT_SIZE,
          height: CENTER_DOT_SIZE,
          borderRadius: CENTER_DOT_SIZE / 2,
          backgroundColor: colors.primary,
        }}
      />
    </View>
  );
}
