import { useState, useEffect } from "react";
import { storageGet, storageSet } from "./useStorageHealth";

const DEFAULTS = {
  themeId:  "light",
  voiceId:  "aria",
  tileSize: 140,
};

function storageKey(profileId) {
  return profileId ? `symbosay_settings_${profileId}` : "symbosay_settings";
}

function loadSettings(profileId) {
  const saved = storageGet(storageKey(profileId), null);
  return saved ? { ...DEFAULTS, ...saved } : { ...DEFAULTS };
}

export function useSettings(profileId) {
  const [settings, setSettings] = useState(() => loadSettings(profileId));

  useEffect(() => {
    setSettings(loadSettings(profileId));
  }, [profileId]);

  useEffect(() => {
    storageSet(storageKey(profileId), settings);
  }, [settings, profileId]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting };
}
