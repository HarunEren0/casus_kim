import { Redirect, router } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { ScreenContainer } from '../components/ScreenContainer';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useGame } from '../context/GameContext';
import { triggerSuccessHaptic, triggerWarningHaptic } from '../utils/haptics';

export default function ResultScreen() {
  const { config, round, startNewRound, clearRound } = useGame();

  const spies = round ? round.players.filter((p) => p.isSpy) : [];
  const accusedSet = new Set(round?.accusedPlayerIds ?? []);
  const allSpiesCaught =
    !!round &&
    !round.revealedDirectly &&
    spies.length > 0 &&
    spies.length === accusedSet.size &&
    spies.every((spy) => accusedSet.has(spy.id));

  useEffect(() => {
    if (!round || round.revealedDirectly) return;
    if (allSpiesCaught) {
      triggerSuccessHaptic();
    } else {
      triggerWarningHaptic();
    }
  }, [round, allSpiesCaught]);

  if (!round) {
    return <Redirect href="/" />;
  }

  const spyNames = spies.map((s) => s.name).join(', ');
  const isPluralSpy = spies.length > 1;

  let bannerEyebrow = 'TUR SONUCU';
  let bannerTitle = 'Roller Açıklandı';
  let bannerSubtitle = 'Yeni tura geçebilir veya ayarları değiştirebilirsiniz.';
  let bannerTone: 'neutral' | 'civilian' | 'spy' = 'neutral';

  if (!round.revealedDirectly) {
    if (allSpiesCaught) {
      bannerEyebrow = 'SONUÇ';
      bannerTitle = 'Siviller Kazandı';
      bannerSubtitle = isPluralSpy
        ? 'Tüm casuslar doğru tahmin edildi.'
        : 'Casus doğru tahmin edildi.';
      bannerTone = 'civilian';
    } else {
      bannerEyebrow = 'SONUÇ';
      bannerTitle = isPluralSpy ? 'Casuslar Kazandı' : 'Casus Kazandı';
      bannerSubtitle = isPluralSpy
        ? 'Casuslar gizlenmeyi başardı.'
        : 'Casus gizlenmeyi başardı.';
      bannerTone = 'spy';
    }
  }

  const handlePlayAgain = () => {
    startNewRound();
    router.replace('/reveal');
  };

  const handleBackToSetup = () => {
    clearRound();
    router.replace('/');
  };

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.banner,
            bannerTone === 'civilian' && styles.bannerCivilian,
            bannerTone === 'spy' && styles.bannerSpy,
          ]}
        >
          <Text
            style={[
              styles.bannerEyebrow,
              bannerTone === 'civilian' && styles.textCivilian,
              bannerTone === 'spy' && styles.textSpy,
            ]}
          >
            {bannerEyebrow}
          </Text>
          <Text
            style={[
              styles.bannerTitle,
              bannerTone === 'civilian' && styles.textCivilian,
              bannerTone === 'spy' && styles.textSpy,
            ]}
          >
            {bannerTitle}
          </Text>
          <Text style={styles.bannerSubtitle}>{bannerSubtitle}</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>GİZLİ KELİME</Text>
            <Text style={styles.summaryWord}>{round.wordEntry.word}</Text>
            <Text style={styles.summaryCategory}>
              {round.wordEntry.categoryLabel}
              {config.giveSpyHint ? ` · İpucu: ${round.wordEntry.hint}` : ''}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>
              {isPluralSpy ? 'CASUSLAR' : 'CASUS'}
            </Text>
            <Text style={styles.summarySpyName}>{spyNames}</Text>
          </View>
        </View>

        <View style={styles.rosterCard}>
          <Text style={styles.rosterHeading}>OYUNCU ROLLERİ</Text>
          <View style={styles.rosterList}>
            {round.players.map((player) => {
              const wasAccused = accusedSet.has(player.id);
              return (
                <View key={player.id} style={styles.rosterRow}>
                  <View style={styles.rosterLeft}>
                    <Text style={styles.rosterName}>{player.name}</Text>
                    {wasAccused && (
                      <Text style={styles.accusedLabel}>Suçlandı</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.rolePill,
                      player.isSpy ? styles.rolePillSpy : styles.rolePillCivilian,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rolePillText,
                        player.isSpy
                          ? styles.rolePillTextSpy
                          : styles.rolePillTextCivilian,
                      ]}
                    >
                      {player.isSpy ? 'Casus' : 'Sivil'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Aynı Oyuncularla Yeni Tur" onPress={handlePlayAgain} />
        <Button
          label="Ayarlara Dön"
          variant="secondary"
          onPress={handleBackToSetup}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.lg,
  },
  banner: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  bannerCivilian: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.successBorder,
  },
  bannerSpy: {
    backgroundColor: COLORS.spyBg,
    borderColor: COLORS.spyBorder,
  },
  bannerEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  textCivilian: {
    color: COLORS.success,
  },
  textSpy: {
    color: COLORS.spy,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
  },
  summaryBlock: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  summaryWord: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  summaryCategory: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  summarySpyName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.spy,
    textAlign: 'center',
  },
  rosterCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  rosterHeading: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  rosterList: {
    gap: SPACING.sm,
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rosterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  rosterName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  accusedLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  rolePillSpy: {
    backgroundColor: COLORS.spyBg,
  },
  rolePillCivilian: {
    backgroundColor: COLORS.surfaceMuted,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rolePillTextSpy: {
    color: COLORS.spy,
  },
  rolePillTextCivilian: {
    color: COLORS.textSecondary,
  },
  footer: {
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
});
