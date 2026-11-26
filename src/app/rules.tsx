import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { ScreenContainer } from '../components/ScreenContainer';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const STEPS = [
  {
    number: '01',
    title: 'Kartları Dağıtın',
    description:
      'Telefonu sırayla her oyuncuya verin. Siviller aynı gizli kelimeyi görür; casus yalnızca casus olduğunu (ve açıksa kelimeyle alakalı bir ipucunu) görür.',
  },
  {
    number: '02',
    title: 'Sırayla Kelime Söyleyin',
    description:
      'Süre başladığında oyuncular sırayla gizli kelimeyle ilişkili birer kelime söyler. Siviller kelimeyi doğrudan açık etmeden bildiklerini gösterir.',
  },
  {
    number: '03',
    title: 'Casus Gizlenir',
    description:
      'Casus, söylenen kelimelerden gizli kelimeyi anlamaya çalışır ve kendini belli etmeden uyumlu kelimeler söyler.',
  },
  {
    number: '04',
    title: 'Oylama ve Sonuç',
    description:
      'Süre dolduğunda ya da grup hazır olduğunda oylamaya geçilir. Tüm casuslar bulunursa siviller, aksi halde casus kazanır.',
  },
];

export default function RulesScreen() {
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>NASIL OYNANIR</Text>
        <Text style={styles.title}>Kurallar</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {STEPS.map((step) => (
          <View key={step.number} style={styles.card}>
            <Text style={styles.stepNumber}>{step.number}</Text>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Anladım" onPress={() => router.back()} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: COLORS.textPrimary,
  },
  list: {
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  card: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    fontVariant: ['tabular-nums'],
    paddingTop: 2,
  },
  stepBody: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
  footer: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
});
