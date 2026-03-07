import { useState } from "react";
import { AVATAR_EMOJIS } from "../hooks/useProfiles";
import PINLock from "./PINLock";

const PROFILE_COLORS = [
  "#6366F1","#EC4899","#F59E0B","#10B981",
  "#3B82F6","#EF4444","#8B5CF6","#14B8A6",
];

/**
 * ProfilePicker — full-screen screen shown on app launch.
 *
 * Props:
 *   profiles      — array of profile objects
 *   onSelect      — (profile) => void
 *   onAdd         — ({ name, emoji, color }) => profile
 *   onDelete      — (id) => void
 *   pin           — usePIN() return value
 */
export default function ProfilePicker({ profiles, onSelect, onAdd, onDelete, pin }) {
  const [mode,         setMode]         = useState("pick");   // "pick" | "add" | "pin-add" | "pin-delete" | "confirm-delete"
  const [newName,      setNewName]      = useState("");
  const [newEmoji,     setNewEmoji]     = useState("😊");
  const [newColor,     setNewColor]     = useState(PROFILE_COLORS[0]);
  const [nameError,    setNameError]    = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const reset = () => {
    setMode("pick");
    setNewName(""); setNewEmoji("😊"); setNewColor(PROFILE_COLORS[0]);
    setNameError(""); setDeleteTarget(null);
  };

  const handleAddClick = () => {
    if (pin.isPINEnabled() && !pin.isUnlocked) { setMode("pin-add"); return; }
    setMode("add");
  };

  const handleDeleteClick = (profile) => {
    if (profiles.length <= 1) return; // keep at least one
    setDeleteTarget(profile);
    if (pin.isPINEnabled() && !pin.isUnlocked) { setMode("pin-delete"); return; }
    setMode("confirm-delete");
  };

  const handleSaveNew = () => {
    if (!newName.trim()) { setNameError("Please enter a name."); return; }
    const profile = onAdd({ name: newName, emoji: newEmoji, color: newColor });
    onSelect(profile);
    reset();
  };

  // ── Styles ────────────────────────────────────────────────
  const overlay = {
    position: "fixed", inset: 0,
    background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    zIndex: 9998, padding: "20px 16px",
    fontFamily: "'Nunito', sans-serif",
  };
  const card = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 20, padding: "28px 24px",
    width: "100%", maxWidth: 420,
    backdropFilter: "blur(16px)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  };
  const profileBtn = (color) => ({
    display: "flex", alignItems: "center", gap: 14,
    padding: "14px 16px", borderRadius: 16,
    border: `1.5px solid ${color}55`,
    background: `${color}18`,
    cursor: "pointer", width: "100%",
    marginBottom: 10, transition: "transform 0.12s",
    WebkitTapHighlightColor: "transparent",
  });
  const avatarCircle = (color) => ({
    width: 50, height: 50, borderRadius: "50%",
    background: `linear-gradient(135deg, ${color}, ${color}99)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 26, flexShrink: 0,
    boxShadow: `0 4px 12px ${color}44`,
  });
  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 12,
    border: "1.5px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.08)", color: "#fff",
    fontSize: 15, fontWeight: 700, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  };
  const primaryBtn = (color = "#6366F1") => ({
    width: "100%", padding: "13px 0", marginTop: 8,
    background: `linear-gradient(135deg, ${color}, ${color}bb)`,
    color: "#fff", border: "none", borderRadius: 14,
    fontWeight: 900, fontSize: 15, cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: `0 4px 16px ${color}55`,
  });
  const ghostBtn = {
    width: "100%", padding: "11px 0", marginTop: 8,
    background: "transparent",
    border: "1.5px solid rgba(255,255,255,0.2)",
    color: "rgba(255,255,255,0.6)", borderRadius: 14,
    fontWeight: 600, fontSize: 14, cursor: "pointer",
    fontFamily: "inherit",
  };

  // ── PIN modals ────────────────────────────────────────────
  if (mode === "pin-add") {
    return (
      <PINLock
        T={{ surface:"rgba(30,30,60,0.95)", border:"rgba(255,255,255,0.15)", text:"#fff", textSub:"rgba(255,255,255,0.5)", primary:"#6366F1", surfaceAlt:"rgba(255,255,255,0.08)" }}
        onSuccess={() => { pin.unlock(); setMode("add"); }}
        onCancel={reset}
      />
    );
  }
  if (mode === "pin-delete") {
    return (
      <PINLock
        T={{ surface:"rgba(30,30,60,0.95)", border:"rgba(255,255,255,0.15)", text:"#fff", textSub:"rgba(255,255,255,0.5)", primary:"#6366F1", surfaceAlt:"rgba(255,255,255,0.08)" }}
        onSuccess={() => { pin.unlock(); setMode("confirm-delete"); }}
        onCancel={reset}
      />
    );
  }

  return (
    <div style={overlay}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        .profile-btn:hover  { transform: scale(1.02); }
        .profile-btn:active { transform: scale(0.97); }
      `}</style>

      {/* ── PICK MODE ─────────────────────────────────────── */}
      {(mode === "pick" || mode === "confirm-delete") && (
        <div style={card}>
          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 38, marginBottom: 6 }}>💬</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.3px" }}>SymboSay</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Who's using the app?</div>
          </div>

          {/* Profile list */}
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {profiles.map((profile) => (
              <div key={profile.id} style={{ position: "relative" }}>
                <button
                  className="profile-btn"
                  style={profileBtn(profile.color)}
                  onClick={() => onSelect(profile)}
                >
                  <div style={avatarCircle(profile.color)}>{profile.emoji}</div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontWeight: 900, fontSize: 16, color: "#fff" }}>{profile.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>Tap to continue</div>
                  </div>
                  <div style={{ fontSize: 18, color: "rgba(255,255,255,0.3)" }}>›</div>
                </button>

                {/* Delete badge — only if more than 1 profile */}
                {profiles.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(profile); }}
                    style={{ position: "absolute", top: 6, right: 6, width: 20, height: 20, borderRadius: "50%", background: "#EF4444cc", border: "none", color: "#fff", fontSize: 10, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >✕</button>
                )}
              </div>
            ))}
          </div>

          {/* Add profile */}
          <button style={{ ...ghostBtn, marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={handleAddClick}>
            <span style={{ fontSize: 16 }}>＋</span> Add Profile
          </button>
        </div>
      )}

      {/* ── CONFIRM DELETE ────────────────────────────────── */}
      {mode === "confirm-delete" && deleteTarget && (
        <div style={{ ...card, position: "absolute", maxWidth: 320, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
          <div style={{ fontWeight: 900, fontSize: 16, color: "#fff", marginBottom: 8 }}>
            Delete "{deleteTarget.name}"?
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 20, lineHeight: 1.5 }}>
            All boards and settings for this profile will be permanently removed.
          </div>
          <button style={primaryBtn("#EF4444")} onClick={() => { onDelete(deleteTarget.id); reset(); }}>
            Yes, Delete Profile
          </button>
          <button style={ghostBtn} onClick={reset}>Cancel</button>
        </div>
      )}

      {/* ── ADD MODE ──────────────────────────────────────── */}
      {mode === "add" && (
        <div style={card}>
          <div style={{ fontWeight: 900, fontSize: 18, color: "#fff", marginBottom: 20, textAlign: "center" }}>
            👤 New Profile
          </div>

          {/* Avatar preview */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ ...avatarCircle(newColor), width: 70, height: 70, fontSize: 36 }}>{newEmoji}</div>
          </div>

          {/* Name input */}
          <input
            autoFocus
            placeholder="Name (e.g. Alex)"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setNameError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSaveNew()}
            style={{ ...inputStyle, marginBottom: 4 }}
          />
          {nameError && <p style={{ color: "#F87171", fontSize: 12, margin: "4px 0 8px", fontWeight: 600 }}>{nameError}</p>}

          {/* Emoji picker */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Avatar</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {AVATAR_EMOJIS.map((e) => (
                <button key={e} onClick={() => setNewEmoji(e)} style={{ fontSize: 22, padding: "5px 7px", borderRadius: 10, border: newEmoji === e ? "2px solid #6366F1" : "2px solid transparent", background: newEmoji === e ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)", cursor: "pointer", transform: newEmoji === e ? "scale(1.2)" : "scale(1)", transition: "transform 0.1s" }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Colour</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PROFILE_COLORS.map((c) => (
                <button key={c} onClick={() => setNewColor(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: newColor === c ? "3px solid #fff" : "3px solid transparent", cursor: "pointer", outline: newColor === c ? `3px solid ${c}` : "none", outlineOffset: 2, transform: newColor === c ? "scale(1.2)" : "scale(1)", transition: "transform 0.1s" }} />
              ))}
            </div>
          </div>

          <button style={primaryBtn(newColor)} onClick={handleSaveNew}>
            Create Profile ✓
          </button>
          <button style={ghostBtn} onClick={reset}>Cancel</button>
        </div>
      )}
    </div>
  );
}
