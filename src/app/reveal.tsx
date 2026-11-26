import { Redirect, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useGame } from '../context/GameContext';
import { triggerLightHaptic, triggerMediumHaptic } from '../utils/haptics';

const CARD_HEIGHT = 410;

export default function RevealScreen() {
  const { config, round, clearRound } = useGame();
  const [playerIndex, setPlayerIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const [flipAnim] = useState(() => new Animated.Value(0));
  const [dealX] = useState(() => new Animated.Value(0));
  const [dealY] = useState(() => new Animated.Value(28));
  const [dealScale] = useState(() => new Animated.Value(0.94));
  const [dealOpacity] = useState(() => new Animated.Value(0));
  const [dealTilt] = useState(() => new Animated.Value(0));
  const [deckLift] = useState(() => new Animated.Value(0));
  const [progressAnim] = useState(() => new Animated.Value(0));

  const busyRef = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(dealY, {
        toValue: 0,
        friction: 11,
        tension: 145,
        useNativeDriver: true,
      }),
      Animated.spring(dealScale, {
        toValue: 1,
        friction: 11,
        tension: 145,
        useNativeDriver: true,
      }),
      Animated.timing(dealOpacity, {
        toValue: 1,
        duration: 130,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [dealOpacity, dealScale, dealY]);

  const totalPlayers = round?.players.length ?? 1;
  const targetProgress = (playerIndex + (isOpen ? 1 : 0.35)) / totalPlayers;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.min(1, targetProgress),
      duration: 140,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progressAnim, targetProgress]);

  if (!round) {
    return <Redirect href="/" />;
  }

  const currentPlayer = round.players[playerIndex];
  const isLastPlayer = playerIndex === totalPlayers - 1;
  const remainingCards = totalPlayers - 1 - playerIndex;
  const cardNumber = String(playerIndex + 1).padStart(2, '0');

  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.499, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.499, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });
  const flipScale = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.94, 1],
  });
  const dealRotateZ = dealTilt.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-7deg', '0deg', '7deg'],
  });
  const deckFirstY = deckLift.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 2],
  });
  const deckFirstScale = deckLift.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 0.99],
  });

  const handleRevealCard = () => {
    if (busyRef.current || isOpen) return;

    busyRef.current = true;
    setIsBusy(true);
    triggerMediumHaptic();
    setIsOpen(true);

    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 180,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      busyRef.current = false;
      setIsBusy(false);
    });
  };

  const handleConfirmAndNext = () => {
    if (busyRef.current || !isOpen) return;

    busyRef.current = true;
    setIsBusy(true);
    triggerLightHaptic();
    setIsOpen(false);

    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 115,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      Animated.parallel([
        Animated.timing(dealX, {
          toValue: -360,
          duration: 125,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(dealTilt, {
          toValue: -1,
          duration: 125,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(dealOpacity, {
          toValue: 0,
          duration: 110,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(deckLift, {
          toValue: 1,
          duration: 120,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isLastPlayer) {
          router.replace('/play');
          return;
        }

        setPlayerIndex((prev) => prev + 1);
        flipAnim.setValue(0);
        deckLift.setValue(0);
        dealX.setValue(280);
        dealY.setValue(0);
        dealTilt.setValue(0.6);
        dealScale.setValue(0.94);
        dealOpacity.setValue(0);

        Animated.parallel([
          Animated.spring(dealX, {
            toValue: 0,
            friction: 11,
            tension: 145,
            useNativeDriver: true,
          }),
          Animated.spring(dealTilt, {
            toValue: 0,
            friction: 11,
            tension: 145,
            useNativeDriver: true,
          }),
          Animated.spring(dealScale, {
            toValue: 1,
            friction: 11,
            tension: 145,
            useNativeDriver: true,
          }),
          Animated.timing(dealOpacity, {
            toValue: 1,
            duration: 100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(() => {
          busyRef.current = false;
          setIsBusy(false);
        });
      });
    });
  };

  const handleCancel = () => {
    triggerLightHaptic();
    clearRound();
    router.replace('/');
  };

  return (
    <ScreenContainer>
      <View style={styles.topBar}>
        <Text style={styles.counter}>
          KART {cardNumber} / {String(totalPlayers).padStart(2, '0')}
        </Text>
        <Pressable
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel="İptal"
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>İptal</Text>
        </Pressable>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              transform: [{ scaleX: progressAnim }],
            },
          ]}
        />
      </View>

      <View style={styles.stage}>
        <View style={styles.deckWrapper}>
          {remainingCards >= 2 && (
            <View pointerEvents="none" style={[styles.deckCard, styles.deckCardBack]} />
          )}

          {remainingCards >= 1 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.deckCard,
                styles.deckCardNext,
                {
                  transform: [
                    { translateY: deckFirstY },
                    { scale: deckFirstScale },
                  ],
                },
              ]}
            />
          )}

          <Animated.View
            style={[
              styles.activeCardSlot,
              {
                opacity: dealOpacity,
                transform: [
                  { translateX: dealX },
                  { translateY: dealY },
                  { rotateZ: dealRotateZ },
                  { scale: dealScale },
                ],
              },
            ]}
          >
            {/* KAPALI YÜZ (FRONT) */}
            <Animated.View
              pointerEvents={isOpen ? 'none' : 'auto'}
              style={[
                styles.cardFace,
                styles.closedCard,
                {
                  opacity: frontOpacity,
                  transform: [
                    { perspective: 1100 },
                    { rotateY: frontRotateY },
                    { scale: flipScale },
                  ],
                },
              ]}
            >
              <View style={styles.closedInnerFrame}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cornerIndex}>{cardNumber}</Text>
                  <View style={styles.closedStatusPill}>
                    <Text style={styles.closedStatusText}>KAPALI</Text>
                  </View>
                  <Text style={styles.cornerIndex}>{cardNumber}</Text>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.emblemDiamond} />
                  <Text style={styles.cardEyebrow}>SIRA SENDE</Text>
                  <Text style={styles.playerName}>{currentPlayer.name}</Text>
                </View>

                <Pressable
                  onPress={handleRevealCard}
                  disabled={isBusy}
                  accessibilityRole="button"
                  accessibilityLabel="Kelimeyi Gör"
                  style={styles.cardActionPrimary}
                >
                  <Text style={styles.cardActionPrimaryText}>Kelimeyi Gör</Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* AÇIK YÜZ (BACK) */}
            <Animated.View
              pointerEvents={isOpen ? 'auto' : 'none'}
              style={[
                styles.cardFace,
                currentPlayer.isSpy ? styles.openSpyCard : styles.openCivilianCard,
                {
                  opacity: backOpacity,
                  transform: [
                    { perspective: 1100 },
                    { rotateY: backRotateY },
                    { scale: flipScale },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.openInnerFrame,
                  currentPlayer.isSpy
                    ? styles.openSpyInnerFrame
                    : styles.openCivilianInnerFrame,
                ]}
              >
                <View style={styles.cardTopRow}>
                  <Text
                    style={[
                      styles.cornerIndex,
                      currentPlayer.isSpy && styles.cornerIndexSpy,
                    ]}
                  >
                    {currentPlayer.isSpy ? 'C' : cardNumber}
                  </Text>
                  <View
                    style={
                      currentPlayer.isSpy
                        ? styles.openSpyStatusPill
                        : styles.openCivilianStatusPill
                    }
                  >
                    <Text style={styles.openStatusText}>AÇIK</Text>
                  </View>
                  <Text
                    style={[
                      styles.cornerIndex,
                      currentPlayer.isSpy && styles.cornerIndexSpy,
                    ]}
                  >
                    {currentPlayer.isSpy ? 'C' : cardNumber}
                  </Text>
                </View>

                {currentPlayer.isSpy ? (
                  <View style={styles.cardBody}>
                    <Text style={styles.spyEyebrow}>{currentPlayer.name}</Text>
                    <Text style={styles.spyTitle}>CASUS</Text>
                    {config.giveSpyHint && (
                      <View style={styles.spyHintBadge}>
                        <Text style={styles.spyHintLabel}>İPUCU</Text>
                        <Text style={styles.spyHintText}>
                          {round.wordEntry.hint}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.cardBody}>
                    <Text style={styles.cardEyebrow}>{currentPlayer.name}</Text>
                    <Text style={styles.wordLabel}>GİZLİ KELİME</Text>
                    <Text style={styles.wordText}>{round.wordEntry.word}</Text>
                  </View>
                )}

                <Pressable
                  onPress={handleConfirmAndNext}
                  disabled={isBusy}
                  accessibilityRole="button"
                  accessibilityLabel={isLastPlayer ? 'Anladım, Başlat' : 'Anladım'}
                  style={
                    currentPlayer.isSpy
                      ? styles.cardActionSpy
                      : styles.cardActionPrimary
                  }
                >
                  <Text style={styles.cardActionPrimaryText}>
                    {isLastPlayer ? 'Anladım, Başlat' : 'Anladım'}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </Animated.View>
        </View>
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
    paddingBottom: SPACING.sm,
  },
  counter: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: COLORS.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  progressTrack: {
    height: 3,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.textPrimary,
    transformOrigin: 'left',
  },
  stage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  deckWrapper: {
    width: '100%',
    height: CARD_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deckCard: {
    position: 'absolute',
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  deckCardBack: {
    backgroundColor: '#101216',
    borderColor: '#232730',
    transform: [{ translateY: 22 }, { scale: 0.9 }, { rotateZ: '-1.8deg' }],
  },
  deckCardNext: {
    backgroundColor: '#14171D',
    borderColor: '#2E333E',
  },
  activeCardSlot: {
    width: '100%',
    height: CARD_HEIGHT,
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS.xl,
    padding: 10,
    backfaceVisibility: 'hidden',
  },
  closedCard: {
    backgroundColor: '#14161C',
    borderWidth: 1.5,
    borderColor: '#3E4452',
  },
  openCivilianCard: {
    backgroundColor: '#1D2129',
    borderWidth: 2,
    borderColor: COLORS.textPrimary,
  },
  openSpyCard: {
    backgroundColor: COLORS.spyCardBg,
    borderWidth: 2,
    borderColor: COLORS.spy,
  },
  closedInnerFrame: {
    flex: 1,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#2C313D',
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  openInnerFrame: {
    flex: 1,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  openCivilianInnerFrame: {
    borderColor: '#363C4B',
  },
  openSpyInnerFrame: {
    borderColor: COLORS.spyBorder,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cornerIndex: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.textMuted,
    fontVariant: ['tabular-nums'],
    minWidth: 22,
    textAlign: 'center',
  },
  cornerIndexSpy: {
    color: COLORS.spy,
  },
  closedStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surface,
  },
  closedStatusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.textSecondary,
  },
  openCivilianStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.textPrimary,
  },
  openSpyStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.spy,
  },
  openStatusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.inkInverse,
  },
  cardBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  emblemDiamond: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: COLORS.borderStrong,
    transform: [{ rotate: '45deg' }],
    marginBottom: SPACING.lg,
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  playerName: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  wordLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: 8,
  },
  wordText: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  spyEyebrow: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  spyTitle: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 3,
    color: COLORS.spy,
    textAlign: 'center',
  },
  spyHintBadge: {
    marginTop: SPACING.lg,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.spyBorder,
    backgroundColor: COLORS.spyBg,
    alignItems: 'center',
    gap: 3,
  },
  spyHintLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: COLORS.textSecondary,
  },
  spyHintText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cardActionPrimary: {
    width: '100%',
    minHeight: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  cardActionSpy: {
    width: '100%',
    minHeight: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.spy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  cardActionPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: COLORS.inkInverse,
  },
});
