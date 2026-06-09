// Tab 4 — You (profile & settings, PRD F10 complete).
//
// Section order (top to bottom):
//   1. Greeting + name display
//   2. Profile     — edit first name + default ward
//   3. Reminders   — notification offset (30/60/120 min)
//   4. Appearance  — theme light/dark/auto (F9)
//   5. Roster      — re-import Excel
//   6. About       — version + privacy
//   7. Reset       — destructive double-confirm
//
// Edit name / ward immediately updates profile via updateProfile() —
// auto-persist + auto-reschedule notifications because ProfileProvider
// re-renders useShiftNotificationSync as a dependency.

import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/context/theme';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  FLOATING_TAB_BAR_BOTTOM_GAP,
  FLOATING_TAB_BAR_VISIBLE_HEIGHT,
} from '@/components/navigation/FloatingTabBar';
import { useProfile } from '@/context/profile';
import { useShifts } from '@/context/shifts';
import { useSwaps } from '@/context/swap';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { ThemeModeSelector } from '@/components/settings/ThemeModeSelector';
import { NotificationOffsetSelector } from '@/components/settings/NotificationOffsetSelector';
import { EditableTextField } from '@/components/settings/EditableTextField';
import { AboutSection } from '@/components/settings/AboutSection';
import { ReimportCard } from '@/components/settings/ReimportCard';
import { ResetButton } from '@/components/settings/ResetButton';
import type { NotificationOffset, UserProfile } from '@/types/profile';

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 40;
const MAX_WARD_LENGTH = 50;

// Reset flow: idle → step 1 confirm → step 2 confirm → execute.
// Pakai 2 confirm berturut (PRD F10) supaya tidak ke-tap tidak sengaja.
type ResetStep = 0 | 1 | 2;

export default function ProfileTab() {
  const { colors, spacing, typography } = useTheme();
  const { state: profileState, updateProfile, clearProfile } = useProfile();
  const { clearShifts } = useShifts();
  const { clearSwaps } = useSwaps();
  const insets = useSafeAreaInsets();
  // Clearance untuk floating nav supaya konten terakhir (Reset)
  // bisa scroll sampai atas nav, tidak ke-cover. Formula sama dgn yang
  // dipakai untuk FAB di schedule.tsx dan swap.tsx.
  const scrollBottomPad =
    insets.bottom +
    FLOATING_TAB_BAR_BOTTOM_GAP +
    FLOATING_TAB_BAR_VISIBLE_HEIGHT +
    spacing['2xl'];

  if (profileState.kind !== 'ready') {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={['top']}
      >
        <View style={{ padding: spacing['2xl'] }}>
          <Text style={[typography.bodyMD, { color: colors.textSecondary }]}>
            Loading profile…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const profile = profileState.profile;

  function updateField<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    updateProfile({ ...profile, [key]: value });
  }

  function validateName(value: string): string | null {
    if (value.length < MIN_NAME_LENGTH) return `Name must be at least ${MIN_NAME_LENGTH} characters`;
    if (value.length > MAX_NAME_LENGTH) return `Name must be ${MAX_NAME_LENGTH} characters or fewer`;
    return null;
  }

  function validateWard(value: string): string | null {
    if (value.length > MAX_WARD_LENGTH) return `Ward must be ${MAX_WARD_LENGTH} characters or fewer`;
    return null;
  }

  function handleSaveName(value: string) {
    updateField('nurseName', value);
  }

  function handleSaveWard(value: string) {
    // Empty input → clear default ward (omit field entirely).
    if (value.length === 0) {
      const { defaultWard: _omit, ...rest } = profile;
      updateProfile(rest);
    } else {
      updateField('defaultWard', value);
    }
  }

  function handleOffsetChange(value: NotificationOffset) {
    updateField('notificationOffset', value);
  }

  function handleReimport() {
    router.push('/onboarding/import?from=settings');
  }

  const [resetStep, setResetStep] = useState<ResetStep>(0);

  function executeReset() {
    setResetStep(0);
    clearShifts();
    clearSwaps();
    clearProfile();
    router.replace('/');
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={{
          padding: spacing['2xl'],
          paddingBottom: scrollBottomPad,
        }}
      >
        <Text
          style={[
            typography.labelSM,
            { color: colors.primaryMuted, marginBottom: spacing.xs },
          ]}
        >
          Settings
        </Text>
        <Text
          style={[
            typography.displayLG,
            { color: colors.textPrimary, marginBottom: spacing['2xl'] },
          ]}
        >
          Hello, {profile.nurseName}.
        </Text>

        <SettingsSection title="First name">
          <EditableTextField
            value={profile.nurseName}
            onSave={handleSaveName}
            validate={validateName}
            placeholder="e.g. Sarah"
            maxLength={MAX_NAME_LENGTH}
            autoCapitalize="words"
            helperText="Used for greetings and matching your name in Excel rosters."
          />
        </SettingsSection>

        <SettingsSection title="Default ward">
          <EditableTextField
            value={profile.defaultWard}
            onSave={handleSaveWard}
            validate={validateWard}
            placeholder="e.g. A&E, ICU"
            maxLength={MAX_WARD_LENGTH}
            autoCapitalize="characters"
            helperText="Auto-filled when adding shifts manually."
            emptyText="Not set (optional)"
          />
        </SettingsSection>

        <SettingsSection title="Shift reminders">
          <NotificationOffsetSelector
            value={profile.notificationOffset}
            onChange={handleOffsetChange}
          />
        </SettingsSection>

        <SettingsSection title="Appearance">
          <ThemeModeSelector />
        </SettingsSection>

        <SettingsSection title="Roster">
          <ReimportCard onPress={handleReimport} />
        </SettingsSection>

        <SettingsSection title="About">
          <AboutSection />
        </SettingsSection>

        <SettingsSection title="Reset" marginBottom={0}>
          <ResetButton onPress={() => setResetStep(1)} />
          <Text
            style={[
              typography.bodySM,
              {
                color: colors.textTertiary,
                marginTop: spacing.sm,
                textAlign: 'center',
              },
            ]}
          >
            Removes your profile, shifts, and swap history. This can&apos;t be undone.
          </Text>
        </SettingsSection>
      </ScrollView>

      {/* Reset double-confirm (PRD F10) — two ConfirmDialogs in sequence */}
      <ConfirmDialog
        visible={resetStep === 1}
        title="Reset everything?"
        body="Your name, shifts, and swap history will all be removed. This can't be undone."
        confirmLabel="Continue"
        cancelLabel="Cancel"
        variant="destructive"
        onCancel={() => setResetStep(0)}
        onConfirm={() => setResetStep(2)}
      />
      <ConfirmDialog
        visible={resetStep === 2}
        title="Really sure?"
        body='Tap "Reset now" to confirm. You will be returned to onboarding.'
        confirmLabel="Reset now"
        cancelLabel="Cancel"
        variant="destructive"
        onCancel={() => setResetStep(0)}
        onConfirm={executeReset}
      />
    </SafeAreaView>
  );
}
