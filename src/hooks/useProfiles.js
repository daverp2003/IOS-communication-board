import { useState, useCallback } from "react";
import { storageGet, storageSet, storageRemove } from "./useStorageHealth";

const PROFILES_KEY = "symbosay_profiles";
const ACTIVE_KEY   = "symbosay_active_profile";

const AVATAR_EMOJIS = [
  "😊","🌟","🦁","🐶","🦋","🌈","🎯","🚀",
  "🎨","🌸","🐱","🐼","🦊","🐸","🌺","⭐",
];

const DEFAULT_PROFILE = {
  id:    "default",
  name:  "Default User",
  emoji: "😊",
  color: "#6366F1",
};

function loadProfiles() {
  const profiles = storageGet(PROFILES_KEY, [DEFAULT_PROFILE]);
  return Array.isArray(profiles) && profiles.length ? profiles : [DEFAULT_PROFILE];
}

function saveProfiles(profiles) {
  return storageSet(PROFILES_KEY, profiles);
}

export { AVATAR_EMOJIS };

export function useProfiles() {
  const [profiles,      setProfiles]      = useState(loadProfiles);
  const [activeProfile, setActiveProfile] = useState(() => {
    const savedId = storageGet(ACTIVE_KEY, null);
    const all     = loadProfiles();
    return all.find((p) => p.id === savedId) || null;
  });

  const selectProfile = useCallback((profile) => {
    storageSet(ACTIVE_KEY, profile.id);
    setActiveProfile(profile);
  }, []);

  const addProfile = useCallback(({ name, emoji, color }) => {
    const profile = {
      id:    `profile_${Date.now()}`,
      name:  name.trim(),
      emoji: emoji || "😊",
      color: color || "#6366F1",
    };
    setProfiles((prev) => {
      const next = [...prev, profile];
      saveProfiles(next);
      return next;
    });
    return profile;
  }, []);

  const deleteProfile = useCallback((id) => {
    ["boards", "settings", "custom_icons", "sync_code"].forEach((s) =>
      storageRemove(`symbosay_${s}_${id}`)
    );
    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProfiles(next);
      return next;
    });
    if (activeProfile?.id === id) {
      storageRemove(ACTIVE_KEY);
      setActiveProfile(null);
    }
  }, [activeProfile]);

  const updateProfile = useCallback((id, changes) => {
    setProfiles((prev) => {
      const next = prev.map((p) => p.id === id ? { ...p, ...changes } : p);
      saveProfiles(next);
      return next;
    });
    setActiveProfile((prev) => prev?.id === id ? { ...prev, ...changes } : prev);
  }, []);

  const logout = useCallback(() => {
    storageRemove(ACTIVE_KEY);
    setActiveProfile(null);
  }, []);

  return {
    profiles,
    activeProfile,
    selectProfile,
    addProfile,
    deleteProfile,
    updateProfile,
    logout,
  };
}
