// Confirm dialog custom dengan struktur iOS native style.
//
// Inspirasi struktur (dari iOS UIAlertController):
//   - Card sempit (~270pt), centered di layar
//   - Text title + body CENTERED (bukan left-aligned)
//   - Hairline divider antara konten & button row
//   - Button HORIZONTAL row (untuk 2 button) dengan hairline divider di tengah
//   - Button text-only (no bg fill), warna tint biru/merah ala iOS
//
// Adaptasi ke Jaga design tokens:
//   - bg surface (cream di light, forest di dark) — bukan systemBackground iOS
//   - Tint: primary (sage) bukan biru iOS; danger (brick) bukan merah iOS
//   - Font: Plus Jakarta Sans 500 untuk emphasis (bukan San Francisco)
//   - Hairline pakai border color theme (subtle)
//
// API API API: parent kontrol via state `visible` + handler.
// Variant 'destructive' → tombol confirm pakai warna danger.
// `singleAction: true` → cuma 1 button (info dialog mode).

import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme';

interface Props {
  visible: boolean;
  title: string;
  body?: string | undefined;
  // Default: "Lanjut". Variant 'destructive' → text warna danger.
  confirmLabel?: string | undefined;
  cancelLabel?: string | undefined;
  variant?: 'default' | 'destructive' | undefined;
  // Kalau true, hide Batal — dialog jadi info-only dengan 1 button.
  // onCancel masih dipanggil saat tap luar atau back hardware.
  singleAction?: boolean | undefined;
  onCancel: () => void;
  onConfirm: () => void;
}

// Spec iOS UIAlertController: width ~270pt, corner radius ~14pt.
const DIALOG_WIDTH = 270;
const DIALOG_RADIUS = 14;
const BUTTON_HEIGHT = 44; // iOS standard touch target
const HAIRLINE = 0.5; // hairline divider (iOS default)
const OVERLAY_BG = 'rgba(0, 0, 0, 0.4)';

export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel = 'Lanjut',
  cancelLabel = 'Cancel',
  variant = 'default',
  singleAction = false,
  onCancel,
  onConfirm,
}: Props) {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const confirmColor =
    variant === 'destructive' ? colors.danger : colors.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      {/* Backdrop — tap luar dialog = cancel */}
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: OVERLAY_BG,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing['2xl'],
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        {/* Card — stopPropagation supaya tap dalam card gak trigger onCancel */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: DIALOG_WIDTH,
            backgroundColor: colors.surface,
            borderRadius: DIALOG_RADIUS,
            overflow: 'hidden', // biar button bottom corner ikut rounded
          }}
        >
          {/* Konten title + body — CENTERED ala iOS */}
          <View
            style={{
              paddingTop: spacing.xl,
              paddingHorizontal: spacing.xl,
              paddingBottom: spacing.xl,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: typography.bodyMD.fontFamily,
                fontSize: 17,
                lineHeight: 22,
                fontWeight: '600',
                color: colors.textPrimary,
                textAlign: 'center',
                marginBottom: body ? spacing.xs : 0,
              }}
            >
              {title}
            </Text>
            {body && (
              <Text
                style={{
                  fontFamily: typography.bodyMD.fontFamily,
                  fontSize: 13,
                  lineHeight: 18,
                  color: colors.textSecondary,
                  textAlign: 'center',
                }}
              >
                {body}
              </Text>
            )}
          </View>

          {/* Hairline divider — pisahin konten & button row */}
          <View
            style={{
              height: HAIRLINE,
              backgroundColor: colors.border,
            }}
          />

          {/* Button row — horizontal kalau 2 button, single full-width
              kalau singleAction. Hairline vertikal di antara button (iOS). */}
          {singleAction ? (
            <DialogButton
              label={confirmLabel}
              color={confirmColor}
              bold
              onPress={onConfirm}
            />
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <DialogButton
                label={cancelLabel}
                color={colors.textPrimary}
                onPress={onCancel}
                flex={1}
              />
              <View
                style={{
                  width: HAIRLINE,
                  backgroundColor: colors.border,
                }}
              />
              <DialogButton
                label={confirmLabel}
                color={confirmColor}
                bold
                onPress={onConfirm}
                flex={1}
              />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Tombol di dalam dialog — text-only ala iOS, no bg fill. Pressed state =
// subtle bg tint (iOS UIAlertAction highlight). Bold = action utama
// (confirm), regular = action sekunder (cancel).
function DialogButton({
  label,
  color,
  onPress,
  bold = false,
  flex,
}: {
  label: string;
  color: string;
  onPress: () => void;
  bold?: boolean;
  flex?: number;
}) {
  const { colors, typography } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex,
        height: BUTTON_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        // iOS highlight state: subtle bg tint (10% black/white overlay).
        backgroundColor: pressed ? colors.background : 'transparent',
      })}
    >
      <Text
        style={{
          fontFamily: typography.bodyMD.fontFamily,
          fontSize: 17,
          lineHeight: 22,
          color,
          fontWeight: bold ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
