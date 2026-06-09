// Onboarding step 2 — pilih cara isi jadwal.
//
// PRD F3 vs F4: user bisa import Excel ATAU input manual. Onboarding step 2
// kasih pilihan, bukan memaksa. Kalau user belum punya file Excel, "Input
// manual nanti" → langsung ke Beranda, mereka tambah shift lewat tombol +.

import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FileSpreadsheet, Pencil } from 'lucide-react-native';
import { useTheme } from '@/context/theme';

const ICON_SIZE = 24;
const ICON_STROKE = 1.5;

export default function ImportOrManualScreen() {
  const { colors, typography, spacing, radius } = useTheme();

  function handleImportExcel() {
    router.push('/onboarding/import');
  }

  function handleManualLater() {
    // replace — biar back button dari Beranda tidak balik ke onboarding
    router.replace('/home');
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'bottom']}
    >
      <View
        style={{
          flex: 1,
          padding: spacing['2xl'],
        }}
      >
        <View style={{ marginTop: spacing['4xl'], marginBottom: spacing['3xl'] }}>
          <Text
            style={[
              typography.labelSM,
              { color: colors.primaryMuted, marginBottom: spacing.xs },
            ]}
          >
            Step 2 of 3
          </Text>
          <Text
            style={[
              typography.displayMD,
              { color: colors.textPrimary, marginBottom: spacing.md },
            ]}
          >
            How would you like to start?
          </Text>
          <Text style={[typography.bodyMD, { color: colors.textSecondary }]}>
            Pick one — you can change this anytime in Settings.
          </Text>
        </View>

        <Pressable
          onPress={handleImportExcel}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.lg,
            padding: spacing.xl,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            marginBottom: spacing.md,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <FileSpreadsheet
            color={colors.primary}
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                typography.labelMD,
                { color: colors.textPrimary, marginBottom: spacing.xs },
              ]}
            >
              Import from Excel
            </Text>
            <Text style={[typography.bodySM, { color: colors.textSecondary }]}>
              Upload the .xlsx file from your ward manager. Jaga reads your shifts automatically.
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={handleManualLater}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.lg,
            padding: spacing.xl,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Pencil
            color={colors.primaryMuted}
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                typography.labelMD,
                { color: colors.textPrimary, marginBottom: spacing.xs },
              ]}
            >
              Add shifts manually
            </Text>
            <Text style={[typography.bodySM, { color: colors.textSecondary }]}>
              No file yet? Add shifts one by one using the + button on the Schedule tab.
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
