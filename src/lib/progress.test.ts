import { describe, expect, it } from 'vitest';
import { DEFAULT_PROGRESS, loadProgress, saveProgress, STORAGE_KEY } from './progress';

describe('progreso local', () => {
  it('inicia con el primer mundo disponible', () => {
    expect(loadProgress()).toEqual(DEFAULT_PROGRESS);
  });

  it('guarda y recupera un progreso válido', () => {
    const progress = { ...DEFAULT_PROGRESS, unlockedWorld: 2, completedChallenges: ['jardin-1'] };
    saveProgress(progress);
    expect(loadProgress()).toEqual(progress);
  });

  it('descarta datos dañados de forma segura', () => {
    localStorage.setItem(STORAGE_KEY, '{mal escrito');
    expect(loadProgress()).toEqual(DEFAULT_PROGRESS);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('acepta el progreso de los seis mundos', () => {
    const progress = { ...DEFAULT_PROGRESS, unlockedWorld: 6, lastWorld: 6 };
    saveProgress(progress);
    expect(loadProgress().unlockedWorld).toBe(6);
    expect(loadProgress().lastWorld).toBe(6);
  });

  it('recupera progreso anterior usando K1 como nivel seguro', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      unlockedWorld: 2,
      completedChallenges: ['jardin-1'],
      lastWorld: 2,
    }));

    expect(loadProgress().gradeLevel).toBe('k1');
    expect(loadProgress().completedChallenges).toEqual(['jardin-1']);
  });
});
