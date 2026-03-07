import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useSwitchScanning — single-switch AAC scanning support.
 *
 * How it works:
 *   - A timer advances the "scan index" through all tiles
 *   - Pressing Space, Enter, or any connected switch sends a click to the
 *     currently highlighted tile
 *   - Settings: scanInterval (ms), enabled toggle
 *
 * Usage:
 *   const { scanIndex, scanEnabled, setScanEnabled, scanInterval, setScanInterval }
 *     = useSwitchScanning({ itemCount, onSelect });
 *
 *   Then give each tile: data-scan-index={i}
 *   And highlight it when: i === scanIndex && scanEnabled
 */
export function useSwitchScanning({ itemCount, onSelect, enabled = false }) {
  const [scanEnabled,   setScanEnabled]   = useState(enabled);
  const [scanInterval,  setScanInterval]  = useState(2000); // ms per tile
  const [scanIndex,     setScanIndex]     = useState(0);
  const timerRef   = useRef(null);
  const indexRef   = useRef(0);

  const stopScan = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startScan = useCallback(() => {
    stopScan();
    if (!itemCount) return;
    timerRef.current = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % itemCount;
      setScanIndex(indexRef.current);
    }, scanInterval);
  }, [itemCount, scanInterval, stopScan]);

  // Start/stop when enabled changes or itemCount changes
  useEffect(() => {
    if (scanEnabled && itemCount > 0) {
      indexRef.current = 0;
      setScanIndex(0);
      startScan();
    } else {
      stopScan();
    }
    return stopScan;
  }, [scanEnabled, itemCount, startScan, stopScan]);

  // Restart when interval changes — scanEnabled is intentionally excluded from
  // deps here: toggling enabled is handled by the effect above. Including it
  // would cause both effects to run on the same render, double-starting the timer.
  useEffect(() => {
    if (scanEnabled) startScan();
  }, [scanInterval, startScan]); // eslint-disable-line react-hooks/exhaustive-deps

  // Switch press — Space or Enter activates current tile
  useEffect(() => {
    if (!scanEnabled) return;
    const handleKey = (e) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        onSelect?.(indexRef.current);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [scanEnabled, onSelect]);

  return {
    scanIndex,
    scanEnabled,
    setScanEnabled,
    scanInterval,
    setScanInterval,
    resetScan: () => { indexRef.current = 0; setScanIndex(0); },
  };
}
