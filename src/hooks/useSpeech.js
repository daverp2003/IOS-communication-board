import { useState, useCallback, useEffect, useRef } from "react";

// ── iOS resume workaround ─────────────────────────────────────
// Safari pauses speechSynthesis after ~15s of inactivity.
// We keep a resume interval alive while speaking.
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
// iOS loads voices asynchronously — we must wait for voiceschanged
export function getVoices() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis?.getVoices() || [];
    if (voices.length > 0) { resolve(voices); return; }
    const handler = () => { resolve(window.speechSynthesis.getVoices()); };
    window.speechSynthesis?.addEventListener("voiceschanged", handler, { once: true });
    // Fallback timeout in case voiceschanged never fires
    setTimeout(() => resolve(window.speechSynthesis?.getVoices() || []), 2000);
  });
}

// ── Pick best English voice ───────────────────────────────────
function pickVoice(allVoices, preferredName) {
  if (!allVoices.length) return null;

  // Try to match by preferred name first
  if (preferredName) {
    const match = allVoices.find((v) => v.name === preferredName);
    if (match) return match;
  }

  // iOS local voices first (best quality)
  const localEn = allVoices.find((v) => v.localService && v.lang.startsWith("en"));
  if (localEn) return localEn;

  // Any English voice
  const anyEn = allVoices.find((v) => v.lang.startsWith("en"));
  if (anyEn) return anyEn;

  return allVoices[0];
}

// ── Hook ──────────────────────────────────────────────────────
export function useSpeech() {
  const [speaking,    setSpeaking]    = useState(false);
  const [voices,      setVoices]      = useState([]);
  const [voiceReady,  setVoiceReady]  = useState(false);
  const selectedVoiceRef = useRef(null); // actual SpeechSynthesisVoice object

  // Load system voices on mount
  useEffect(() => {
    getVoices().then((v) => {
      const englishVoices = v.filter((sv) => sv.lang.startsWith("en"));
      const list = englishVoices.length ? englishVoices : v;
      setVoices(list);
      selectedVoiceRef.current = pickVoice(list, null);
      setVoiceReady(true);
    });
  }, []);

  const setVoiceByName = useCallback((name) => {
    selectedVoiceRef.current = voices.find((v) => v.name === name) || voices[0] || null;
  }, [voices]);

  const speak = useCallback((text, options = {}) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    stopResumeTimer();

    const utterance = new SpeechSynthesisUtterance(text);

    // Use selected system voice
    const voice = selectedVoiceRef.current;
    if (voice) utterance.voice = voice;

    // Apply pitch/rate from options
    utterance.pitch  = options.pitch  ?? 1.0;
    utterance.rate   = options.rate   ?? 0.95;
    utterance.volume = 1;

    utterance.onstart = () => { setSpeaking(true); startResumeTimer(); };
    utterance.onend   = () => { setSpeaking(false); stopResumeTimer(); };
    utterance.onerror = () => { setSpeaking(false); stopResumeTimer(); };

    // iOS requires a tiny delay after cancel() before speaking
    setTimeout(() => window.speechSynthesis.speak(utterance), 50);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    stopResumeTimer();
  }, []);

  return { speaking, speak, stop, voices, voiceReady, setVoiceByName, selectedVoiceRef };
}
