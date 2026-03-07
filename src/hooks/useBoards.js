import { useState, useEffect } from "react";
import { EMOJI_SYMBOLS } from "../constants/symbols";
import { DEFAULT_BOARDS } from "../constants/config";

const STORAGE_KEY = "symbosay_boards";

function loadBoards() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn("Could not load boards:", e);
  }
  return DEFAULT_BOARDS(EMOJI_SYMBOLS);
}

function persistBoards(boards) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch (e) {
    console.warn("Could not save boards:", e);
  }
}

export function useBoards() {
  const [boards, setBoards] = useState(loadBoards);
  const [activeBoard, setActiveBoard] = useState(null);

  useEffect(() => {
    persistBoards(boards);
  }, [boards]);

  const saveBoard = (boardData) => {
    const id = boardData.id || "board-" + Date.now();
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
    loadBoard: setActiveBoard,
    clearActiveBoard: () => setActiveBoard(null),
  };
}
