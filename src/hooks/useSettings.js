import { useState, useEffect } from "react";

const DEFAULTS = {
  themeId:  "light",
  voiceId:  "aria",
  tileSize: 140,
};

function storageKey(profileId) {
  return profileId ? `symbosay_settings_${profileId}` : "symbosay_settings";
}

function loadSettings(profileId) {
  try {
    const saved = localStorage.getItem(storageKey(profileId));
    return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function useSettings(profileId) {
  const [settings, setSettings] = useState(() => loadSettings(profileId));

  // Reload when profile switches
  useEffect(() => {
    setSettings(loadSettings(profileId));
  }, [profileId]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(profileId), JSON.stringify(settings));
    } catch {}
  }, [settings, profileId]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting };
}
