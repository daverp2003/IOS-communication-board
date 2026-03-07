import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { storageGet, storageSet } from "./useStorageHealth";

const REQUESTS_KEY = (profileId) => `symbosay_requests_${profileId}`;

/**
 * useSymbolRequests — let caregivers flag symbols they need.
 *
 * Requests are sent to the Supabase `symbol_requests` table and also saved
 * locally so caregivers can see their submission history even offline.
 * If Supabase is unavailable, the request is stored locally with an `offline`
 * flag so it can be shown as "pending upload".
 *
 * Required Supabase table — run supabase_new_tables.sql in the dashboard:
 *   symbol_requests (id uuid pk, label text, emoji_suggestion text,
 *                    context text, profile_name text, created_at timestamptz)
 */
export function useSymbolRequests(profileId, profileName) {
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /** All requests ever submitted from this profile (local copy). */
  const getLocalRequests = useCallback(() => {
    return storageGet(REQUESTS_KEY(profileId), []);
  }, [profileId]);

  /**
   * Submit a symbol request.
   * @param {{ label: string, emojiSuggestion?: string, context?: string }} req
   * @returns {boolean} true if Supabase accepted it, false if stored offline only.
   */
  const submitRequest = useCallback(async ({ label, emojiSuggestion, context }) => {
    if (!label?.trim()) return false;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const request = {
      label:            label.trim(),
      emoji_suggestion: emojiSuggestion?.trim() || null,
      context:          context?.trim()          || null,
      profile_name:     profileName,
      created_at:       new Date().toISOString(),
    };

    let onlineSuccess = false;
    try {
      const { error } = await supabase.from("symbol_requests").insert(request);
      if (error) throw new Error(error.message);
      onlineSuccess = true;
    } catch (e) {
      // Don't block the user — save locally and mark as offline
      setSubmitError(`Saved locally (couldn't reach server: ${e.message})`);
    }

    // Always save locally so caregivers can see their history
    const existing = storageGet(REQUESTS_KEY(profileId), []);
    const local    = {
      ...request,
      id:      `req_${Date.now()}`,
      offline: !onlineSuccess,
    };
    storageSet(REQUESTS_KEY(profileId), [...existing, local]);

    setSubmitting(false);
    if (onlineSuccess) setSubmitSuccess(true);
    return onlineSuccess;
  }, [profileId, profileName]);

  const clearSuccess = useCallback(() => setSubmitSuccess(false), []);
  const clearError   = useCallback(() => setSubmitError(null),    []);

  return {
    submitRequest,
    getLocalRequests,
    submitting,
    submitError,
    submitSuccess,
    clearSuccess,
    clearError,
  };
}
