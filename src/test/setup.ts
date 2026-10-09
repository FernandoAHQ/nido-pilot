import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

Object.defineProperty(window, 'speechSynthesis', {
  configurable: true,
  value: {
    cancel: vi.fn(),
    speak: vi.fn(),
    getVoices: vi.fn(() => []),
  },
});

class SpeechSynthesisUtteranceMock {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  voice: SpeechSynthesisVoice | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

vi.stubGlobal('SpeechSynthesisUtterance', SpeechSynthesisUtteranceMock);

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => cleanup());
