import { useCallback } from "react";
import { storageGet, storageSet } from "./useStorageHealth";

const ANALYTICS_KEY = (profileId) => `symbosay_analytics_${profileId}`;

/**
 * useAnalytics — lightweight symbol usage tracking stored in localStorage.
 *
 * Each entry: { id, label, emoji, color, count, lastUsed }
 * Custom icons store emoji: "📷" as a placeholder so they still render
 * cleanly in the Most Used board even after deletion.
 */
export function useAnalytics(profileId) {
  /** Call once per tile tap. Safe to call with any symbol shape. */
  const trackSymbol = useCallback((symbol) => {
    if (!profileId) return;
    try {
      const key  = ANALYTICS_KEY(profileId);
      const data = storageGet(key, {});
      const id   = String(symbol.id);
      const prev = data[id];
      data[id] = {
        id,
        label:    symbol.label,
        emoji:    symbol.emoji || "📷",   // fallback for custom photo icons
        color:    symbol.color || "#6366F1",
        count:    (prev?.count || 0) + 1,
        lastUsed: new Date().toISOString(),
      };
      storageSet(key, data);
    } catch {
      // Analytics are best-effort; never break the main tap flow
    }
  }, [profileId]);

  /**
   * Returns the top N symbols by tap count, shaped like regular symbols
   * so they can be rendered directly by SymbolTile / VirtualSymbolGrid.
   */
  const getTopSymbols = useCallback((limit = 20) => {
    if (!profileId) return [];
    const data = storageGet(ANALYTICS_KEY(profileId), {});
    return Object.values(data)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [profileId]);

  /** Returns the raw analytics map for the analytics dashboard. */
  const getAnalyticsData = useCallback(() => {
    if (!profileId) return {};
    return storageGet(ANALYTICS_KEY(profileId), {});
  }, [profileId]);

  /** Total tap count across all symbols for this profile. */
  const getTotalTaps = useCallback(() => {
    const data = storageGet(ANALYTICS_KEY(profileId), {});
    return Object.values(data).reduce((sum, e) => sum + e.count, 0);
  }, [profileId]);

  /** Wipe analytics for this profile (available from the Analytics tab). */
  const clearAnalytics = useCallback(() => {
    if (!profileId) return;
    storageSet(ANALYTICS_KEY(profileId), {});
  }, [profileId]);

  return { trackSymbol, getTopSymbols, getAnalyticsData, getTotalTaps, clearAnalytics };
}
