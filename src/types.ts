export type PatternKind = 'color' | 'shape' | 'object';

export interface PatternItem {
  id: string;
  label: string;
  symbol: string;
  color: string;
  kind: PatternKind;
  shape?: 'circle' | 'square' | 'triangle' | 'star' | 'diamond';
}

export interface Choice extends PatternItem {
  isCorrect: boolean;
}

export interface StoryScene {
  chapter: number;
  title: string;
  narrative: string;
  imagePath: string;
  imageAlt: string;
  placeholderEmoji: string;
}

export interface Challenge {
  id: string;
  worldId: string;
  patternType: 'AB' | 'AAB' | 'ABB' | 'ABC';
  instruction: string;
  sequence: Array<PatternItem | null>;
  choices: Choice[];
  repeatUnitLength: number;
  story?: StoryScene;
}

export interface World {
  id: string;
  number: number;
  name: string;
  subtitle: string;
  patternType: Challenge['patternType'] | 'MIXTO';
  emoji: string;
  colors: [string, string];
  coverImagePath?: string;
  coverImageAlt?: string;
  challenges: Challenge[];
}

export interface PlayerProgress {
  version: 1;
  unlockedWorld: number;
  completedChallenges: string[];
  lastWorld: number;
}
