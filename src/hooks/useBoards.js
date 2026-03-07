import { useState, useEffect } from "react";
import { EMOJI_SYMBOLS } from "../constants/symbols";
import { DEFAULT_BOARDS } from "../constants/config";

function storageKey(profileId) {
  return profileId ? `symbosay_boards_${profileId}` : "symbosay_boards";
}

function loadBoards(profileId) {
  try {
    const stored = localStorage.getItem(storageKey(profileId));
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn("Could not load boards:", e);
  }
  return DEFAULT_BOARDS(EMOJI_SYMBOLS);
}

function persistBoards(boards, profileId) {
  try {
    localStorage.setItem(storageKey(profileId), JSON.stringify(boards));
  } catch (e) {
    console.warn("Could not save boards:", e);
  }
}

export function useBoards(profileId) {
  const [boards, setBoards]           = useState(() => loadBoards(profileId));
  const [activeBoard, setActiveBoard] = useState(null);

  // Reload when profile switches
  useEffect(() => {
    setBoards(loadBoards(profileId));
    setActiveBoard(null);
  }, [profileId]);

  useEffect(() => {
    persistBoards(boards, profileId);
  }, [boards, profileId]);

  const saveBoard = (boardData) => {
    const id    = boardData.id || "board-" + Date.now();
    const board = { ...boardData, id };
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

  return {
    boards,
    activeBoard,
    saveBoard,
    deleteBoard,
    loadBoard:        setActiveBoard,
    clearActiveBoard: () => setActiveBoard(null),
  };
}
