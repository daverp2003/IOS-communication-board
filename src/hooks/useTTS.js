import { useCallback, useRef } from "react";
import { VOICES } from "../data/voices";

export function useTTS(settings) {
  const utteranceRef = useRef(null);

  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const voice = VOICES.find(v => v.id === settings.voiceId) || VOICES[0];
    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = voice.pitch;
    utter.rate = voice.rate;
    utter.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferred = voices.find(v =>
        v.lang.startsWith("en") && v.localService
      ) || voices.find(v => v.lang.startsWith("en")) || voices[0];
      if (preferred) utter.voice = preferred;
    }

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [settings.voiceId]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  return { speak, stop };
}
