import { describe, expect, it } from 'vitest';
import { TOTAL_CHALLENGES, WORLDS } from './challenges';

describe('currículo de patrones', () => {
  it('incluye cuatro mundos y 24 retos', () => {
    expect(WORLDS).toHaveLength(4);
    expect(TOTAL_CHALLENGES).toBe(24);
    expect(WORLDS.every((world) => world.challenges.length === 6)).toBe(true);
  });

  it('cada reto tiene una respuesta correcta y un espacio vacío', () => {
    for (const challenge of WORLDS.flatMap((world) => world.challenges)) {
      expect(challenge.sequence.filter((piece) => piece === null)).toHaveLength(1);
      expect(challenge.choices.filter((choice) => choice.isCorrect)).toHaveLength(1);
      expect(challenge.choices).toHaveLength(3);
    }
  });

  it('la respuesta correcta coincide con el patrón declarado', () => {
    for (const world of WORLDS) {
      for (const challenge of world.challenges) {
        const missingIndex = challenge.sequence.findIndex((piece) => piece === null);
        const knownByUnit = challenge.sequence.find(
          (piece, index) => piece && index % challenge.repeatUnitLength === missingIndex % challenge.repeatUnitLength,
        );
        const answer = challenge.choices.find((choice) => choice.isCorrect);
        expect(answer?.id).toBe(knownByUnit?.id);
      }
    }
  });
});
