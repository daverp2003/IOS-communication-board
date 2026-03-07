import { useState, useEffect } from "react";

const DEFAULTS = {
  themeId: "light",
  voiceId: "aria",
  tileSize: 140,
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("symbosay_settings");
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("symbosay_settings", JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting };
}
