import { useState, useCallback, useEffect } from "react";
import { idbGetIcons, idbSaveIcon, idbDeleteIcon } from "./useIndexedDB";
import { storageGet, storageRemove } from "./useStorageHealth";

/** One-time migration: move old base64 icons from localStorage into IndexedDB */
async function migrateFromLocalStorage(profileId) {
  const migrationKey = `symbosay_icons_migrated_${profileId}`;
  if (storageGet(migrationKey, false)) return; // already done

  const oldKey  = profileId ? `symbosay_custom_icons_${profileId}` : "symbosay_custom_icons";
  const oldIcons = storageGet(oldKey, null);
  if (Array.isArray(oldIcons) && oldIcons.length > 0) {
    await Promise.all(
      oldIcons.map((icon) => idbSaveIcon({ ...icon, profileId }))
    );
    storageRemove(oldKey);
  }
  // Mark as migrated even if there was nothing to move
  try { localStorage.setItem(migrationKey, "1"); } catch {}
}

export function useCustomIcons(profileId) {
  const [icons,   setIcons]   = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from IndexedDB whenever profile changes (migrate old data first)
  useEffect(() => {
    if (!profileId) { setIcons([]); setLoading(false); return; }
    setLoading(true);
    migrateFromLocalStorage(profileId).then(() =>
      idbGetIcons(profileId).then((loaded) => {
        setIcons(loaded);
        setLoading(false);
      })
    );
  }, [profileId]);

  const addIcon = useCallback(async ({ label, dataUrl }) => {
    const icon = {
      id:        `custom_${Date.now()}`,
      profileId,
      label:     label.trim(),
      dataUrl,
      color:     "#6366F1",
      emoji:     null,
      custom:    true,
    };
    const saved = await idbSaveIcon(icon);
    if (saved) setIcons((prev) => [...prev, icon]);
    return saved ? icon : null;
  }, [profileId]);

  const deleteIcon = useCallback(async (id) => {
    await idbDeleteIcon(id);
    setIcons((prev) => prev.filter((ic) => ic.id !== id));
  }, []);

  const renameIcon = useCallback(async (id, newLabel) => {
    setIcons((prev) => {
      const next = prev.map((ic) =>
        ic.id === id ? { ...ic, label: newLabel.trim() } : ic
      );
      const updated = next.find((ic) => ic.id === id);
      if (updated) idbSaveIcon(updated);
      return next;
    });
  }, []);

  return { icons, loading, addIcon, deleteIcon, renameIcon };
}
