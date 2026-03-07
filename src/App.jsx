import { useState, useEffect } from "react";
import { EMOJI_SYMBOLS, getAllSymbols } from "./constants/symbols";
import { CATEGORIES, THEMES } from "./constants/config";
import { useSpeech }           from "./hooks/useSpeech";
import { useBoards }           from "./hooks/useBoards";
import { useSettings }         from "./hooks/useSettings";
import { usePIN }              from "./hooks/usePIN";
import { useProfiles }         from "./hooks/useProfiles";
import { useSync }             from "./hooks/useSync";
import { useStorageHealth, storageGet, storageSet } from "./hooks/useStorageHealth";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import VirtualSymbolGrid  from "./components/VirtualSymbolGrid";
import MessageBar         from "./components/MessageBar";
import MyBoardsView       from "./components/MyBoardsView";
import BuilderView        from "./components/BuilderView";
import SettingsView       from "./components/SettingsView";
import PINLock            from "./components/PINLock";
import ProfilePicker      from "./components/ProfilePicker";

const PROTECTED_VIEWS = ["myboards", "builder", "settings"];
const MSG_SAVE_KEY    = (profileId) => `symbosay_saved_message_${profileId}`;

export default function App() {
  // ── Profiles ───────────────────────────────────────────
  const { profiles, activeProfile, selectProfile, addProfile, deleteProfile, logout } = useProfiles();

  const profileId = activeProfile?.id ?? null;

  // ── Storage health ─────────────────────────────────────
  const { storageWarning, storageError, setStorageError, clearError } = useStorageHealth();

  // ── Online status ──────────────────────────────────────
  const { isOnline, wasOffline } = useOnlineStatus();

  // ── Per-profile state ──────────────────────────────────
  const [view, setView]                     = useState("board");
  const [activeCategory, setActiveCategory] = useState("greetings");
  const [message, setMessage]               = useState(() => storageGet(MSG_SAVE_KEY(profileId), []));
  const [searchQuery, setSearchQuery]       = useState("");
  const [editingBoard, setEditingBoard]     = useState(null);
  const [pinModalFor, setPinModalFor]       = useState(null);

  // Persisted settings (theme + tileSize survive page refresh)
  const { settings, updateSetting } = useSettings(profileId);
  const theme    = settings.themeId;
  const tileSize = settings.tileSize;
  const setTheme    = (v) => updateSetting("themeId", v);
  const setTileSize = (v) => updateSetting("tileSize", v);

  const pin  = usePIN();
  const sync = useSync(profileId, activeProfile?.name ?? "User");
  const speech = useSpeech();
  const { speaking, speak, stop } = speech;
  const { boards, activeBoard, saveBoard, deleteBoard, loadBoard, clearActiveBoard } = useBoards(profileId, setStorageError);

  // Restore saved message when profile changes
  useEffect(() => {
    setMessage(storageGet(MSG_SAVE_KEY(profileId), []));
  }, [profileId]);

  // Auto-save message bar when page closes or profile switches
  useEffect(() => {
    const save = () => {
      if (profileId) storageSet(MSG_SAVE_KEY(profileId), message);
    };
    window.addEventListener("beforeunload", save);
    return () => {
      save(); // also save on unmount / profile switch
      window.removeEventListener("beforeunload", save);
    };
  }, [message, profileId]);

  const T = THEMES[theme] ?? THEMES.light;

  // Apply pulled sync data back to local state
  const handlePullSuccess = (pulledBoards, pulledSettings) => {
    if (pulledBoards?.length) pulledBoards.forEach(saveBoard);
    if (pulledSettings?.tileSize) updateSetting("tileSize", pulledSettings.tileSize);
    if (pulledSettings?.themeId) updateSetting("themeId", pulledSettings.themeId);
  };

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
    speak(symbol.label);
  };

  const handleSpeak = () => {
    if (speaking) { stop(); return; }
    if (message.length) speak(message.map((s) => s.label).join(" "));
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
    app:       { fontFamily: "'Nunito', sans-serif", background: T.bg, minHeight: "100dvh", width: "100%", display: "flex", flexDirection: "column" },
    header:    { background: T.panel, padding: "12px 14px 0", boxShadow: `0 2px 20px ${T.shadow}`, position: "sticky", top: 0, zIndex: 100 },
    topBar:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    appTitle:  { fontWeight: 900, fontSize: 18, color: "#6366F1", letterSpacing: "-0.01em" },
    body:      { flex: 1, padding: "12px 12px 90px", overflowY: "auto", WebkitOverflowScrolling: "touch" },
    bottomNav: { position: "fixed", bottom: 0, left: 0, width: "100%", background: T.panel, borderTop: `1px solid ${T.border}`, display: "flex", padding: "8px 8px 12px", gap: 4, zIndex: 200, boxShadow: `0 -4px 20px ${T.shadow}` },
    navBtn:    (on) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "6px 0", borderRadius: 10, color: on ? "#6366F1" : T.subtext, fontFamily: "inherit" }),
    searchRow: { display: "flex", alignItems: "center", gap: 8, background: T.bg, border: `2px solid ${T.border}`, borderRadius: 12, padding: "7px 12px", marginBottom: 10 },
    input:     { border: "none", background: "none", outline: "none", flex: 1, fontSize: 14, color: T.text, fontFamily: "inherit" },
    smallBtn:  { background: T.border, border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 15, color: T.text },
  };

  // ── Show profile picker if no active profile ────────────
  if (!activeProfile) {
    return (
      <ProfilePicker
        profiles={profiles}
        onSelect={selectProfile}
        onAdd={addProfile}
        onDelete={deleteProfile}
        pin={pin}
      />
    );
  }

  return (
    <div style={css.app}>

      {(view === "board" || view === "myboards") && (
        <div style={css.header}>
          <div style={css.topBar}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={css.appTitle}>💬 SymboSay</span>
              {/* Active profile badge */}
              <button
                onClick={logout}
                title="Switch profile"
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: `${activeProfile.color}18`,
                  border: `1px solid ${activeProfile.color}44`,
                  borderRadius: 20, padding: "3px 10px 3px 6px",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 16 }}>{activeProfile.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: activeProfile.color }}>{activeProfile.name}</span>
              </button>
            </div>
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

      {/* Offline banner */}
      {!isOnline && (
        <div style={{
          background: "#1F2937",
          padding: "7px 16px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#F9FAFB" }}>
            📡 You're offline — the app will still work, but sync is unavailable.
          </span>
        </div>
      )}
      {isOnline && wasOffline && (
        <div style={{
          background: "#D1FAE5",
          borderBottom: "1px solid #6EE7B7",
          padding: "7px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#065F46" }}>
            ✅ Back online
          </span>
        </div>
      )}

      {/* Storage warning banners */}
      {(storageError || storageWarning) && (
        <div style={{
          background: storageError ? "#FEF2F2" : "#FFFBEB",
          borderBottom: `1px solid ${storageError ? "#FECACA" : "#FDE68A"}`,
          padding: "8px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: storageError ? "#DC2626" : "#92400E" }}>
            {storageError
              ? `⚠️ ${storageError}`
              : storageWarning === "full"
                ? "⚠️ Storage is full — delete custom photos to free up space."
                : "⚠️ Storage is nearly full — consider deleting unused boards or photos."}
          </span>
          <button onClick={clearError} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#6B7280", flexShrink: 0 }}>✕</button>
        </div>
      )}

      <div style={css.body} data-scroll-container>
        {view === "board" && (
          <>
            {boardSymbols.length === 0 && searchQuery && (
              <div style={{ textAlign: "center", padding: 40, color: T.subtext, width: "100%" }}>
                <div style={{ fontSize: 48 }}>🔍</div>
                <p style={{ fontWeight: 700, marginTop: 12 }}>No symbols found</p>
              </div>
            )}
            <VirtualSymbolGrid
              symbols={boardSymbols}
              sz={sz}
              T={T}
              theme={theme}
              onPress={handleTilePress}
            />
          </>
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
          <BuilderView T={T} theme={theme} initialBoard={editingBoard} onSave={saveBoard} onBack={() => setView("myboards")} profileId={profileId} />
        )}

        {view === "settings" && (
          <SettingsView
            tileSize={tileSize} setTileSize={setTileSize}
            theme={theme} setTheme={setTheme}
            T={T}
            speech={speech}
            pin={pin}
            sync={sync}
            boards={boards}
            settings={{ tileSize, theme }}
            onPullSuccess={handlePullSuccess}
          />
        )}
      </div>

      {/* Bottom nav */}
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

      {/* PIN modal */}
      {pinModalFor && (
        <PINLock
          T={T}
          checkPIN={pin.checkPIN}
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
