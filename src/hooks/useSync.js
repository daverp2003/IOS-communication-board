import { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { storageGet, storageSet, storageRemove } from "./useStorageHealth";

const supabase = createClient(
  "https://fgrfvoazrkutlmiqnmov.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncmZ2b2F6cmt1dGxtaXFubW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODkwNjgsImV4cCI6MjA4ODQ2NTA2OH0.lofg1sMtoeY-XIbtkUVb4pMcbUXmD8lnL-N3uYfwTT0"
);

const SYNC_CODE_KEY    = (profileId) => `symbosay_sync_code_${profileId}`;
// Stores the old 6-char code while migration is pending, then cleared
const LEGACY_CODE_KEY  = (profileId) => `symbosay_sync_legacy_${profileId}`;
const PULL_LOG_KEY     = "symbosay_pull_attempts";

// Rate limit: max 5 pull attempts per 10 minutes
const RATE_LIMIT_MAX      = 5;
const RATE_LIMIT_WINDOW   = 10 * 60 * 1000;

// Upgraded to 8 chars — ~1 trillion combinations vs ~1 billion for 6
const CODE_CHARS   = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH  = 8;

function generateSyncCode() {
  return Array.from(
    { length: CODE_LENGTH },
    () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  ).join("");
}

// ── Rate limiter ──────────────────────────────────────────────
function checkRateLimit() {
  const now = Date.now();
  const log = storageGet(PULL_LOG_KEY, []).filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (log.length >= RATE_LIMIT_MAX) {
    const retryIn = Math.ceil((RATE_LIMIT_WINDOW - (now - log[0])) / 1000 / 60);
    return { allowed: false, retryIn };
  }
  storageSet(PULL_LOG_KEY, [...log, now]);
  return { allowed: true };
}

// ── Data validation ───────────────────────────────────────────
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

function isValidSettings(s) {
  return (
    s &&
    typeof s === "object" &&
    (!s.themeId  || typeof s.themeId  === "string") &&
    (!s.tileSize || typeof s.tileSize === "number") &&
    (!s.voiceId  || typeof s.voiceId  === "string")
  );
}

function sanitiseBoards(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isValidBoard).slice(0, 100); // cap at 100 boards
}

function sanitiseSettings(raw) {
  if (!isValidSettings(raw)) return null;
  // Only allow known keys through — strip anything unexpected
  const { themeId, tileSize, voiceId } = raw;
  const out = {};
  if (themeId  && ["light","dark","highcontrast"].includes(themeId)) out.themeId  = themeId;
  if (tileSize && tileSize >= 70 && tileSize <= 350)                  out.tileSize = tileSize;
  if (voiceId  && typeof voiceId === "string")                        out.voiceId  = voiceId;
  return Object.keys(out).length ? out : null;
}

// ── Supabase helpers ─────────────────────────────────────────
async function pushBoards(syncCode, profileName, boards) {
  await supabase.from("sync_boards").delete().eq("sync_code", syncCode);
  if (!boards.length) return;
  const rows = boards.map((b) => ({
    id:           `${syncCode}_${b.id}`,
    sync_code:    syncCode,
    profile_name: profileName,
    data:         b,
    updated_at:   new Date().toISOString(),
  }));
  const { error } = await supabase.from("sync_boards").upsert(rows);
  if (error) throw new Error(error.message);
}

