import { describe, expect, it } from 'vitest';
import { getPatternVoiceLine, PATTERN_VOICE_LINES } from './patternVoiceLines';

describe('voces de los patrones', () => {
  it('ofrece frases variadas para cada momento del juego', () => {
    expect(PATTERN_VOICE_LINES.instruction).toHaveLength(5);
    expect(PATTERN_VOICE_LINES.correct).toHaveLength(4);
    expect(PATTERN_VOICE_LINES.retry).toHaveLength(3);
    expect(PATTERN_VOICE_LINES.hint).toHaveLength(3);
    expect(PATTERN_VOICE_LINES.complete).toHaveLength(3);

    const allLines = Object.values(PATTERN_VOICE_LINES).flat();
    expect(new Set(allLines.map((line) => line.text)).size).toBe(allLines.length);
    expect(new Set(allLines.map((line) => line.audioPath)).size).toBe(allLines.length);
  });

  it('rota las frases de forma predecible', () => {
    expect(getPatternVoiceLine('instruction', 0)).not.toEqual(getPatternVoiceLine('instruction', 1));
    expect(getPatternVoiceLine('instruction', 5)).toEqual(getPatternVoiceLine('instruction', 0));
  });
});
