export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

let activeAudio: HTMLAudioElement | null = null;

export const stopSpeech = () => {
  if (typeof window === 'undefined') return;
  window.speechSynthesis?.cancel();
  if (!activeAudio) return;
  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio = null;
};

const speakWithBrowserVoice = (text: string): boolean => {
  if (!canSpeak()) return false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-MX';
  utterance.rate = 0.88;
  utterance.pitch = 1.1;
  const spanishVoice = window.speechSynthesis
    .getVoices()
    .find((voice) => voice.lang.toLowerCase().startsWith('es'));
  if (spanishVoice) utterance.voice = spanishVoice;
  window.speechSynthesis.speak(utterance);
  return true;
};

export const speak = async (text: string, audioPath?: string): Promise<boolean> => {
  stopSpeech();

  if (audioPath && typeof Audio !== 'undefined') {
    const audio = new Audio(audioPath);
    activeAudio = audio;
    audio.addEventListener('ended', () => {
      if (activeAudio === audio) activeAudio = null;
    }, { once: true });

    try {
      await audio.play();
      return true;
    } catch {
      if (activeAudio === audio) activeAudio = null;
    }
  }

  return speakWithBrowserVoice(text);
};
