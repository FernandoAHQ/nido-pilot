import type { GradeLevel, PlayerProgress } from '../types';
import { WORLDS } from '../data/challenges';

export const STORAGE_KEY = 'nido-pattern-progress';

export const DEFAULT_PROGRESS: PlayerProgress = {
  version: 1,
  unlockedWorld: 1,
  completedChallenges: [],
  lastWorld: 1,
  gradeLevel: 'k1',
};

const isGradeLevel = (value: unknown): value is GradeLevel =>
  value === 'k1' || value === 'k2' || value === 'k3' || value === 'grade1';

const storyChallengeIds = new Set(WORLDS.flatMap((world) => world.challenges.map((challenge) => challenge.id)));

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
      unlockedWorld: Math.min(WORLDS.length, Math.max(1, parsed.unlockedWorld)),
      completedChallenges: [...new Set(parsed.completedChallenges)].filter((id) => storyChallengeIds.has(id)),
      lastWorld: Math.min(WORLDS.length, Math.max(1, parsed.lastWorld)),
      gradeLevel: 'gradeLevel' in parsed && isGradeLevel(parsed.gradeLevel) ? parsed.gradeLevel : 'k1',
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
