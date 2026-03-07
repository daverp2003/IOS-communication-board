import { useState } from "react";
import { EMOJI_SYMBOLS, getAllSymbols } from "./constants/symbols";
import { CATEGORIES, VOICES, THEMES } from "./constants/config";
import { useSpeech } from "./hooks/useSpeech";
import { useBoards } from "./hooks/useBoards";
import { usePIN } from "./hooks/usePIN";
import SymbolTile from "./components/SymbolTile";
import MessageBar from "./components/MessageBar";
import MyBoardsView from "./components/MyBoardsView";
import BuilderView from "./components/BuilderView";
import SettingsView from "./components/SettingsView";
import PINLock from "./components/PINLock";

const PROTECTED_VIEWS = ["myboards", "builder", "settings"];

export default function App() {
  const [view, setView]                     = useState("board");
  const [activeCategory, setActiveCategory] = useState("greetings");
  const [message, setMessage]               = useState([]);
  const [searchQuery, setSearchQuery]       = useState("");
  const [selectedVoice, setSelectedVoice]   = useState(VOICES[0]);
  const [theme, setTheme]                   = useState("light");
  const [tileSize, setTileSize]             = useState(108);
  const [editingBoard, setEditingBoard]     = useState(null);
  const [pinModalFor, setPinModalFor]       = useState(null);

  const pin = usePIN();
  const { speaking, speak, stop } = useSpeech();
  const { boards, activeBoard, saveBoard, deleteBoard, loadBoard, clearActiveBoard } = useBoards();

  const T = THEMES[theme];

  const sz = {
    tile:  tileSize,
    font:  Math.max(10, Math.round(10 + (tileSize - 70) * 0.11)),
    emoji: Math.max(22, Math.round(22 + (tileSize - 70) * 0.46)),
  };

  const searchResults = searchQuery.trim()
    ? getAllSymbols().filter((s) => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const boardSymbols = searchQuery
    ? searchResults
    : activeBoard
      ? Object.values(activeBoard.cells)
      : EMOJI_SYMBOLS[activeCategory] || [];

  const handleTilePress = (symbol) => {
    setMessage((prev) => [...prev, symbol]);
    speak(symbol.label, selectedVoice);
  };

  const handleSpeak = () => {
    if (speaking) { stop(); return; }
    if (message.length) speak(message.map((s) => s.label).join(" "), selectedVoice);
  };

  const navigateTo = (targetView, builderBoard = null) => {
    if (PROTECTED_VIEWS.includes(targetView) && pin.isPINEnabled() && !pin.isUnlocked) {
      setPinModalFor({ view: targetView, builderBoard });
      return;
    }
    if (targetView === "builder") setEditingBoard(builderBoard);
    setView(targetView);
  };

  const css = {
    app:       { fontFamily: "'Nunito', sans-serif", background: T.bg, minHeight: "100dvh", maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column" },
    header:    { background: T.panel, padding: "12px 14px 0", boxShadow: `0 2px 20px ${T.shadow}`, position: "sticky", top: 0, zIndex: 100 },
    topBar:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    appTitle:  { fontWeight: 900, fontSize: 18, color: "#6366F1", letterSpacing: "-0.01em" },
    body:      { flex: 1, padding: "12px 12px 90px", overflowY: "auto" },
    bottomNav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 900, background: T.panel, borderTop: `1px solid ${T.border}`, display: "flex", padding: "8px 8px 12px", gap: 4, zIndex: 200, boxShadow: `0 -4px 20px ${T.shadow}` },
    navBtn:    (on) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "6px 0", borderRadius: 10, color: on ? "#6366F1" : T.subtext, fontFamily: "inherit" }),
    searchRow: { display: "flex", alignItems: "center", gap: 8, background: T.bg, border: `2px solid ${T.border}`, borderRadius: 12, padding: "7px 12px", marginBottom: 10 },
    input:     { border: "none", background: "none", outline: "none", flex: 1, fontSize: 14, color: T.text, fontFamily: "inherit" },
    smallBtn:  { background: T.border, border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 15, color: T.text },
  };

  return (
    <div style={css.app}>

      {(view === "board" || view === "myboards") && (
        <div style={css.header}>
          <div style={css.topBar}>
            <span style={css.appTitle}>💬 SymboSay</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {activeBoard && (
                <>
                  <span style={{ fontSize: 12, background: `${activeBoard.color}22`, color: activeBoard.color, border: `1px solid ${activeBoard.color}55`, borderRadius: 20, padding: "2px 10px", fontWeight: 800 }}>
                    {activeBoard.emoji} {activeBoard.name}
                  </span>
                  <button style={css.smallBtn} onClick={clearActiveBoard}>✕</button>
                </>
              )}
              {speaking && <span style={{ fontSize: 12, color: "#6366F1", fontWeight: 700 }}>🔊 Speaking…</span>}
            </div>
          </div>

          <MessageBar message={message} speaking={speaking} onSpeak={handleSpeak} onBackspace={() => setMessage((p) => p.slice(0, -1))} onClear={() => { setMessage([]); stop(); }} T={T} />

          {view === "board" && (
            <>
              <div style={css.searchRow}>
                <span>🔍</span>
                <input style={css.input} placeholder="Search all symbols…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                {searchQuery && <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15 }} onClick={() => setSearchQuery("")}>✕</button>}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 2px 8px", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 13, color: T.subtext, fontWeight: 700, whiteSpace: "nowrap" }}>🔲 Size</span>
                <span style={{ fontSize: 13, fontWeight: 900 }}>A</span>
                <input type="range" min={70} max={350} step={5} value={tileSize} onChange={(e) => setTileSize(Number(e.target.value))} style={{ flex: 1, accentColor: "#6366F1", cursor: "pointer" }} />
                <span style={{ fontSize: 24, fontWeight: 900 }}>A</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#6366F1", background: "#EEF2FF", borderRadius: 6, padding: "2px 7px", minWidth: 32, textAlign: "center" }}>
                  {tileSize < 100 ? "XS" : tileSize < 130 ? "S" : tileSize < 175 ? "M" : tileSize < 230 ? "L" : tileSize < 290 ? "XL" : "XXL"}
                </span>
              </div>

              {!searchQuery && !activeBoard && (
                <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
                  {CATEGORIES.map((cat) => (
                    <button key={cat.id} style={{ flexShrink: 0, background: activeCategory === cat.id ? cat.color : "none", border: "none", borderRadius: "10px 10px 0 0", padding: "7px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer", color: activeCategory === cat.id ? "#1A1A2E" : T.subtext, display: "flex", alignItems: "center", gap: 5 }}
                      onClick={() => setActiveCategory(cat.id)}>
                      <span>{cat.emoji}</span><span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div style={css.body}>
        {view === "board" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 10 }}>
            {boardSymbols.length === 0 && searchQuery && (
              <div style={{ textAlign: "center", padding: 40, color: T.subtext, width: "100%" }}>
                <div style={{ fontSize: 48 }}>🔍</div>
                <p style={{ fontWeight: 700, marginTop: 12 }}>No symbols found</p>
              </div>
            )}
            {boardSymbols.map((sym, i) => (
              <SymbolTile key={`${sym.id}-${i}`} symbol={sym} sz={sz} T={T} theme={theme} onPress={() => handleTilePress(sym)} />
            ))}
          </div>
        )}

        {view === "myboards" && (
          <MyBoardsView boards={boards} T={T}
            onLoad={(board) => { loadBoard(board); setView("board"); setSearchQuery(""); }}
            onEdit={(board) => navigateTo("builder", board)}
            onDelete={deleteBoard}
            onNewBoard={() => navigateTo("builder", null)}
          />
        )}

        {view === "builder" && (
          <BuilderView T={T} theme={theme} initialBoard={editingBoard} onSave={saveBoard} onBack={() => setView("myboards")} />
        )}

        {view === "settings" && (
          <SettingsView
            tileSize={tileSize} setTileSize={setTileSize}
            selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice}
            theme={theme} setTheme={setTheme}
            T={T}
            pin={pin}
          />
        )}
      </div>

      <div style={css.bottomNav}>
        {[
          { id: "board",    icon: "🎯", label: "Board"    },
          { id: "myboards", icon: "📋", label: "My Boards" },
          { id: "builder",  icon: "✏️",  label: "Builder"  },
          { id: "settings", icon: "⚙️", label: "Settings" },
        ].map((item) => (
          <button key={item.id} style={css.navBtn(view === item.id)}
            onClick={() => navigateTo(item.id, item.id === "builder" ? null : undefined)}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            {PROTECTED_VIEWS.includes(item.id) && pin.isPINEnabled() && !pin.isUnlocked
              ? <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 2 }}>
                  {item.label} <span style={{ fontSize: 8 }}>🔒</span>
                </span>
              : <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</span>
            }
          </button>
        ))}
      </div>

      {pinModalFor && (
        <PINLock
          T={T}
          onSuccess={() => {
            pin.unlock();
            const { view: targetView, builderBoard } = pinModalFor;
            if (targetView === "builder") setEditingBoard(builderBoard);
            setView(targetView);
            setPinModalFor(null);
          }}
          onCancel={() => setPinModalFor(null)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #C7D2FE; border-radius: 10px; }
        @keyframes pop { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}
