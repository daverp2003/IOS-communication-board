import { useState, useEffect, useCallback } from "react";

const QUOTA_WARNING_BYTES = 3 * 1024 * 1024; // warn at 3 MB used

/**
 * Safe localStorage helpers — always wrapped in try/catch.
 * Returns { ok, error } so callers can react to failures.
 */
export function storageGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (e) {
    const isQuota =
      e instanceof DOMException &&
      (e.code === 22 ||            // legacy QuotaExceededError code
        e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED");
    return { ok: false, quota: isQuota, error: e.message };
  }
}

export function storageRemove(key) {
  try {
    localStorage.removeItem(key);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/** Estimate how many bytes of localStorage are currently in use */
function estimateUsedBytes() {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const val = localStorage.getItem(key);
      total += (key?.length ?? 0) * 2 + (val?.length ?? 0) * 2; // UTF-16
    }
    return total;
  } catch {
    return 0;
  }
}

/**
 * useStorageHealth — call once near the top of your app.
 * Exposes:
 *   storageWarning  — "low" | "full" | null
 *   storageError    — last human-readable error string or null
 *   setStorageError — let other hooks surface errors here
 *   clearError      — dismiss the error banner
 */
export function useStorageHealth() {
  const [storageWarning, setStorageWarning] = useState(null);
  const [storageError,   setStorageError]   = useState(null);

  // Check usage on mount and after every storage event
  const checkQuota = useCallback(() => {
    const used = estimateUsedBytes();
    if (used >= QUOTA_WARNING_BYTES * 1.5) {
      setStorageWarning("full");
    } else if (used >= QUOTA_WARNING_BYTES) {
      setStorageWarning("low");
    } else {
      setStorageWarning(null);
    }
  }, []);

  useEffect(() => {
    checkQuota();
    window.addEventListener("storage", checkQuota);
    return () => window.removeEventListener("storage", checkQuota);
  }, [checkQuota]);

  const clearError = useCallback(() => setStorageError(null), []);

  return { storageWarning, storageError, setStorageError, clearError, checkQuota };
}
