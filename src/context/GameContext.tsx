import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ALL_CATEGORY_IDS, CategoryId } from '../constants/words';
import {
  createDefaultPlayerNames,
  createRound,
  GameConfig,
  getMaxSpyCount,
  MAX_PLAYERS,
  MIN_PLAYERS,
  RoundState,
} from '../utils/game';

interface GameContextValue {
  config: GameConfig;
  round: RoundState | null;
  setPlayerCount: (nextCount: number) => void;
  updatePlayerName: (index: number, name: string) => void;
  setSpyCount: (nextCount: number) => void;
  setDurationMinutes: (minutes: number) => void;
  toggleCategory: (categoryId: CategoryId) => void;
  selectAllCategories: () => void;
  setGiveSpyHint: (enabled: boolean) => void;
  startNewRound: () => void;
  submitAccusation: (playerIds: string[]) => void;
  revealWithoutVote: () => void;
  clearRound: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

const INITIAL_CONFIG: GameConfig = {
  playerNames: createDefaultPlayerNames(4),
  spyCount: 1,
  durationMinutes: 5,
  selectedCategories: [...ALL_CATEGORY_IDS],
  giveSpyHint: true,
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<GameConfig>(INITIAL_CONFIG);
  const [round, setRound] = useState<RoundState | null>(null);
  const usedWordsRef = useRef<string[]>([]);

  const setPlayerCount = useCallback((nextCount: number) => {
    const clamped = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, nextCount));
    setConfig((prev) => {
      const currentLength = prev.playerNames.length;
      let nextNames = prev.playerNames;

      if (clamped > currentLength) {
        const added = Array.from(
          { length: clamped - currentLength },
          (_, offset) => `Oyuncu ${currentLength + offset + 1}`
        );
        nextNames = [...prev.playerNames, ...added];
      } else if (clamped < currentLength) {
        nextNames = prev.playerNames.slice(0, clamped);
      }

      const maxSpies = getMaxSpyCount(clamped);
      return {
        ...prev,
        playerNames: nextNames,
        spyCount: Math.min(prev.spyCount, maxSpies),
      };
    });
  }, []);

  const updatePlayerName = useCallback((index: number, name: string) => {
    setConfig((prev) => {
      if (index < 0 || index >= prev.playerNames.length) return prev;
      const nextNames = [...prev.playerNames];
      nextNames[index] = name;
      return { ...prev, playerNames: nextNames };
    });
  }, []);

  const setSpyCount = useCallback((nextCount: number) => {
    setConfig((prev) => {
      const maxSpies = getMaxSpyCount(prev.playerNames.length);
      const clamped = Math.min(maxSpies, Math.max(1, nextCount));
      return { ...prev, spyCount: clamped };
    });
  }, []);

  const setDurationMinutes = useCallback((minutes: number) => {
    setConfig((prev) => ({ ...prev, durationMinutes: minutes }));
  }, []);

  const toggleCategory = useCallback((categoryId: CategoryId) => {
    setConfig((prev) => {
      if (prev.selectedCategories.length === ALL_CATEGORY_IDS.length) {
        return {
          ...prev,
          selectedCategories: [categoryId],
        };
      }
      const exists = prev.selectedCategories.includes(categoryId);
      if (exists) {
        if (prev.selectedCategories.length <= 1) {
          return prev;
        }
        return {
          ...prev,
          selectedCategories: prev.selectedCategories.filter((id) => id !== categoryId),
        };
      }
      return {
        ...prev,
        selectedCategories: [...prev.selectedCategories, categoryId],
      };
    });
  }, []);

  const selectAllCategories = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      selectedCategories: [...ALL_CATEGORY_IDS],
    }));
  }, []);

  const setGiveSpyHint = useCallback((enabled: boolean) => {
    setConfig((prev) => ({ ...prev, giveSpyHint: enabled }));
  }, []);

  const startNewRound = useCallback(() => {
    const { round: nextRound, resetHistory } = createRound(config, usedWordsRef.current);
    if (resetHistory) {
      usedWordsRef.current = [nextRound.wordEntry.word];
    } else {
      usedWordsRef.current = [...usedWordsRef.current, nextRound.wordEntry.word];
    }
    setRound(nextRound);
  }, [config]);

  const submitAccusation = useCallback((playerIds: string[]) => {
    setRound((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        accusedPlayerIds: playerIds,
        revealedDirectly: false,
      };
    });
  }, []);

  const revealWithoutVote = useCallback(() => {
    setRound((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        accusedPlayerIds: [],
        revealedDirectly: true,
      };
    });
  }, []);

  const clearRound = useCallback(() => {
    setRound(null);
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      config,
      round,
      setPlayerCount,
      updatePlayerName,
      setSpyCount,
      setDurationMinutes,
      toggleCategory,
      selectAllCategories,
      setGiveSpyHint,
      startNewRound,
      submitAccusation,
      revealWithoutVote,
      clearRound,
    }),
    [
      config,
      round,
      setPlayerCount,
      updatePlayerName,
      setSpyCount,
      setDurationMinutes,
      toggleCategory,
      selectAllCategories,
      setGiveSpyHint,
      startNewRound,
      submitAccusation,
      revealWithoutVote,
      clearRound,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used inside GameProvider');
  }
  return ctx;
}
