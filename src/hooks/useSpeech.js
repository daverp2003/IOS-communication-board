import { useState, useCallback, useEffect, useRef } from "react";

// ── iOS resume workaround ─────────────────────────────────────
// These are intentional module-level singletons: the app only ever mounts one
// useSpeech instance, and the timer must survive re-renders without being
// recreated. If SSR or multi-root architectures are ever introduced, move these
// into a module-level WeakMap keyed by a hook instance ID.
let resumeInterval = null;
function startResumeTimer() {
  stopResumeTimer();
  resumeInterval = setInterval(() => {
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }
  }, 10000);
}
function stopResumeTimer() {
  if (resumeInterval) { clearInterval(resumeInterval); resumeInterval = null; }
}

// ── Voice loader ──────────────────────────────────────────────
// Android Chrome: getVoices() returns [] until after first user interaction,
// and voiceschanged may never fire. We poll aggressively as a fallback.
export function getVoices() {
  return new Promise((resolve) => {
    // Try immediately
    const immediate = window.speechSynthesis?.getVoices() || [];
    if (immediate.length > 0) { resolve(immediate); return; }

    let resolved = false;
    const done = (v) => {
      if (resolved) return;
      resolved = true;
      resolve(v);
    };

    // Listen for voiceschanged (works on iOS + desktop Chrome)
    window.speechSynthesis?.addEventListener("voiceschanged", () => {
      done(window.speechSynthesis.getVoices());
    }, { once: true });

    // Android Chrome polling fallback — check every 250ms for up to 5s
    let attempts = 0;
    const poll = setInterval(() => {
      const v = window.speechSynthesis?.getVoices() || [];
      if (v.length > 0) { clearInterval(poll); done(v); return; }
      if (++attempts >= 20) { clearInterval(poll); done([]); }
    }, 250);
  });
}

// ── Pick best English voice ───────────────────────────────────
function pickVoice(allVoices, preferredName) {
  if (!allVoices.length) return null;
  if (preferredName) {
    const match = allVoices.find((v) => v.name === preferredName);
    if (match) return match;
  }
  // Prefer local/on-device English voices (best quality, works offline)
  const localEn = allVoices.find((v) => v.localService && v.lang.startsWith("en"));
  if (localEn) return localEn;
  const anyEn = allVoices.find((v) => v.lang.startsWith("en"));
  if (anyEn) return anyEn;
  return allVoices[0];
}

// ── Hook ──────────────────────────────────────────────────────
/**
 * @param {string|null} preferredVoiceName  — persisted device voice name from
 *   settings.voiceId (e.g. "Samantha"). Passed to pickVoice on first load so
 *   the user's chosen voice survives page reloads.
 * @param {(name: string) => void} onVoiceSelect — called when the user picks a
 *   voice; consumer should persist the name via updateSetting("voiceId", name).
 */
export function useSpeech(preferredVoiceName = null, onVoiceSelect = null) {
  const [speaking,   setSpeaking]   = useState(false);
  const [voices,     setVoices]     = useState([]);
  const [voiceReady, setVoiceReady] = useState(false);
  const selectedVoiceRef = useRef(null);

  const loadVoices = useCallback(() => {
    getVoices().then((v) => {
      const englishVoices = v.filter((sv) => sv.lang.startsWith("en"));
      const list = englishVoices.length ? englishVoices : v;
      setVoices(list);
      // Use the persisted preferred voice name on first load so the voice
      // survives page reloads. Falls back to best available English voice.
      if (!selectedVoiceRef.current) {
        selectedVoiceRef.current = pickVoice(list, preferredVoiceName);
      }
      setVoiceReady(true);
    });
  }, [preferredVoiceName]);

  // Load on mount
  useEffect(() => {
    loadVoices();

    // Android: also reload voices after first user interaction
    const onInteraction = () => {
      if (voices.length === 0) loadVoices();
      window.removeEventListener("touchstart", onInteraction);
      window.removeEventListener("click", onInteraction);
    };
    window.addEventListener("touchstart", onInteraction, { once: true, passive: true });
    window.addEventListener("click",      onInteraction, { once: true });

    return () => {
      window.removeEventListener("touchstart", onInteraction);
      window.removeEventListener("click",      onInteraction);
    };
  }, [loadVoices, voices.length]);

  const setVoiceByName = useCallback((name) => {
    selectedVoiceRef.current = voices.find((v) => v.name === name) || voices[0] || null;
    // Persist so the choice survives reloads (consumer handles storage)
    onVoiceSelect?.(name);
  }, [voices, onVoiceSelect]);

  const speak = useCallback((text, options = {}) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    stopResumeTimer();

    // Android: if voices still not loaded, try to load then speak
    if (!selectedVoiceRef.current) {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        const list = v.filter((sv) => sv.lang.startsWith("en"));
        selectedVoiceRef.current = pickVoice(list.length ? list : v, null);
        if (voices.length === 0) setVoices(list.length ? list : v);
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoiceRef.current) utterance.voice = selectedVoiceRef.current;
    utterance.pitch  = options.pitch  ?? 1.0;
    utterance.rate   = options.rate   ?? 0.95;
    utterance.volume = 1;

    utterance.onstart = () => { setSpeaking(true);  startResumeTimer(); };
    utterance.onend   = () => { setSpeaking(false); stopResumeTimer();  };
    utterance.onerror = () => { setSpeaking(false); stopResumeTimer();  };

    setTimeout(() => window.speechSynthesis.speak(utterance), 50);
  }, [voices.length]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    stopResumeTimer();
  }, []);

  return { speaking, speak, stop, voices, voiceReady, setVoiceByName, selectedVoiceRef };
}
