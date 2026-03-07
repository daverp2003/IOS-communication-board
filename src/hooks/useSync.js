import { useState, useCallback } from "react";

const SUPABASE_URL = "https://fgrfvoazrkutlmiqnmov.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncmZ2b2F6cmt1dGxtaXFubW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODkwNjgsImV4cCI6MjA4ODQ2NTA2OH0.lofg1sMtoeY-XIbtkUVb4pMcbUXmD8lnL-N3uYfwTT0";

const SYNC_CODE_KEY = (profileId) => `symbosay_sync_code_${profileId}`;

// Pass apikey as URL param as well as header — handles both old and new Supabase
async function sbFetch(path, options = {}) {
  const separator = path.includes("?") ? "&" : "?";
  const url = `${SUPABASE_URL}/rest/v1/${path}${separator}apikey=${SUPABASE_KEY}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type":  "application/json",
      "Prefer":        "return=minimal",
      "apikey":        SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
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

function generateSyncCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

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

async function pullBoards(syncCode) {
  const rows = await sbFetch(`sync_boards?sync_code=eq.${syncCode}&select=data`);
  return (rows || []).map((r) => r.data);
}

async function pullSettings(syncCode) {
  const rows = await sbFetch(`sync_settings?sync_code=eq.${syncCode}&select=data`);
  return rows?.[0]?.data ?? null;
}

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
