import { Redirect, router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { ScreenContainer } from '../components/ScreenContainer';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useGame } from '../context/GameContext';
import { triggerLightHaptic } from '../utils/haptics';

export default function VoteScreen() {
  const { round, submitAccusation, revealWithoutVote } = useGame();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!round) {
    return <Redirect href="/" />;
  }

  const spyCount = round.players.filter((p) => p.isSpy).length;
  const canConfirm = selectedIds.length === spyCount;

  const handleSelectPlayer = (playerId: string) => {
    triggerLightHaptic();
    setSelectedIds((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      }
      if (spyCount === 1) {
        return [playerId];
      }
      if (prev.length >= spyCount) {
        return [...prev.slice(1), playerId];
      }
      return [...prev, playerId];
    });
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    submitAccusation(selectedIds);
    router.replace('/result');
  };

  const handleSkipVote = () => {
    revealWithoutVote();
    router.replace('/result');
  };

  return (
    <ScreenContainer>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            triggerLightHaptic();
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel="Geri"
          style={styles.backButton}
        >
          <Text style={styles.backText}>Geri</Text>
        </Pressable>
        <Text style={styles.selectionCount}>
          {selectedIds.length} / {spyCount} seçildi
        </Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>OYLAMA</Text>
        <Text style={styles.title}>Grup kimi suçluyor?</Text>
        <Text style={styles.subtitle}>
          {spyCount === 1
            ? 'Casus olduğunu düşündüğünüz 1 oyuncuyu seçin.'
            : `Casus olduğunu düşündüğünüz ${spyCount} oyuncuyu seçin.`}
        </Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {round.players.map((player, index) => {
          const isSelected = selectedIds.includes(player.id);
          return (
            <Pressable
              key={player.id}
              onPress={() => handleSelectPlayer(player.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              style={[
                styles.playerRow,
                isSelected && styles.playerRowSelected,
              ]}
            >
              <View style={styles.playerLeft}>
                <Text
                  style={[
                    styles.playerIndex,
                    isSelected && styles.playerIndexSelected,
                  ]}
                >
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Text
                  style={[
                    styles.playerName,
                    isSelected && styles.playerNameSelected,
                  ]}
                >
                  {player.name}
                </Text>
              </View>

              <View
                style={[
                  styles.indicator,
                  isSelected && styles.indicatorSelected,
                ]}
              >
                {isSelected && <View style={styles.indicatorDot} />}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Kararı Onayla"
          onPress={handleConfirm}
          disabled={!canConfirm}
        />
        <Button
          label="Oylamasız Sonucu Gör"
          variant="ghost"
          onPress={handleSkipVote}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
  },
  backButton: {
    paddingVertical: 6,
    paddingRight: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  selectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontVariant: ['tabular-nums'],
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
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  list: {
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    minHeight: 58,
  },
  playerRowSelected: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  playerIndex: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    fontVariant: ['tabular-nums'],
  },
  playerIndexSelected: {
    color: '#5A5E68',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  playerNameSelected: {
    color: COLORS.inkInverse,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorSelected: {
    borderColor: COLORS.inkInverse,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.inkInverse,
  },
  footer: {
    gap: SPACING.xs,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
});
