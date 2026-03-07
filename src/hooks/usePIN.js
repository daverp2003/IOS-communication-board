import { useState, useCallback, useRef } from "react";

const PIN_KEY        = "symbosay_caregiver_pin";
const AUTO_LOCK_MS   = 10 * 60 * 1000; // auto-lock after 10 minutes of unlocked use

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

  /** Returns true if the candidate matches the stored PIN */
  const checkPIN = useCallback((candidate) => candidate === localStorage.getItem(PIN_KEY), []);

  /** Save a new PIN and unlock immediately */
  const setPIN = useCallback((pin) => {
    localStorage.setItem(PIN_KEY, pin);
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
