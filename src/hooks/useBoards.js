import { useState, useEffect } from "react";
import { EMOJI_SYMBOLS } from "../constants/symbols";
import { DEFAULT_BOARDS } from "../constants/config";
import { storageGet, storageSet } from "./useStorageHealth";

function storageKey(profileId) {
  return profileId ? `symbosay_boards_${profileId}` : "symbosay_boards";
}

function loadBoards(profileId) {
  const boards = storageGet(storageKey(profileId), null);
  if (Array.isArray(boards) && boards.length) return boards;
  return DEFAULT_BOARDS(EMOJI_SYMBOLS);
}

export function useBoards(profileId, onStorageError) {
  const [boards, setBoards]           = useState(() => loadBoards(profileId));
  const [activeBoard, setActiveBoard] = useState(null);

  // Reload when profile switches
  useEffect(() => {
    setBoards(loadBoards(profileId));
    setActiveBoard(null);
  }, [profileId]);

  // Persist whenever boards change
  useEffect(() => {
    const result = storageSet(storageKey(profileId), boards);
    if (!result.ok && result.quota) {
      onStorageError?.("Storage is full — boards could not be saved. Delete some custom photos to free up space.");
    }
  }, [boards, profileId, onStorageError]);

  const saveBoard = (boardData) => {
    const id    = boardData.id || "board-" + Date.now();
    const board = {
      ...boardData,
      id,
      updatedAt: new Date().toISOString(),
    };
    setBoards((prev) =>
      prev.some((b) => b.id === id)
        ? prev.map((b) => (b.id === id ? board : b))
        : [...prev, board]
    );
    return id;
  };

  const deleteBoard = (id) => {
    setBoards((prev) => prev.filter((b) => b.id !== id));
    if (activeBoard?.id === id) setActiveBoard(null);
  };

  // Most recent updatedAt across all boards — used for conflict detection
  const lastLocalUpdate = boards.reduce((latest, b) => {
    if (!b.updatedAt) return latest;
    return !latest || b.updatedAt > latest ? b.updatedAt : latest;
  }, null);

  return {
    boards,
    activeBoard,
    lastLocalUpdate,
    saveBoard,
    deleteBoard,
    loadBoard:        setActiveBoard,
    clearActiveBoard: () => setActiveBoard(null),
  };
}
