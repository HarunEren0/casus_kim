import { CategoryId, WORD_CATEGORIES } from '../constants/words';

export interface Player {
  id: string;
  name: string;
  isSpy: boolean;
}

export interface WordEntry {
  word: string;
  hint: string;
  categoryId: CategoryId;
  categoryLabel: string;
}

export interface GameConfig {
  playerNames: string[];
  spyCount: number;
  durationMinutes: number;
  selectedCategories: CategoryId[];
  giveSpyHint: boolean;
}

export interface RoundState {
  players: Player[];
  wordEntry: WordEntry;
  accusedPlayerIds: string[];
  revealedDirectly: boolean;
}

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;
export const DURATION_OPTIONS = [3, 5, 7, 10] as const;

export function getMaxSpyCount(playerCount: number): number {
  return Math.max(1, Math.min(3, Math.floor((playerCount - 1) / 2)));
}

export function createDefaultPlayerNames(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `Oyuncu ${index + 1}`);
}

export function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function pickWord(
  selectedCategories: CategoryId[],
  usedWords: string[]
): { entry: WordEntry; resetHistory: boolean } {
  const activeCategories = WORD_CATEGORIES.filter((cat) =>
    selectedCategories.includes(cat.id)
  );
  const categories = activeCategories.length > 0 ? activeCategories : WORD_CATEGORIES;

  const fullPool: WordEntry[] = categories.flatMap((cat) =>
    cat.words.map((item) => ({
      word: item.word,
      hint: item.hint,
      categoryId: cat.id,
      categoryLabel: cat.label,
    }))
  );

  const usedSet = new Set(usedWords);
  const available = fullPool.filter((item) => !usedSet.has(item.word));

  const pool = available.length > 0 ? available : fullPool;
  const resetHistory = available.length === 0;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  return { entry: picked, resetHistory };
}

export function createRound(
  config: GameConfig,
  usedWords: string[]
): { round: RoundState; resetHistory: boolean } {
  const sanitizedNames = config.playerNames.map((raw, index) => {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : `Oyuncu ${index + 1}`;
  });

  const clampedSpyCount = Math.min(
    Math.max(1, config.spyCount),
    getMaxSpyCount(sanitizedNames.length)
  );

  const indices = sanitizedNames.map((_, index) => index);
  const spyIndexSet = new Set(shuffleArray(indices).slice(0, clampedSpyCount));

  const players: Player[] = sanitizedNames.map((name, index) => ({
    id: `player-${index + 1}`,
    name,
    isSpy: spyIndexSet.has(index),
  }));

  const { entry: wordEntry, resetHistory } = pickWord(
    config.selectedCategories,
    usedWords
  );

  return {
    round: {
      players,
      wordEntry,
      accusedPlayerIds: [],
      revealedDirectly: false,
    },
    resetHistory,
  };
}

export function formatTimer(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
