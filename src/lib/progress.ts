import type { PlayerProgress } from '../types';

export const STORAGE_KEY = 'nido-pattern-progress';

export const DEFAULT_PROGRESS: PlayerProgress = {
  version: 1,
  unlockedWorld: 1,
  completedChallenges: [],
  lastWorld: 1,
};

export const loadProgress = (): PlayerProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed) ||
      parsed.version !== 1 ||
      !('unlockedWorld' in parsed) ||
      typeof parsed.unlockedWorld !== 'number' ||
      !('completedChallenges' in parsed) ||
      !Array.isArray(parsed.completedChallenges) ||
      !parsed.completedChallenges.every((id) => typeof id === 'string') ||
      !('lastWorld' in parsed) ||
      typeof parsed.lastWorld !== 'number'
    ) {
      throw new Error('Invalid progress');
    }
    return {
      version: 1,
      unlockedWorld: Math.min(4, Math.max(1, parsed.unlockedWorld)),
      completedChallenges: [...new Set(parsed.completedChallenges)],
      lastWorld: Math.min(4, Math.max(1, parsed.lastWorld)),
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_PROGRESS;
  }
};

export const saveProgress = (progress: PlayerProgress) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const resetProgress = () => {
  localStorage.removeItem(STORAGE_KEY);
};
