export const CATEGORIES = [
  // Virtual category — populated from useAnalytics.getTopSymbols()
  // EMOJI_SYMBOLS has no "most_used" key; App.jsx handles it specially.
  { id: "most_used", label: "Most Used", emoji: "⭐", color: "#6366F1" },
  { id: "greetings", label: "Greetings",    emoji: "👋", color: "#FFE066" },
  { id: "feelings",  label: "Feelings",     emoji: "😊", color: "#FF9F66" },
  { id: "food",      label: "Food",         emoji: "🍎", color: "#FCA5A5" },
  { id: "drinks",    label: "Drinks",       emoji: "🥤", color: "#67E8F9" },
  { id: "daily",     label: "Daily Living", emoji: "🪥", color: "#86EFAC" },
  { id: "health",    label: "Health",       emoji: "💊", color: "#FCD34D" },
  { id: "leisure",   label: "Leisure",      emoji: "🎮", color: "#A78BFA" },
  { id: "school",    label: "School",       emoji: "🏫", color: "#60A5FA" },
  { id: "places",    label: "Places",       emoji: "🏠", color: "#34D399" },
  { id: "people",    label: "People",       emoji: "👩", color: "#F472B6" },
  { id: "needs",     label: "Needs",        emoji: "❗", color: "#C4B5FD" },
];

export const VOICES = [
  { id: "female1", label: "Aria",   description: "Warm & Friendly",    pitch: 1.1,  rate: 0.95 },
  { id: "male1",   label: "Marcus", description: "Deep & Clear",       pitch: 0.85, rate: 0.9  },
  { id: "female2", label: "Zoe",    description: "Bright & Energetic", pitch: 1.2,  rate: 1.05 },
  { id: "male2",   label: "Oliver", description: "Calm & Steady",      pitch: 0.95, rate: 0.88 },
  { id: "child",   label: "Sam",    description: "Youthful & Light",   pitch: 1.3,  rate: 1.0  },
];

export const GRID_SIZES = [
  { label: "2×2", cols: 2, cells: 4  },
  { label: "2×3", cols: 3, cells: 6  },
  { label: "3×3", cols: 3, cells: 9  },
  { label: "3×4", cols: 4, cells: 12 },
  { label: "4×4", cols: 4, cells: 16 },
  { label: "4×5", cols: 5, cells: 20 },
];

export const BOARD_COLORS = [
  "#6366F1", "#EC4899", "#F59E0B", "#10B981",
  "#3B82F6", "#EF4444", "#8B5CF6", "#14B8A6",
];

export const BOARD_EMOJIS = [
  "⭐","🌟","💛","❤️","💙","💚","🎯","🎨",
  "🌈","🏠","🎒","🍎","🎵","🌸","🐶","😊",
];

export const THEMES = {
  light: {
    bg: "#F8F7FF", panel: "#FFFFFF", surface: "#FFFFFF", surfaceAlt: "#F1F0FF",
    text: "#1A1A2E", subtext: "#6B7280", textSub: "#6B7280",
    border: "#E5E7EB", msgBg: "#EEF2FF", shadow: "rgba(0,0,0,0.07)",
    primary: "#6366F1",
  },
  dark: {
    bg: "#0F0F1A", panel: "#1A1A2E", surface: "#1A1A2E", surfaceAlt: "#231F3A",
    text: "#F3F4F6", subtext: "#9CA3AF", textSub: "#9CA3AF",
    border: "#2D2D45", msgBg: "#1E1E3A", shadow: "rgba(0,0,0,0.3)",
    primary: "#818CF8",
  },
  highcontrast: {
    bg: "#000000", panel: "#111111", surface: "#111111", surfaceAlt: "#1A1A1A",
    text: "#FFFFFF", subtext: "#FFFF00", textSub: "#FFFF00",
    border: "#FFFFFF", msgBg: "#0A0A0A", shadow: "rgba(255,255,255,0.2)",
    primary: "#FFFF00",
  },
};

export const DEFAULT_BOARDS = (EMOJI_SYMBOLS) => [
  {
    id: "default-morning",
    name: "Morning Routine",
    color: "#6366F1",
    emoji: "🌅",
    gridSize: { label: "3×3", cols: 3, cells: 9 },
    cells: {
      0: EMOJI_SYMBOLS.greetings[8],
      1: EMOJI_SYMBOLS.daily[0],
      2: EMOJI_SYMBOLS.daily[2],
      3: EMOJI_SYMBOLS.daily[3],
      4: EMOJI_SYMBOLS.daily[1],
      5: EMOJI_SYMBOLS.food[0],
      6: EMOJI_SYMBOLS.drinks[0],
      7: EMOJI_SYMBOLS.daily[14],
      8: EMOJI_SYMBOLS.daily[16],
    },
  },
  {
    id: "default-feelings",
    name: "How I Feel",
    color: "#EC4899",
    emoji: "💭",
    gridSize: { label: "3×3", cols: 3, cells: 9 },
    cells: {
      0: EMOJI_SYMBOLS.feelings[0],
      1: EMOJI_SYMBOLS.feelings[1],
      2: EMOJI_SYMBOLS.feelings[2],
      3: EMOJI_SYMBOLS.feelings[3],
      4: EMOJI_SYMBOLS.feelings[4],
      5: EMOJI_SYMBOLS.feelings[5],
      6: EMOJI_SYMBOLS.feelings[8],
      7: EMOJI_SYMBOLS.feelings[22],
      8: EMOJI_SYMBOLS.needs[1],
    },
  },
];
