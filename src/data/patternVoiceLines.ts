export type PatternVoiceKind = 'instruction' | 'correct' | 'retry' | 'hint' | 'complete';

export interface PatternVoiceLine {
  text: string;
  audioPath: string;
}

const patternVoiceLines: Record<PatternVoiceKind, PatternVoiceLine[]> = {
  instruction: [
    { text: '¡Vamos a jugar! Mira el patrón con atención y elige la pieza que sigue.', audioPath: '/audio/patterns/instruction-01.mp3' },
    { text: '¡Ojos de detective! Descubre qué se repite y encuentra la figura que falta.', audioPath: '/audio/patterns/instruction-02.mp3' },
    { text: '¡Sigue el ritmo! Observa las piezas y toca la que completa la secuencia.', audioPath: '/audio/patterns/instruction-03.mp3' },
    { text: '¡Nueva pista! Mira el orden de las figuras y descubre cuál viene ahora.', audioPath: '/audio/patterns/instruction-04.mp3' },
    { text: '¡Tú puedes! Busca el grupo que se repite y elige la pieza correcta.', audioPath: '/audio/patterns/instruction-05.mp3' },
  ],
  correct: [
    { text: '¡Sí! Encontraste la pieza correcta. ¡Gran trabajo!', audioPath: '/audio/patterns/correct-01.mp3' },
    { text: '¡Excelente! Leíste el patrón como un verdadero detective.', audioPath: '/audio/patterns/correct-02.mp3' },
    { text: '¡Lo lograste! Esa pieza encaja perfectamente.', audioPath: '/audio/patterns/correct-03.mp3' },
    { text: '¡Qué bien observaste! El patrón está completo.', audioPath: '/audio/patterns/correct-04.mp3' },
  ],
  retry: [
    { text: '¡Casi! Respira, mira el orden otra vez y vuelve a intentarlo.', audioPath: '/audio/patterns/retry-01.mp3' },
    { text: '¡Buen intento! Observa desde el principio y busca lo que se repite.', audioPath: '/audio/patterns/retry-02.mp3' },
    { text: '¡Estuviste muy cerca! Mira cada pieza con calma y prueba de nuevo.', audioPath: '/audio/patterns/retry-03.mp3' },
  ],
  hint: [
    { text: '¡Aquí va una pista! Mira el grupo iluminado y busca dónde vuelve a empezar.', audioPath: '/audio/patterns/hint-01.mp3' },
    { text: 'Observa las primeras piezas. Ese mismo orden se repite más adelante.', audioPath: '/audio/patterns/hint-02.mp3' },
    { text: 'Mira el patrón desde el comienzo. ¿Qué pieza ocupa siempre ese lugar?', audioPath: '/audio/patterns/hint-03.mp3' },
  ],
  complete: [
    { text: '¡Fantástico! Completaste todos los patrones de este capítulo.', audioPath: '/audio/patterns/complete-01.mp3' },
    { text: '¡Lo lograste! Resolviste cada patrón. ¡Qué gran detective!', audioPath: '/audio/patterns/complete-02.mp3' },
    { text: '¡Capítulo completado! Tu atención y tu esfuerzo hicieron un trabajo increíble.', audioPath: '/audio/patterns/complete-03.mp3' },
  ],
};

export const getPatternVoiceLine = (kind: PatternVoiceKind, seed: number): PatternVoiceLine => {
  const choices = patternVoiceLines[kind];
  return choices[Math.abs(seed) % choices.length];
};

export const PATTERN_VOICE_LINES = patternVoiceLines;