async function pushSettings(syncCode, profileName, settings) {
  const { error } = await supabase.from("sync_settings").upsert({
    sync_code:    syncCode,
    profile_name: profileName,
    data:         settings,
    updated_at:   new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

async function pullBoards(syncCode) {
  const { data, error } = await supabase
    .from("sync_boards")
    .select("data")
    .eq("sync_code", syncCode);
  if (error) throw new Error(error.message);
  return sanitiseBoards((data || []).map((r) => r.data));
}

async function pullSettings(syncCode) {
  const { data, error } = await supabase
    .from("sync_settings")
    .select("data")
    .eq("sync_code", syncCode)
    .single();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return sanitiseSettings(data?.data ?? null);
}

// ── Hook ──────────────────────────────────────────────────────

/** Check the most recent updated_at on remote settings without pulling all data */
async function getRemoteTimestamp(syncCode) {
  const { data, error } = await supabase
    .from("sync_settings")
    .select("updated_at")
    .eq("sync_code", syncCode)
    .single();
  if (error) return null;
  return data?.updated_at ?? null;
}

export function useSync(profileId, profileName) {
  const [syncing,   setSyncing]   = useState(false);
  const [lastSync,  setLastSync]  = useState(null);
  const [syncError, setSyncError] = useState(null);

  // True when a legacy 6-char code was detected and remote data may still live
  // under it — signals SyncSettings to show a migration prompt.
  const [hasLegacyMigration, setHasLegacyMigration] = useState(
    () => !!storageGet(LEGACY_CODE_KEY(profileId), null)
  );

  const getSyncCode = useCallback(() => {
    let code = storageGet(SYNC_CODE_KEY(profileId), null);
    if (code && code.length === CODE_LENGTH) return code;

    // Legacy or missing code detected.
    // Preserve the old code so migrateLegacy() can pull from it later — do NOT
    // silently discard it, as the user may have boards stored under it remotely.
    if (code && code.length > 0 && code.length < CODE_LENGTH) {
      storageSet(LEGACY_CODE_KEY(profileId), code);
      setHasLegacyMigration(true);
    }
    code = generateSyncCode();
    storageSet(SYNC_CODE_KEY(profileId), code);
    return code;
  }, [profileId]);

  /**
   * Pull boards and settings from the legacy 6-char code, then clear it.
   * Returns { boards, settings } if data was found, or null.
   * Consumer is responsible for merging the result (same flow as a manual pull).
   */
  const migrateLegacy = useCallback(async () => {
    const legacyCode = storageGet(LEGACY_CODE_KEY(profileId), null);
    if (!legacyCode) return null;

    setSyncing(true); setSyncError(null);
    try {
      const [boards, settings] = await Promise.all([
        pullBoards(legacyCode),
        pullSettings(legacyCode),
      ]);
      // Clear the legacy marker regardless of whether data was found
      storageRemove(LEGACY_CODE_KEY(profileId));
      setHasLegacyMigration(false);
      return (boards.length || settings) ? { boards, settings } : null;
    } catch (e) {
      // Non-critical: clear anyway so the banner doesn't show forever
      storageRemove(LEGACY_CODE_KEY(profileId));
      setHasLegacyMigration(false);
      setSyncError(`Migration pull failed: ${e.message}`);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [profileId]);

  const pushAll = useCallback(async (boards, settings) => {
    setSyncing(true); setSyncError(null);
    try {
      const code = getSyncCode();
      await Promise.all([
        pushBoards(code, profileName, boards),
        pushSettings(code, profileName, settings),
      ]);
      setLastSync(new Date());
    } catch (e) {
      setSyncError(`Sync failed: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  }, [getSyncCode, profileName]);

  const pullAll = useCallback(async (syncCode) => {
    // Rate limit pull attempts to prevent brute-forcing sync codes
    const { allowed, retryIn } = checkRateLimit();
    if (!allowed) {
      setSyncError(`Too many attempts — please wait ${retryIn} minute${retryIn !== 1 ? "s" : ""} and try again.`);
      return null;
    }

    setSyncing(true); setSyncError(null);
    try {
      const code = syncCode.toUpperCase().trim();
      if (code.length !== CODE_LENGTH || !/^[A-Z2-9]+$/.test(code)) {
        setSyncError(`Sync codes are ${CODE_LENGTH} characters (letters and numbers).`);
        return null;
      }

      const [boards, settings] = await Promise.all([
        pullBoards(code),
        pullSettings(code),
      ]);

      if (!boards.length && !settings) {
        setSyncError("No data found for that sync code.");
        return null;
      }

      storageSet(SYNC_CODE_KEY(profileId), code);
      setLastSync(new Date());
      return { boards, settings };
    } catch (e) {
      setSyncError(`Sync failed: ${e.message}`);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [profileId]);

  /** Check if remote has newer data than the local lastSyncedAt timestamp */
  const checkConflict = useCallback(async (localLastSync) => {
    try {
      const code      = getSyncCode();
      const remoteTs  = await getRemoteTimestamp(code);
      if (!remoteTs) return false;
      const remoteDate = new Date(remoteTs);
      const localDate  = localLastSync ? new Date(localLastSync) : null;
      return !localDate || remoteDate > localDate;
    } catch {
      return false;
    }
  }, [getSyncCode]);

  return {
    getSyncCode, pushAll, pullAll, checkConflict, migrateLegacy,
    hasLegacyMigration, syncing, lastSync, syncError,
  };
}


const supabase = createClient(
  "https://fgrfvoazrkutlmiqnmov.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncmZ2b2F6cmt1dGxtaXFubW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODkwNjgsImV4cCI6MjA4ODQ2NTA2OH0.lofg1sMtoeY-XIbtkUVb4pMcbUXmD8lnL-N3uYfwTT0"
);

const SYNC_CODE_KEY   = (profileId) => `symbosay_sync_code_${profileId}`;
const PULL_LOG_KEY    = "symbosay_pull_attempts";

// Rate limit: max 5 pull attempts per 10 minutes
const RATE_LIMIT_MAX      = 5;
const RATE_LIMIT_WINDOW   = 10 * 60 * 1000;

// Upgraded to 8 chars — ~1 trillion combinations vs ~1 billion for 6
const CODE_CHARS   = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH  = 8;

function generateSyncCode() {
  return Array.from(
    { length: CODE_LENGTH },
    () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  ).join("");
}

// ── Rate limiter ──────────────────────────────────────────────
function checkRateLimit() {
  const now = Date.now();
  const log = storageGet(PULL_LOG_KEY, []).filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (log.length >= RATE_LIMIT_MAX) {
    const retryIn = Math.ceil((RATE_LIMIT_WINDOW - (now - log[0])) / 1000 / 60);
    return { allowed: false, retryIn };
  }
  storageSet(PULL_LOG_KEY, [...log, now]);
  return { allowed: true };
}

// ── Data validation ───────────────────────────────────────────
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

function isValidSettings(s) {
  return (
    s &&
    typeof s === "object" &&
    (!s.themeId  || typeof s.themeId  === "string") &&
    (!s.tileSize || typeof s.tileSize === "number") &&
    (!s.voiceId  || typeof s.voiceId  === "string")
  );
}

function sanitiseBoards(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isValidBoard).slice(0, 100); // cap at 100 boards
}

function sanitiseSettings(raw) {
  if (!isValidSettings(raw)) return null;
  // Only allow known keys through — strip anything unexpected
  const { themeId, tileSize, voiceId } = raw;
  const out = {};
  if (themeId  && ["light","dark","highcontrast"].includes(themeId)) out.themeId  = themeId;
  if (tileSize && tileSize >= 70 && tileSize <= 350)                  out.tileSize = tileSize;
  if (voiceId  && typeof voiceId === "string")                        out.voiceId  = voiceId;
  return Object.keys(out).length ? out : null;
}

// ── Supabase helpers ─────────────────────────────────────────
async function pushBoards(syncCode, profileName, boards) {
  await supabase.from("sync_boards").delete().eq("sync_code", syncCode);
  if (!boards.length) return;
  const rows = boards.map((b) => ({
    id:           `${syncCode}_${b.id}`,
    sync_code:    syncCode,
    profile_name: profileName,
    data:         b,
    updated_at:   new Date().toISOString(),
  }));
  const { error } = await supabase.from("sync_boards").upsert(rows);
  if (error) throw new Error(error.message);
}

async function pushSettings(syncCode, profileName, settings) {
  const { error } = await supabase.from("sync_settings").upsert({
    sync_code:    syncCode,
    profile_name: profileName,
    data:         settings,
    updated_at:   new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

async function pullBoards(syncCode) {
  const { data, error } = await supabase
    .from("sync_boards")
    .select("data")
    .eq("sync_code", syncCode);
  if (error) throw new Error(error.message);
  return sanitiseBoards((data || []).map((r) => r.data));
}

async function pullSettings(syncCode) {
  const { data, error } = await supabase
    .from("sync_settings")
    .select("data")
    .eq("sync_code", syncCode)
    .single();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return sanitiseSettings(data?.data ?? null);
}

// ── Hook ──────────────────────────────────────────────────────

/** Check the most recent updated_at on remote settings without pulling all data */
async function getRemoteTimestamp(syncCode) {
  const { data, error } = await supabase
    .from("sync_settings")
    .select("updated_at")
    .eq("sync_code", syncCode)
    .single();
  if (error) return null;
  return data?.updated_at ?? null;
}

export function useSync(profileId, profileName) {
  const [syncing,   setSyncing]   = useState(false);
  const [lastSync,  setLastSync]  = useState(null);
  const [syncError, setSyncError] = useState(null);

  const getSyncCode = useCallback(() => {
    let code = storageGet(SYNC_CODE_KEY(profileId), null);
    // Migrate old 6-char codes to 8-char on next push
    if (!code || code.length !== CODE_LENGTH) {
      code = generateSyncCode();
      storageSet(SYNC_CODE_KEY(profileId), code);
    }
    return code;
  }, [profileId]);

  const pushAll = useCallback(async (boards, settings) => {
    setSyncing(true); setSyncError(null);
    try {
      const code = getSyncCode();
      await Promise.all([
        pushBoards(code, profileName, boards),
        pushSettings(code, profileName, settings),
      ]);
      setLastSync(new Date());
    } catch (e) {
      setSyncError(`Sync failed: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  }, [getSyncCode, profileName]);

  const pullAll = useCallback(async (syncCode) => {
    // Rate limit pull attempts to prevent brute-forcing sync codes
    const { allowed, retryIn } = checkRateLimit();
    if (!allowed) {
      setSyncError(`Too many attempts — please wait ${retryIn} minute${retryIn !== 1 ? "s" : ""} and try again.`);
      return null;
    }

    setSyncing(true); setSyncError(null);
    try {
      const code = syncCode.toUpperCase().trim();
      if (code.length !== CODE_LENGTH || !/^[A-Z2-9]+$/.test(code)) {
        setSyncError(`Sync codes are ${CODE_LENGTH} characters (letters and numbers).`);
        return null;
      }

      const [boards, settings] = await Promise.all([
        pullBoards(code),
        pullSettings(code),
      ]);

      if (!boards.length && !settings) {
        setSyncError("No data found for that sync code.");
        return null;
      }

      storageSet(SYNC_CODE_KEY(profileId), code);
      setLastSync(new Date());
      return { boards, settings };
    } catch (e) {
      setSyncError(`Sync failed: ${e.message}`);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [profileId]);

  /** Check if remote has newer data than the local lastSyncedAt timestamp */
  const checkConflict = useCallback(async (localLastSync) => {
    try {
      const code      = getSyncCode();
      const remoteTs  = await getRemoteTimestamp(code);
      if (!remoteTs) return false;
      const remoteDate = new Date(remoteTs);
      const localDate  = localLastSync ? new Date(localLastSync) : null;
      return !localDate || remoteDate > localDate;
    } catch {
      return false;
    }
  }, [getSyncCode]);

  return { getSyncCode, pushAll, pullAll, checkConflict, syncing, lastSync, syncError };
}
