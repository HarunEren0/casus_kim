import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';
import { triggerLightHaptic } from '../utils/haptics';

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (nextValue: number) => void;
  decrementLabel: string;
  incrementLabel: string;
}

export function Stepper({
  value,
  min,
  max,
  onChange,
  decrementLabel,
  incrementLabel,
}: StepperProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  const handleStep = (delta: number) => {
    const next = value + delta;
    if (next < min || next > max) return;
    triggerLightHaptic();
    onChange(next);
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => handleStep(-1)}
        disabled={!canDecrement}
        accessibilityRole="button"
        accessibilityLabel={decrementLabel}
        style={[
          styles.stepButton,
          !canDecrement && styles.stepButtonDisabled,
        ]}
      >
        <Text style={[styles.stepSymbol, !canDecrement && styles.stepSymbolDisabled]}>-</Text>
      </Pressable>

      <Text style={styles.valueText}>{value}</Text>

      <Pressable
        onPress={() => handleStep(1)}
        disabled={!canIncrement}
        accessibilityRole="button"
        accessibilityLabel={incrementLabel}
        style={[
          styles.stepButton,
          !canIncrement && styles.stepButtonDisabled,
        ]}
      >
        <Text style={[styles.stepSymbol, !canIncrement && styles.stepSymbolDisabled]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonDisabled: {
    borderColor: COLORS.border,
    opacity: 0.4,
  },
  stepSymbol: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  stepSymbolDisabled: {
    color: COLORS.textMuted,
  },
  valueText: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
});
