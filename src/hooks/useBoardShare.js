import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

function isValidBoard(b) {
  return (
    b &&
    typeof b === "object" &&
    typeof b.id === "string" &&
    typeof b.name === "string" &&
    b.name.length > 0 &&
    b.name.length <= 100 &&
    typeof b.color === "string" &&
    b.cells !== undefined
  );
}

// Share codes are 6 chars (clearly distinct from 8-char sync codes).
// We prefix stored rows with "share_" so they never collide with sync rows.
const SHARE_CHARS  = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SHARE_LENGTH = 6;

function generateShareCode() {
  return Array.from(
    { length: SHARE_LENGTH },
    () => SHARE_CHARS[Math.floor(Math.random() * SHARE_CHARS.length)]
  ).join("");
}

function shareKey(code) {
  return `share_${code}`;
}

/**
 * useBoardShare — share a single board with another device via a 6-character code.
 *
 * Reuses the existing sync_boards Supabase table (no new table required).
 * Shared rows use sync_code = "share_XXXXXX" so they never collide with
 * sync rows that use 8-character codes.
 */
export function useBoardShare() {
  const [sharing,    setSharing]    = useState(false);
  const [shareError, setShareError] = useState(null);

  /**
   * Push a board to Supabase and return the 6-char share code.
   * Returns null on failure (shareError will be set).
   */
  const shareBoard = useCallback(async (board, profileName) => {
    setSharing(true);
    setShareError(null);
    try {
      const code = generateShareCode();
      const key  = shareKey(code);
      const { error } = await supabase.from("sync_boards").upsert({
        id:           key,
        sync_code:    key,
        profile_name: profileName,
        data:         board,
        updated_at:   new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
      return code;
    } catch (e) {
      setShareError(`Share failed: ${e.message}`);
      return null;
    } finally {
      setSharing(false);
    }
  }, []);

  /**
   * Fetch a shared board by its 6-char code.
   * Returns { board, sharedBy } or null on failure.
   */
  const importSharedBoard = useCallback(async (shareCode) => {
    setSharing(true);
    setShareError(null);
    try {
      const code = shareCode.toUpperCase().replace(/\s/g, "");
      if (code.length !== SHARE_LENGTH) {
        setShareError(`Share codes are ${SHARE_LENGTH} characters.`);
        return null;
      }
      const { data, error } = await supabase
        .from("sync_boards")
        .select("data, profile_name")
        .eq("sync_code", shareKey(code))
        .single();

      if (error || !data) {
        setShareError("No board found for that code — double-check and try again.");
        return null;
      }

      if (!isValidBoard(data.data)) {
        setShareError("The shared board data is invalid.");
        return null;
      }

      // Give it a fresh ID so it never overwrites a local board
      const board = {
        ...data.data,
        id:        `imported_${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };
      return { board, sharedBy: data.profile_name || "Someone" };
    } catch (e) {
      setShareError(`Import failed: ${e.message}`);
      return null;
    } finally {
      setSharing(false);
    }
  }, []);

  const clearError = useCallback(() => setShareError(null), []);

  return { shareBoard, importSharedBoard, sharing, shareError, clearError };
}
