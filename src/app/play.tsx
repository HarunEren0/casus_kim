import { Redirect, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { ScreenContainer } from '../components/ScreenContainer';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useGame } from '../context/GameContext';
import { formatTimer } from '../utils/game';
import { triggerLightHaptic, triggerWarningHaptic } from '../utils/haptics';

export default function PlayScreen() {
  const { config, round, revealWithoutVote, clearRound } = useGame();
  const initialSeconds = config.durationMinutes * 60;
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const warnedZeroRef = useRef(false);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const timerId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && !warnedZeroRef.current) {
      warnedZeroRef.current = true;
      setIsRunning(false);
      triggerWarningHaptic();
    }
  }, [secondsLeft]);

  if (!round) {
    return <Redirect href="/" />;
  }

  const spyCount = round.players.filter((p) => p.isSpy).length;
  const isFinished = secondsLeft === 0;
  const isLowTime = secondsLeft > 0 && secondsLeft <= 30;
  const progressRatio = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  const handleToggleRunning = () => {
    triggerLightHaptic();
    if (isFinished) {
      setSecondsLeft(60);
      setTotalSeconds((prev) => prev + 60);
      warnedZeroRef.current = false;
      setIsRunning(true);
      return;
    }
    setIsRunning((prev) => !prev);
  };

  const handleAddMinute = () => {
    triggerLightHaptic();
    warnedZeroRef.current = false;
    setSecondsLeft((prev) => prev + 60);
    setTotalSeconds((prev) => prev + 60);
  };

  const handleDirectReveal = () => {
    revealWithoutVote();
    router.replace('/result');
  };

  const handleExit = () => {
    triggerLightHaptic();
    clearRound();
    router.replace('/');
  };

  return (
    <ScreenContainer>
      <View style={styles.topBar}>
        <Text style={styles.eyebrow}>TUR</Text>
        <Pressable
          onPress={handleExit}
          accessibilityRole="button"
          accessibilityLabel="Ayarlar"
          style={styles.exitButton}
        >
          <Text style={styles.exitText}>Ayarlar</Text>
        </Pressable>
      </View>

      <View style={styles.timerSection}>
        <Text
          style={[
            styles.timerValue,
            (isLowTime || isFinished) && styles.timerWarning,
          ]}
        >
          {formatTimer(secondsLeft)}
        </Text>

        <Text style={[styles.timerStatus, isFinished && styles.timerWarning]}>
          {isFinished
            ? 'Süre doldu. Oylamaya geçebilirsiniz.'
            : isRunning
              ? 'Sırayla kelime söyleyin.'
              : 'Süre duraklatıldı.'}
        </Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              (isLowTime || isFinished) && styles.progressFillWarning,
              { width: `${Math.max(0, Math.min(100, progressRatio * 100))}%` },
            ]}
          />
        </View>

        <View style={styles.controlsRow}>
          <Pressable
            onPress={handleToggleRunning}
            accessibilityRole="button"
            style={styles.controlPill}
          >
            <Text style={styles.controlText}>
              {isFinished ? '+1 dk Başlat' : isRunning ? 'Duraklat' : 'Devam Et'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleAddMinute}
            accessibilityRole="button"
            style={styles.controlPill}
          >
            <Text style={styles.controlText}>+1 dk</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.metaCard}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Oyuncular</Text>
          <Text style={styles.metaValue}>{round.players.length}</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Gizli Casus</Text>
          <Text style={styles.metaValue}>{spyCount}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Oylamaya Geç" onPress={() => router.push('/vote')} />
        <Button
          label="Casusu Direkt Göster"
          variant="ghost"
          onPress={handleDirectReveal}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: COLORS.textMuted,
  },
  exitButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  exitText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  timerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  timerValue: {
    fontSize: 68,
    fontWeight: '700',
    letterSpacing: -2,
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  timerWarning: {
    color: COLORS.spy,
  },
  timerStatus: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 3,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
    marginTop: SPACING.xl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.textPrimary,
  },
  progressFillWarning: {
    backgroundColor: COLORS.spy,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  controlPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surface,
  },
  controlText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  metaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  metaRow: {
    flex: 1,
    alignItems: 'center',
  },
  metaDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  metaLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    gap: SPACING.xs,
    paddingBottom: SPACING.md,
  },
});
