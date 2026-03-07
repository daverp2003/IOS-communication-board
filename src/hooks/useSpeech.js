import { useState, useCallback } from "react";

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback((text, voice) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = voice.pitch;
    utterance.rate = voice.rate;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { speaking, speak, stop };
}
