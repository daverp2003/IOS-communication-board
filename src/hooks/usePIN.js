import { useState, useCallback, useRef } from "react";

const PIN_KEY      = "symbosay_caregiver_pin";
const AUTO_LOCK_MS = 10 * 60 * 1000; // auto-lock after 10 minutes of unlocked use

/** SHA-256 hash a string, returns lowercase hex */
async function sha256(text) {
  const encoded = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function usePIN() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const startTimer = () => {
    clearTimer();
    timerRef.current = setTimeout(() => setIsUnlocked(false), AUTO_LOCK_MS);
  };

  /** Returns true if a PIN has been set */
  const isPINEnabled = useCallback(() => !!localStorage.getItem(PIN_KEY), []);

  /** Returns true if the candidate matches the stored PIN hash */
  const checkPIN = useCallback(async (candidate) => {
    const stored = localStorage.getItem(PIN_KEY);
    if (!stored) return false;
    const hashed = await sha256(candidate);
    return hashed === stored;
  }, []);

  /** Hash and save a new PIN, then unlock immediately */
  const setPIN = useCallback(async (pin) => {
    const hashed = await sha256(pin);
    localStorage.setItem(PIN_KEY, hashed);
    setIsUnlocked(true);
    startTimer();
  }, []); // eslint-disable-line

  /** Called after a successful PIN entry */
  const unlock = useCallback(() => {
    setIsUnlocked(true);
    startTimer();
  }, []); // eslint-disable-line

  /** Remove the PIN entirely */
  const removePIN = useCallback(() => {
    localStorage.removeItem(PIN_KEY);
    setIsUnlocked(false);
    clearTimer();
  }, []); // eslint-disable-line

  /** Manually lock (e.g. caregiver hands device back to user) */
  const lock = useCallback(() => {
    setIsUnlocked(false);
    clearTimer();
  }, []); // eslint-disable-line

  return { isPINEnabled, checkPIN, setPIN, unlock, removePIN, lock, isUnlocked };
}
