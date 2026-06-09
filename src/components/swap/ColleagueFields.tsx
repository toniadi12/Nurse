// Field nama + nomor WA kolega di wizard /swap/new.
// Memisah biar parent screen tetap di bawah 300 baris (CLAUDE.md limit).

import { Text, TextInput, View } from 'react-native';
import { useTheme } from '@/context/theme';
import { FieldLabel } from '@/components/ui/FormTextField';

interface Props {
  name: string;
  onNameChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  phoneValid: boolean;
}

export function ColleagueFields({
  name,
  onNameChange,
  phone,
  onPhoneChange,
  phoneValid,
}: Props) {
  const { colors, typography, spacing, radius } = useTheme();

  const inputBaseStyle = {
    fontFamily: typography.bodyMD.fontFamily,
    fontSize: typography.bodyMD.fontSize,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  };

  const showPhoneError = phone.length > 0 && !phoneValid;

  return (
    <View>
      <View style={{ marginTop: spacing['2xl'] }}>
        <FieldLabel>Colleague's name</FieldLabel>
        <TextInput
          value={name}
          onChangeText={onNameChange}
          placeholder="e.g. Maya"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={40}
          style={[inputBaseStyle, { borderColor: colors.border }]}
        />
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <FieldLabel>Colleague's WhatsApp number</FieldLabel>
        <TextInput
          value={phone}
          onChangeText={onPhoneChange}
          placeholder="07123 456 789"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="phone-pad"
          maxLength={20}
          style={[
            inputBaseStyle,
            { borderColor: showPhoneError ? colors.danger : colors.border },
          ]}
        />
        <Text
          style={[
            typography.bodySM,
            {
              color: showPhoneError ? colors.danger : colors.textTertiary,
              marginTop: spacing.xs,
            },
          ]}
        >
          {showPhoneError
            ? 'Format not recognised. Try 07xxx or +44 7xxx.'
            : 'UK format: 07xxx, +44 7xxx, or 44 7xxx.'}
        </Text>
      </View>
    </View>
  );
}
