export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export const speak = (text: string): boolean => {
  if (!canSpeak()) return false;
  window.speechSynthesis.cancel();
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
