// Toast — in-app banner singkat untuk konfirmasi non-blocking.
//
// Filosofi (DESIGN.md section 7): cuma muncul kalau perlu, 3 detik max,
// tidak menutupi konten penting (di atas, pakai safe-area top).
//
// API:
//   1. Wrap root app dengan <ToastProvider>
//   2. Di mana saja: const { showToast } = useToast(); showToast('Saved');
//
// Variant:
//   - 'default' : background sage primary (sukses / info biasa)
//   - 'success' : alias untuk default (semantic clarity di call-site)
//   - 'error'   : background danger (mis. "WhatsApp tidak terbuka")

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme';

const TOAST_DURATION_MS = 2500;
const FADE_IN_MS = 200;
const FADE_OUT_MS = 300;
const SLIDE_OFFSET = -12;

type ToastVariant = 'default' | 'success' | 'error';

interface ToastState {
  message: string;
  variant: ToastVariant;
  key: number; // bump tiap show baru — supaya animasi re-trigger
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, variant: ToastVariant = 'default') => {
    setToast({ message, variant, key: Date.now() });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <ToastView
          key={toast.key}
          message={toast.message}
          variant={toast.variant}
          onHide={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
}

interface ToastViewProps {
  message: string;
  variant: ToastVariant;
  onHide: () => void;
}

function ToastView({ message, variant, onHide }: ToastViewProps) {
  const { colors, typography, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(SLIDE_OFFSET)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_IN_MS,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: FADE_IN_MS,
        useNativeDriver: true,
      }),
    ]).start();

    const hideTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: FADE_OUT_MS,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SLIDE_OFFSET,
          duration: FADE_OUT_MS,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, TOAST_DURATION_MS);

    return () => clearTimeout(hideTimer);
  }, [opacity, translateY, onHide]);

  const bgColor = variant === 'error' ? colors.danger : colors.primary;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: insets.top + spacing.md,
          left: spacing.lg,
          right: spacing.lg,
          backgroundColor: bgColor,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderRadius: radius.sm,
          opacity,
          transform: [{ translateY }],
        },
        shadow.md,
      ]}
    >
      <Text
        style={[
          typography.labelMD,
          { color: colors.textInverse, textAlign: 'center' },
        ]}
      >
        {message}
      </Text>
    </Animated.View>
  );
}
