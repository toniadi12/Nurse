// Reusable read/edit toggle untuk field text di settings.
// Read mode: tampilkan value (atau placeholder kosong) + tombol "Edit".
// Edit mode: TextInput + tombol "Simpan" / "Batal".
//
// Validation rule pakai callback `validate` — caller decide rules-nya
// (mis. nama: min 2 / max 40; ruangan: opsional, max 50).

import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/context/theme';

interface Props {
  // Current value yang sudah tersimpan. Bisa undefined untuk field opsional
  // yang belum pernah diisi.
  value: string | undefined;
  // Dipanggil saat user tap "Simpan" + value valid.
  onSave: (v: string) => void;
  placeholder?: string;
  // Validator. Return null kalau valid, atau pesan error string kalau tidak.
  validate: (v: string) => string | null;
  // Optional helper text di bawah field (read mode).
  helperText?: string;
  // Untuk display saat value kosong di read mode.
  emptyText?: string;
  maxLength?: number;
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
}

export function EditableTextField({
  value,
  onSave,
  placeholder,
  validate,
  helperText,
  emptyText = 'Not set',
  maxLength,
  autoCapitalize = 'words',
}: Props) {
  const { colors, typography, spacing, radius } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const [error, setError] = useState<string | null>(null);

  function handleStartEdit() {
    setDraft(value ?? '');
    setError(null);
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
    setError(null);
  }

  function handleSave() {
    const trimmed = draft.trim();
    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave(trimmed);
    setEditing(false);
    setError(null);
  }

  // === Read mode ===
  if (!editing) {
    const display = value && value.length > 0 ? value : emptyText;
    const isEmpty = !value || value.length === 0;
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.sm,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[
              typography.bodyMD,
              {
                color: isEmpty ? colors.textTertiary : colors.textPrimary,
              },
            ]}
          >
            {display}
          </Text>
          {helperText && !isEmpty && (
            <Text
              style={[
                typography.bodySM,
                { color: colors.textTertiary, marginTop: spacing.xs },
              ]}
            >
              {helperText}
            </Text>
          )}
        </View>
        <Pressable
          onPress={handleStartEdit}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Edit"
        >
          <Text style={[typography.labelMD, { color: colors.primary }]}>
            Edit
          </Text>
        </Pressable>
      </View>
    );
  }

  // === Edit mode ===
  return (
    <View>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        autoFocus
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        maxLength={maxLength}
        style={{
          fontFamily: typography.bodyMD.fontFamily,
          fontSize: typography.bodyMD.fontSize,
          color: colors.textPrimary,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        }}
      />
      {error && (
        <Text
          style={[
            typography.bodySM,
            { color: colors.danger, marginTop: spacing.xs },
          ]}
        >
          {error}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          gap: spacing.sm,
          marginTop: spacing.md,
        }}
      >
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: colors.primary,
            paddingVertical: spacing.md,
            borderRadius: radius.sm,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={[typography.labelMD, { color: colors.textInverse }]}>
            Save
          </Text>
        </Pressable>
        <Pressable
          onPress={handleCancel}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: spacing.md,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={[typography.labelMD, { color: colors.textSecondary }]}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
