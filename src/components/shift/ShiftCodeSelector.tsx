// Grid 6 tombol pilih jenis shift: Pagi/Siang/Malam/Libur/Cuti/Kustom.
// Layout 2 baris × 3 kolom — cukup besar untuk touch target 44pt
// (DESIGN.md section 4 + 12).
//
// === Selected state — KONSISTEN DENGAN KALENDER ===
// Setiap kode pakai warna khasnya sendiri saat dipilih (via getShiftStyle):
//   Pagi  → coral penuh
//   Siang → peach
//   Malam → plum
//   Libur → dashed border tebal (visual "kosong" tapi tetap terlihat selected)
//   Cuti  → sage soft
//   Kustom→ sage soft + label
//
// KENAPA bukan satu warna sage seragam?
// Feedback user (2026-05-28): "tidak semua suster usia di bawah 40,
// pakai warna lain jika di pilih agar mudah di ingat". User akan belajar
// "coral = pagi" sekali, lalu langsung paham coral di kalender = pagi.
// Konsistensi warna selector ↔ kalender = bantu memori.

import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/context/theme';
import type { ShiftCode } from '@/types/shift';
import { SHIFT_LABEL_ID } from '@/constants/shiftCodes';
import { getShiftStyle } from '@/lib/shiftStyling';

interface Props {
  value: ShiftCode;
  onChange: (code: ShiftCode) => void;
}

// Urutan: produktif (P/S/M) di baris atas, sisanya (L/C/CUSTOM) di bawah.
const SHIFT_OPTIONS: readonly ShiftCode[] = ['P', 'S', 'M', 'L', 'C', 'CUSTOM'];

// Touch target ≥ 48dp dengan padding generous + font sedikit lebih besar
// untuk readability senior user (bukan 40+ saja, semua usia).
const ITEM_MIN_HEIGHT = 56;

export function ShiftCodeSelector({ value, onChange }: Props) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
      }}
    >
      {SHIFT_OPTIONS.map((code) => {
        const active = value === code;
        const shiftStyle = getShiftStyle(code, colors);

        // Bentuk style aktif berdasarkan jenis shift.
        // Libur (L) khusus: getShiftStyle bikin bg transparent + dashed border —
        // bagus untuk kalender (subtle "off day") tapi untuk selected button
        // butuh visibility lebih. Tebalkan border 2.5 + tetap dashed.
        const activeBg = shiftStyle.bg === 'transparent' ? colors.surface : shiftStyle.bg;
        const activeBorderWidth = active ? (shiftStyle.borderDashed ? 2.5 : 2) : 1;

        return (
          <Pressable
            key={code}
            onPress={() => onChange(code)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={SHIFT_LABEL_ID[code]}
            style={({ pressed }) => ({
              // 3 kolom → setiap tombol ~30% lebar dgn gap di antara.
              flexGrow: 1,
              flexBasis: '30%',
              minHeight: ITEM_MIN_HEIGHT,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              borderRadius: radius.sm,
              borderWidth: activeBorderWidth,
              borderStyle: active && shiftStyle.borderDashed ? 'dashed' : 'solid',
              borderColor: active ? shiftStyle.border : colors.border,
              backgroundColor: active ? activeBg : colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={[
                typography.bodyMD, // lebih besar dari labelMD (14→15) untuk readability
                {
                  color: active ? shiftStyle.fg : colors.textPrimary,
                  fontWeight: active ? '500' : '400',
                },
              ]}
            >
              {SHIFT_LABEL_ID[code]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
