import { useState, useCallback } from "react";

const PROFILES_KEY    = "symbosay_profiles";
const ACTIVE_KEY      = "symbosay_active_profile";

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
  try {
    const stored = localStorage.getItem(PROFILES_KEY);
    const profiles = stored ? JSON.parse(stored) : [DEFAULT_PROFILE];
    // Always ensure at least one profile exists
    return profiles.length ? profiles : [DEFAULT_PROFILE];
  } catch {
    return [DEFAULT_PROFILE];
  }
}

function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export { AVATAR_EMOJIS };

export function useProfiles() {
  const [profiles,      setProfiles]      = useState(loadProfiles);
  const [activeProfile, setActiveProfile] = useState(() => {
    const savedId = localStorage.getItem(ACTIVE_KEY);
    const all     = loadProfiles();
    return all.find((p) => p.id === savedId) || null; // null = show picker
  });

  const selectProfile = useCallback((profile) => {
    localStorage.setItem(ACTIVE_KEY, profile.id);
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
    // Clean up all data for this profile
    const keySuffixes = ["boards", "settings", "custom_icons"];
    keySuffixes.forEach((s) => localStorage.removeItem(`symbosay_${s}_${id}`));

    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProfiles(next);
      return next;
    });

    // If deleting the active profile, go back to picker
    if (activeProfile?.id === id) {
      localStorage.removeItem(ACTIVE_KEY);
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
    localStorage.removeItem(ACTIVE_KEY);
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
