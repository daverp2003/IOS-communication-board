import { useState, useCallback, useEffect } from "react";
import { storageGet, storageSet } from "./useStorageHealth";

function storageKey(profileId) {
  return profileId ? `symbosay_custom_icons_${profileId}` : "symbosay_custom_icons";
}

export function useCustomIcons(profileId, onStorageError) {
  const [icons, setIcons] = useState(() => storageGet(storageKey(profileId), []));

  useEffect(() => {
    setIcons(storageGet(storageKey(profileId), []));
  }, [profileId]);

  const persist = useCallback((next) => {
    const result = storageSet(storageKey(profileId), next);
    if (!result.ok && result.quota) {
      onStorageError?.(
        "Storage is full — this photo could not be saved. Delete some existing custom photos to free up space."
      );
    }
    return result.ok;
  }, [profileId, onStorageError]);

  const addIcon = useCallback(({ label, dataUrl }) => {
    const icon = {
      id:     `custom_${Date.now()}`,
      label:  label.trim(),
      dataUrl,
      color:  "#6366F1",
      emoji:  null,
      custom: true,
    };
    setIcons((prev) => {
      const next = [...prev, icon];
      const saved = persist(next);
      // Roll back optimistic add if storage failed
      return saved ? next : prev;
    });
    return icon;
  }, [persist]);

  const deleteIcon = useCallback((id) => {
    setIcons((prev) => {
      const next = prev.filter((ic) => ic.id !== id);
      persist(next);
      return next;
    });
  }, [persist]);

  const renameIcon = useCallback((id, newLabel) => {
    setIcons((prev) => {
      const next = prev.map((ic) => ic.id === id ? { ...ic, label: newLabel.trim() } : ic);
      persist(next);
      return next;
    });
  }, [persist]);

  return { icons, addIcon, deleteIcon, renameIcon };
}
