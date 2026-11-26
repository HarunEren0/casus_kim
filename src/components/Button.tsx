import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';
import { triggerLightHaptic } from '../utils/haptics';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: ButtonProps) {
  const handlePress = () => {
    if (disabled) return;
    triggerLightHaptic();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' && styles.primaryLabel,
          variant === 'secondary' && styles.secondaryLabel,
          variant === 'ghost' && styles.ghostLabel,
          variant === 'danger' && styles.dangerLabel,
          disabled && styles.disabledLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primary: {
    backgroundColor: COLORS.textPrimary,
  },
  secondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
    minHeight: 44,
    paddingVertical: 10,
  },
  danger: {
    backgroundColor: COLORS.spy,
  },
  disabled: {
    opacity: 0.35,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primaryLabel: {
    color: COLORS.inkInverse,
  },
  secondaryLabel: {
    color: COLORS.textPrimary,
  },
  ghostLabel: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dangerLabel: {
    color: COLORS.inkInverse,
  },
  disabledLabel: {
    opacity: 0.8,
  },
});
