import { useState, useCallback } from "react";

const STORAGE_KEY = "symbosay_custom_icons";

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
};

const save = (icons) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(icons));
};

export function useCustomIcons() {
  const [icons, setIcons] = useState(load);

  /** Add a new custom icon — returns the saved icon object */
  const addIcon = useCallback(({ label, dataUrl }) => {
    const icon = {
      id:      `custom_${Date.now()}`,
      label:   label.trim(),
      dataUrl,
      color:   "#6366F1",   // default accent colour for borders
      emoji:   null,        // no emoji — image is used instead
      custom:  true,
    };
    setIcons((prev) => {
      const next = [...prev, icon];
      save(next);
      return next;
    });
    return icon;
  }, []);

  /** Delete a custom icon by id */
  const deleteIcon = useCallback((id) => {
    setIcons((prev) => {
      const next = prev.filter((ic) => ic.id !== id);
      save(next);
      return next;
    });
  }, []);

  /** Update the label of an existing icon */
  const renameIcon = useCallback((id, newLabel) => {
    setIcons((prev) => {
      const next = prev.map((ic) => ic.id === id ? { ...ic, label: newLabel.trim() } : ic);
      save(next);
      return next;
    });
  }, []);

  return { icons, addIcon, deleteIcon, renameIcon };
}
