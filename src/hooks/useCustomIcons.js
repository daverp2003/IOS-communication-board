import { useState, useCallback, useEffect } from "react";

function storageKey(profileId) {
  return profileId ? `symbosay_custom_icons_${profileId}` : "symbosay_custom_icons";
}

const load = (profileId) => {
  try { return JSON.parse(localStorage.getItem(storageKey(profileId)) || "[]"); }
  catch { return []; }
};

const save = (icons, profileId) => {
  localStorage.setItem(storageKey(profileId), JSON.stringify(icons));
};

export function useCustomIcons(profileId) {
  const [icons, setIcons] = useState(() => load(profileId));

  // Reload when profile switches
  useEffect(() => {
    setIcons(load(profileId));
  }, [profileId]);

  const addIcon = useCallback(({ label, dataUrl }) => {
    const icon = {
      id:      `custom_${Date.now()}`,
      label:   label.trim(),
      dataUrl,
      color:   "#6366F1",
      emoji:   null,
      custom:  true,
    };
    setIcons((prev) => {
      const next = [...prev, icon];
      save(next, profileId);
      return next;
    });
    return icon;
  }, [profileId]);

  const deleteIcon = useCallback((id) => {
    setIcons((prev) => {
      const next = prev.filter((ic) => ic.id !== id);
      save(next, profileId);
      return next;
    });
  }, [profileId]);

  const renameIcon = useCallback((id, newLabel) => {
    setIcons((prev) => {
      const next = prev.map((ic) => ic.id === id ? { ...ic, label: newLabel.trim() } : ic);
      save(next, profileId);
      return next;
    });
  }, [profileId]);

  return { icons, addIcon, deleteIcon, renameIcon };
}
