import { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://fgrfvoazrkutlmiqnmov.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncmZ2b2F6cmt1dGxtaXFubW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODkwNjgsImV4cCI6MjA4ODQ2NTA2OH0.lofg1sMtoeY-XIbtkUVb4pMcbUXmD8lnL-N3uYfwTT0"
);

const SYNC_CODE_KEY = (profileId) => `symbosay_sync_code_${profileId}`;

function generateSyncCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

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
  const { data, error } = await supabase.from("sync_boards").select("data").eq("sync_code", syncCode);
  if (error) throw new Error(error.message);
  return (data || []).map((r) => r.data);
}

async function pullSettings(syncCode) {
  const { data, error } = await supabase.from("sync_settings").select("data").eq("sync_code", syncCode).single();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return data?.data ?? null;
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
    setSyncing(true); setSyncError(null);
    try {
      const code = syncCode.toUpperCase().trim();
      const [boards, settings] = await Promise.all([pullBoards(code), pullSettings(code)]);
      if (!boards.length && !settings) { setSyncError("No data found for that sync code."); return null; }
      localStorage.setItem(SYNC_CODE_KEY(profileId), code);
      setLastSync(new Date());
      return { boards, settings };
    } catch (e) {
      setSyncError(`Sync failed: ${e.message}`);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [profileId]);

  return { getSyncCode, pushAll, pullAll, syncing, lastSync, syncError };
}
