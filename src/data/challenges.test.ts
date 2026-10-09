import { describe, expect, it } from 'vitest';
import { TOTAL_CHALLENGES, WORLDS } from './challenges';

describe('currículo de patrones', () => {
  it('incluye cinco historias y 30 capítulos', () => {
    expect(WORLDS).toHaveLength(5);
    expect(TOTAL_CHALLENGES).toBe(30);
    expect(WORLDS.every((world) => world.challenges.length === 6)).toBe(true);
    expect(WORLDS.every((world) => world.patternType === 'MIXTO')).toBe(true);
  });

  it('cada capítulo es narrativo y tiene una ilustración propia', () => {
    const storyChallenges = WORLDS.flatMap((world) => world.challenges).filter((challenge) => challenge.story);
    expect(storyChallenges).toHaveLength(30);
    expect(new Set(storyChallenges.map((challenge) => challenge.story?.imagePath)).size).toBe(30);
    expect(storyChallenges.every((challenge) => challenge.story?.imageAlt && challenge.story.narrative)).toBe(true);
    expect(storyChallenges.every((challenge) => (challenge.story?.narrative.split('.').length ?? 0) >= 4)).toBe(true);
  });

  it('incluye las tres nuevas aventuras planeadas', () => {
    expect(WORLDS.map((world) => world.name)).toEqual(expect.arrayContaining([
      'Arrecife Arcoíris',
      'Tren de las Estaciones',
      'Ciudad de los Inventos',
    ]));
  });

  it('adapta cada capítulo de tres a cinco patrones según el nivel escolar', () => {
    const storyWorlds = WORLDS.filter((world) => world.patternType === 'MIXTO');

    for (const world of storyWorlds) {
      for (const challenge of world.challenges) {
        expect(challenge.roundsByLevel?.k1).toHaveLength(3);
        expect(challenge.roundsByLevel?.k2).toHaveLength(3);
        expect(challenge.roundsByLevel?.k3).toHaveLength(4);
        expect(challenge.roundsByLevel?.grade1).toHaveLength(5);
        for (const rounds of Object.values(challenge.roundsByLevel ?? {})) {
          expect(rounds.map((round) => round.sequence.length)).toEqual(
            [...rounds.map((round) => round.sequence.length)].sort((a, b) => a - b),
          );
        }
      }
    }
  });

  it('cada reto tiene una respuesta correcta y un espacio vacío', () => {
    for (const challenge of WORLDS.flatMap((world) => world.challenges)) {
      const rounds = challenge.roundsByLevel ? Object.values(challenge.roundsByLevel).flat() : [challenge];
      for (const round of rounds) {
        expect(round.sequence.filter((piece) => piece === null)).toHaveLength(1);
        expect(round.choices.filter((choice) => choice.isCorrect)).toHaveLength(1);
        expect(round.choices).toHaveLength(3);
      }
    }
  });

  it('la respuesta correcta coincide con el patrón declarado', () => {
    for (const world of WORLDS) {
      for (const challenge of world.challenges) {
        const rounds = challenge.roundsByLevel ? Object.values(challenge.roundsByLevel).flat() : [challenge];
        for (const round of rounds) {
          const missingIndex = round.sequence.findIndex((piece) => piece === null);
          const knownByUnit = round.sequence.find(
            (piece, index) => piece && index % round.repeatUnitLength === missingIndex % round.repeatUnitLength,
          );
          const answer = round.choices.find((choice) => choice.isCorrect);
          expect(answer?.id).toBe(knownByUnit?.id);
        }
      }
    }
  });

  it('mezcla la respuesta correcta entre izquierda, centro y derecha', () => {
    const positions = WORLDS.flatMap((world) => world.challenges).flatMap((challenge) =>
      (challenge.roundsByLevel ? Object.values(challenge.roundsByLevel).flat() : [challenge])
        .map((round) => round.choices.findIndex((choice) => choice.isCorrect)),
    );

    expect(new Set(positions)).toEqual(new Set([0, 1, 2]));
    expect(positions.filter((position) => position === 1).length).toBeLessThan(positions.length);
  });
});
