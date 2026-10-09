import type { Challenge, Choice, PatternItem, World } from '../types';

const item = (
  id: string,
  label: string,
  symbol: string,
  color: string,
  kind: PatternItem['kind'],
  shape?: PatternItem['shape'],
): PatternItem => ({ id, label, symbol, color, kind, shape });

export const ITEMS = {
  red: item('red', 'rojo', '', '#F15B5D', 'color', 'circle'),
  blue: item('blue', 'azul', '', '#3D78D8', 'color', 'circle'),
  yellow: item('yellow', 'amarillo', '', '#F6C945', 'color', 'circle'),
  green: item('green', 'verde', '', '#52A978', 'color', 'circle'),
  purple: item('purple', 'morado', '', '#8B68C8', 'color', 'circle'),
  orange: item('orange', 'naranja', '', '#EF8A43', 'color', 'circle'),
  circle: item('circle', 'círculo', '', '#E95D7B', 'shape', 'circle'),
  square: item('square', 'cuadrado', '', '#4D90D9', 'shape', 'square'),
  triangle: item('triangle', 'triángulo', '', '#F0A53A', 'shape', 'triangle'),
  star: item('star', 'estrella', '★', '#F2C438', 'shape', 'star'),
  diamond: item('diamond', 'rombo', '', '#916AD4', 'shape', 'diamond'),
  apple: item('apple', 'manzana', '🍎', '#F15B5D', 'object'),
  leaf: item('leaf', 'hoja', '🍃', '#55A86C', 'object'),
  fish: item('fish', 'pez', '🐟', '#4D90D9', 'object'),
  flower: item('flower', 'flor', '🌼', '#E8B82E', 'object'),
  moon: item('moon', 'luna', '🌙', '#766BC0', 'object'),
  sun: item('sun', 'sol', '☀️', '#EBAF26', 'object'),
  rocket: item('rocket', 'cohete', '🚀', '#5477C8', 'object'),
  planet: item('planet', 'planeta', '🪐', '#B86EAF', 'object'),
  heart: item('heart', 'corazón', '♥', '#E85570', 'object'),
};

type ItemKey = keyof typeof ITEMS;

interface ChallengeSpec {
  unit: ItemKey[];
  distractors: ItemKey[];
  missing: number;
}

const specs: Record<Challenge['patternType'], ChallengeSpec[]> = {
  AB: [
    { unit: ['red', 'blue'], distractors: ['yellow', 'green'], missing: 4 },
    { unit: ['circle', 'square'], distractors: ['triangle', 'star'], missing: 3 },
    { unit: ['apple', 'leaf'], distractors: ['flower', 'fish'], missing: 2 },
    { unit: ['yellow', 'purple'], distractors: ['orange', 'blue'], missing: 5 },
    { unit: ['fish', 'flower'], distractors: ['moon', 'apple'], missing: 1 },
    { unit: ['triangle', 'circle'], distractors: ['diamond', 'square'], missing: 4 },
  ],
  AAB: [
    { unit: ['red', 'red', 'blue'], distractors: ['yellow', 'green'], missing: 4 },
    { unit: ['star', 'star', 'circle'], distractors: ['square', 'triangle'], missing: 2 },
    { unit: ['apple', 'apple', 'leaf'], distractors: ['flower', 'fish'], missing: 5 },
    { unit: ['green', 'green', 'purple'], distractors: ['orange', 'blue'], missing: 3 },
    { unit: ['sun', 'sun', 'moon'], distractors: ['planet', 'rocket'], missing: 1 },
    { unit: ['square', 'square', 'triangle'], distractors: ['circle', 'diamond'], missing: 4 },
  ],
  ABB: [
    { unit: ['red', 'blue', 'blue'], distractors: ['yellow', 'green'], missing: 5 },
    { unit: ['circle', 'star', 'star'], distractors: ['square', 'triangle'], missing: 3 },
    { unit: ['leaf', 'apple', 'apple'], distractors: ['flower', 'fish'], missing: 1 },
    { unit: ['orange', 'purple', 'purple'], distractors: ['green', 'blue'], missing: 4 },
    { unit: ['moon', 'sun', 'sun'], distractors: ['planet', 'rocket'], missing: 2 },
    { unit: ['triangle', 'square', 'square'], distractors: ['circle', 'diamond'], missing: 5 },
  ],
  ABC: [
    { unit: ['red', 'yellow', 'blue'], distractors: ['green', 'purple'], missing: 5 },
    { unit: ['circle', 'triangle', 'square'], distractors: ['star', 'diamond'], missing: 3 },
    { unit: ['apple', 'leaf', 'flower'], distractors: ['fish', 'sun'], missing: 1 },
    { unit: ['green', 'orange', 'purple'], distractors: ['red', 'blue'], missing: 4 },
    { unit: ['rocket', 'planet', 'star'], distractors: ['moon', 'sun'], missing: 2 },
    { unit: ['diamond', 'circle', 'triangle'], distractors: ['square', 'star'], missing: 5 },
  ],
};

const makeChallenges = (worldId: string, patternType: Challenge['patternType']): Challenge[] =>
  specs[patternType].map((spec, index) => {
    const fullSequence = Array.from({ length: 6 }, (_, position) => ITEMS[spec.unit[position % spec.unit.length]]);
    const answer = fullSequence[spec.missing];
    const choices: Choice[] = [
      { ...ITEMS[spec.distractors[0]], isCorrect: false },
      { ...answer, isCorrect: true },
      { ...ITEMS[spec.distractors[1]], isCorrect: false },
    ];
    const sequence: Array<PatternItem | null> = [...fullSequence];
    sequence[spec.missing] = null;

    return {
      id: `${worldId}-${index + 1}`,
      worldId,
      patternType,
      instruction: 'Mira con atención. ¿Qué sigue en el patrón?',
      sequence,
      choices,
      repeatUnitLength: spec.unit.length,
    };
  });

export const WORLDS: World[] = [
  {
    id: 'jardin',
    number: 1,
    name: 'Jardín Saltarín',
    subtitle: 'Uno y otro',
    patternType: 'AB',
    emoji: '🌱',
    colors: ['#54B883', '#BFE7A9'],
    challenges: makeChallenges('jardin', 'AB'),
  },
  {
    id: 'mar',
    number: 2,
    name: 'Bahía Burbuja',
    subtitle: 'Dos iguales y uno nuevo',
    patternType: 'AAB',
    emoji: '🐠',
    colors: ['#3D91D9', '#9EDFE5'],
    challenges: makeChallenges('mar', 'AAB'),
  },
  {
    id: 'nubes',
    number: 3,
    name: 'Nubes de Algodón',
    subtitle: 'Uno nuevo y dos iguales',
    patternType: 'ABB',
    emoji: '☁️',
    colors: ['#8170D1', '#D6C8F2'],
    challenges: makeChallenges('nubes', 'ABB'),
  },
  {
    id: 'espacio',
    number: 4,
    name: 'Galaxia Brillante',
    subtitle: 'Tres amigos diferentes',
    patternType: 'ABC',
    emoji: '🪐',
    colors: ['#5554A8', '#BF77C2'],
    challenges: makeChallenges('espacio', 'ABC'),
  },
];

export const TOTAL_CHALLENGES = WORLDS.reduce((total, world) => total + world.challenges.length, 0);
