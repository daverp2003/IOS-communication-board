import { useState, useCallback } from "react";

const SUPABASE_URL = "https://fgrfvoazrkutlmiqnmov.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncmZ2b2F6cmt1dGxtaXFubW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODkwNjgsImV4cCI6MjA4ODQ2NTA2OH0.lofg1sMtoeY-XIbtkUVb4pMcbUXmD8lnL-N3uYfwTT0";
const SUPABASE_PUB_KEY = "sb_publishable_G0hnuM7wlY-g8puvx2oJ0w_jBRCh-XC";

const SYNC_CODE_KEY = (profileId) => `symbosay_sync_code_${profileId}`;

// ── Low-level fetch helpers ───────────────────────────────────
async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      "apikey":        SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type":  "application/json",
      "Prefer":        "return=minimal",
      "sb-publishable-key": SUPABASE_PUB_KEY,
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

// ── Sync code generation ──────────────────────────────────────
function generateSyncCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ── Push boards to Supabase ───────────────────────────────────
async function pushBoards(syncCode, profileName, boards) {
  await sbFetch(`sync_boards?sync_code=eq.${syncCode}`, { method: "DELETE" });
  if (!boards.length) return;
  const rows = boards.map((b) => ({
    id:           `${syncCode}_${b.id}`,
    sync_code:    syncCode,
    profile_name: profileName,
    data:         b,
    updated_at:   new Date().toISOString(),
  }));
  await sbFetch("sync_boards", {
    method:  "POST",
    body:    JSON.stringify(rows),
    headers: { "Prefer": "resolution=merge-duplicates" },
  });
}

// ── Push settings to Supabase ─────────────────────────────────
async function pushSettings(syncCode, profileName, settings) {
  await sbFetch("sync_settings", {
    method:  "POST",
    body:    JSON.stringify({
      sync_code:    syncCode,
      profile_name: profileName,
      data:         settings,
      updated_at:   new Date().toISOString(),
    }),
    headers: { "Prefer": "resolution=merge-duplicates" },
  });
}

// ── Pull boards from Supabase ─────────────────────────────────
async function pullBoards(syncCode) {
  const rows = await sbFetch(`sync_boards?sync_code=eq.${syncCode}&select=data`);
  return (rows || []).map((r) => r.data);
}

// ── Pull settings from Supabase ───────────────────────────────
async function pullSettings(syncCode) {
  const rows = await sbFetch(`sync_settings?sync_code=eq.${syncCode}&select=data`);
  return rows?.[0]?.data ?? null;
}

// ── Hook ──────────────────────────────────────────────────────
export function useSync(profileId, profileName) {
  const [syncing,   setSyncing]   = useState(false);
  const [lastSync,  setLastSync]  = useState(null);
  const [syncError, setSyncError] = useState(null);

  const getSyncCode = useCallback(() => {
    let code = localStorage.getItem(SYNC_CODE_KEY(profileId));
    if (!code) {
      code = generateSyncCode();
      localStorage.setItem(SYNC_CODE_KEY(profileId), code);
    }
    return code;
  }, [profileId]);

  const pushAll = useCallback(async (boards, settings) => {
    setSyncing(true);
    setSyncError(null);
    try {
      const code = getSyncCode();
      await Promise.all([
        pushBoards(code, profileName, boards),
        pushSettings(code, profileName, settings),
      ]);
      setLastSync(new Date());
    } catch (e) {
      setSyncError(`Sync failed: ${e.message}`);
      console.error("Sync push error:", e);
    } finally {
      setSyncing(false);
    }
  }, [getSyncCode, profileName]);

  const pullAll = useCallback(async (syncCode) => {
    setSyncing(true);
    setSyncError(null);
    try {
      const code = syncCode.toUpperCase().trim();
      const [boards, settings] = await Promise.all([
        pullBoards(code),
        pullSettings(code),
      ]);
      if (!boards.length && !settings) {
        setSyncError("No data found for that sync code.");
        return null;
      }
      localStorage.setItem(SYNC_CODE_KEY(profileId), code);
      setLastSync(new Date());
      return { boards, settings };
    } catch (e) {
      setSyncError(`Sync failed: ${e.message}`);
      console.error("Sync pull error:", e);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [profileId]);

  return { getSyncCode, pushAll, pullAll, syncing, lastSync, syncError };
}
