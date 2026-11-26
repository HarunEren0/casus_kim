import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { ScreenContainer } from '../components/ScreenContainer';
import { Stepper } from '../components/Stepper';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { ALL_CATEGORY_IDS, WORD_CATEGORIES } from '../constants/words';
import { useGame } from '../context/GameContext';
import {
  DURATION_OPTIONS,
  getMaxSpyCount,
  MAX_PLAYERS,
  MIN_PLAYERS,
} from '../utils/game';
import { triggerLightHaptic } from '../utils/haptics';

export default function SetupScreen() {
  const {
    config,
    setPlayerCount,
    updatePlayerName,
    setSpyCount,
    setDurationMinutes,
    toggleCategory,
    selectAllCategories,
    setGiveSpyHint,
    startNewRound,
  } = useGame();

  const [showNames, setShowNames] = useState(false);

  const playerCount = config.playerNames.length;
  const maxSpies = getMaxSpyCount(playerCount);
  const allSelected = config.selectedCategories.length === ALL_CATEGORY_IDS.length;

  const totalWordCount = useMemo(() => {
    return WORD_CATEGORIES.filter((cat) =>
      config.selectedCategories.includes(cat.id)
    ).reduce((sum, cat) => sum + cat.words.length, 0);
  }, [config.selectedCategories]);

  const handleStartGame = () => {
    startNewRound();
    router.replace('/reveal');
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>TEK CİHAZ</Text>
            <Text style={styles.title}>Casus Kim</Text>
          </View>
          <Pressable
            onPress={() => {
              triggerLightHaptic();
              router.push('/rules');
            }}
            accessibilityRole="button"
            accessibilityLabel="Kurallar"
            style={styles.rulesLink}
          >
            <Text style={styles.rulesLinkText}>Kurallar</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <Text style={styles.settingTitle}>Oyuncu Sayısı</Text>
                <Text style={styles.settingHint}>3 ile 12 kişi arası</Text>
              </View>
              <Stepper
                value={playerCount}
                min={MIN_PLAYERS}
                max={MAX_PLAYERS}
                onChange={setPlayerCount}
                decrementLabel="Oyuncu sayısını azalt"
                incrementLabel="Oyuncu sayısını artır"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <Text style={styles.settingTitle}>Casus Sayısı</Text>
                <Text style={styles.settingHint}>En fazla {maxSpies} casus</Text>
              </View>
              <Stepper
                value={config.spyCount}
                min={1}
                max={maxSpies}
                onChange={setSpyCount}
                decrementLabel="Casus sayısını azalt"
                incrementLabel="Casus sayısını artır"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.blockRow}>
              <Text style={styles.settingTitle}>Tur Süresi</Text>
              <View style={styles.durationRow}>
                {DURATION_OPTIONS.map((minutes) => {
                  const active = config.durationMinutes === minutes;
                  return (
                    <Pressable
                      key={minutes}
                      onPress={() => {
                        triggerLightHaptic();
                        setDurationMinutes(minutes);
                      }}
                      style={[
                        styles.durationPill,
                        active && styles.durationPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.durationText,
                          active && styles.durationTextActive,
                        ]}
                      >
                        {minutes} dk
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <Text style={styles.settingTitle}>Casus İpucu</Text>
                <Text style={styles.settingHint}>
                  Casus, kelimeyle alakalı bir ipucu görür
                </Text>
              </View>
              <Switch
                value={config.giveSpyHint}
                onValueChange={(value) => {
                  triggerLightHaptic();
                  setGiveSpyHint(value);
                }}
                trackColor={{ false: COLORS.borderStrong, true: COLORS.textPrimary }}
                thumbColor={config.giveSpyHint ? COLORS.inkInverse : COLORS.textSecondary}
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kategoriler</Text>
              <Text style={styles.sectionMeta}>
                {config.selectedCategories.length} kategori · {totalWordCount} kelime
              </Text>
            </View>

            <View style={styles.chipWrap}>
              <Pressable
                onPress={() => {
                  triggerLightHaptic();
                  selectAllCategories();
                }}
                style={[styles.chip, allSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, allSelected && styles.chipTextActive]}>
                  Tümü
                </Text>
              </Pressable>

              {WORD_CATEGORIES.map((category) => {
                const selected = config.selectedCategories.includes(category.id);
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => {
                      triggerLightHaptic();
                      toggleCategory(category.id);
                    }}
                    style={[styles.chip, selected && !allSelected && styles.chipActive]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected && !allSelected && styles.chipTextActive,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Pressable
              onPress={() => {
                triggerLightHaptic();
                setShowNames((prev) => !prev);
              }}
              style={styles.sectionHeaderButton}
            >
              <View>
                <Text style={styles.sectionTitle}>Oyuncu İsimleri</Text>
                <Text style={styles.settingHint}>
                  {showNames ? 'İsimleri düzenlemek için dokunun' : 'İsteğe bağlı'}
                </Text>
              </View>
              <Text style={styles.toggleText}>{showNames ? 'Gizle' : 'Düzenle'}</Text>
            </Pressable>

            {showNames && (
              <View style={styles.namesList}>
                {config.playerNames.map((name, index) => (
                  <View key={`player-input-${index}`} style={styles.nameRow}>
                    <Text style={styles.nameIndex}>{index + 1}</Text>
                    <TextInput
                      value={name}
                      onChangeText={(text) => updatePlayerName(index, text)}
                      placeholder={`Oyuncu ${index + 1}`}
                      placeholderTextColor={COLORS.textMuted}
                      maxLength={24}
                      returnKeyType="done"
                      style={styles.nameInput}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Oyunu Başlat" onPress={handleStartGame} />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
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
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: COLORS.textPrimary,
  },
  rulesLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  rulesLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    gap: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  settingLabelGroup: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  blockRow: {
    gap: SPACING.sm,
  },
  durationRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  durationPill: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationPillActive: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  durationTextActive: {
    color: COLORS.inkInverse,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  chipActive: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  chipTextActive: {
    color: COLORS.inkInverse,
  },
  namesList: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  nameIndex: {
    width: 22,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  nameInput: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  footer: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
});
