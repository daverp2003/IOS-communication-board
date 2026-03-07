import { useState } from "react";
import { VOICES } from "../constants/config";

export default function SettingsView({ tileSize, setTileSize, selectedVoice, setSelectedVoice, theme, setTheme, T, pin, sync, boards, settings }) {
  const [tab, setTab] = useState("display");

  const tabStyle = (id) => ({
    padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer",
    border: "none", background: "none",
    color: tab === id ? "#6366F1" : T.subtext,
    borderBottom: tab === id ? "2px solid #6366F1" : "2px solid transparent",
    fontFamily: "inherit",
    flexShrink: 0,
  });

  return (
    <div style={{ background: T.panel, borderRadius: 16, padding: 16, boxShadow: `0 4px 20px ${T.shadow}` }}>
      <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>⚙️ Settings</div>

      <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 18, overflowX: "auto" }}>
        <button style={tabStyle("display")} onClick={() => setTab("display")}>📐 Display</button>
        <button style={tabStyle("voice")}   onClick={() => setTab("voice")}>🔊 Voice</button>
        <button style={tabStyle("theme")}   onClick={() => setTab("theme")}>🎨 Theme</button>
        <button style={tabStyle("pin")}     onClick={() => setTab("pin")}>🔒 PIN Lock</button>
        <button style={tabStyle("sync")}    onClick={() => setTab("sync")}>☁️ Sync</button>
      </div>

      {tab === "display" && (
        <>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.subtext, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, display: "block" }}>Icon Size</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontWeight: 900 }}>A</span>
            <input type="range" min={70} max={350} step={5} value={tileSize}
              onChange={(e) => setTileSize(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#6366F1", cursor: "pointer" }}
            />
            <span style={{ fontWeight: 900, fontSize: 26 }}>A</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[{ l: "XS", v: 80 }, { l: "S", v: 108 }, { l: "M", v: 140 }, { l: "L", v: 190 }, { l: "XL", v: 250 }, { l: "XXL", v: 320 }].map(({ l, v }) => (
              <button key={l} onClick={() => setTileSize(v)} style={{ flex: 1, minWidth: 46, padding: "8px 4px", border: `2px solid ${tileSize === v ? "#6366F1" : T.border}`, borderRadius: 10, background: tileSize === v ? "#EEF2FF" : T.bg, color: tileSize === v ? "#6366F1" : T.text, fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: T.subtext, marginTop: 10, background: `${T.border}55`, borderRadius: 8, padding: "6px 10px" }}>
            💡 XL & XXL ideal for low vision or limited motor control.
          </div>
        </>
      )}

      {tab === "voice" && VOICES.map((v) => (
        <div key={v.id} onClick={() => setSelectedVoice(v)} style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderRadius: 12, border: `2px solid ${selectedVoice.id === v.id ? "#6366F1" : T.border}`, background: selectedVoice.id === v.id ? "#EEF2FF" : T.bg, cursor: "pointer", marginBottom: 8, gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: selectedVoice.id === v.id ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🔊</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{v.label}</div>
            <div style={{ fontSize: 12, color: T.subtext }}>{v.description}</div>
          </div>
          <button style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", border: "none", borderRadius: 8, padding: "5px 11px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
            onClick={(e) => { e.stopPropagation(); const u = new SpeechSynthesisUtterance(`Hi, I'm ${v.label}`); u.pitch = v.pitch; u.rate = v.rate; window.speechSynthesis?.speak(u); }}>
            ▶ Test
          </button>
        </div>
      ))}

      {tab === "theme" && (
        <div style={{ display: "flex", gap: 8 }}>
          {[{ id: "light", label: "☀️ Light" }, { id: "dark", label: "🌙 Dark" }, { id: "highcontrast", label: "⬛ High Contrast" }].map((t) => (
            <button key={t.id} onClick={() => setTheme(t.id)} style={{ flex: 1, padding: "14px 8px", borderRadius: 12, border: `2px solid ${theme === t.id ? "#6366F1" : T.border}`, background: t.id === "light" ? "#F8F7FF" : t.id === "dark" ? "#0F0F1A" : "#000", color: t.id === "light" ? "#1A1A2E" : "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{t.label.split(" ")[0]}</div>
              {t.label.split(" ").slice(1).join(" ")}
            </button>
          ))}
        </div>
      )}

      {tab === "pin"  && <PINSettings T={T} pin={pin} />}
      {tab === "sync" && <SyncSettings T={T} sync={sync} boards={boards} settings={{ tileSize, selectedVoice, theme }} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SyncSettings
// ─────────────────────────────────────────────────────────────
function SyncSettings({ T, sync, boards, settings }) {
  const [pullCode,    setPullCode]    = useState("");
  const [pullSuccess, setPullSuccess] = useState(false);
  const [copied,      setCopied]      = useState(false);

  const syncCode = sync.getSyncCode();

  const handlePush = async () => {
    await sync.pushAll(boards, settings);
  };

  const handlePull = async () => {
    if (pullCode.length < 6) return;
    const result = await sync.pullAll(pullCode);
    if (result) {
      setPullSuccess(true);
      setTimeout(() => setPullSuccess(false), 3000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(syncCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const label   = { fontSize: 11, fontWeight: 700, color: T.subtext, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, display: "block" };
  const infoBox = (text) => (
    <div style={{ fontSize: 13, color: T.subtext, lineHeight: 1.55, marginBottom: 16, background: `${T.border}44`, borderRadius: 10, padding: "10px 12px" }}>
      {text}
    </div>
  );
  const primaryBtn = (bg = "#6366F1") => ({
    padding: "11px 18px", borderRadius: 12, border: "none",
    background: bg, color: "#fff", fontWeight: 700, fontSize: 14,
    cursor: "pointer", fontFamily: "inherit",
  });

  return (
    <div>
      <span style={label}>☁️ Cloud Sync</span>
      {infoBox("Sync your boards and settings across multiple iPads. Use your sync code on another device to pull your data.")}

      {/* ── Your sync code ──────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <span style={label}>Your Sync Code</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            flex: 1, padding: "14px 16px", borderRadius: 12,
            border: `2px solid ${T.border}`,
            background: T.bg, color: T.text,
            fontSize: 28, fontWeight: 900, letterSpacing: 8,
            textAlign: "center", fontFamily: "monospace",
          }}>
            {syncCode}
          </div>
          <button onClick={handleCopy} style={{ ...primaryBtn(), padding: "14px 16px", fontSize: 18, background: copied ? "#10B981" : "#6366F1" }}>
            {copied ? "✓" : "📋"}
          </button>
        </div>
        <div style={{ fontSize: 11, color: T.subtext, marginTop: 6 }}>
          Share this code with another device to sync your data.
        </div>
      </div>

      {/* ── Push ────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <span style={label}>Upload to Cloud</span>
        <div style={{ fontSize: 13, color: T.subtext, marginBottom: 10 }}>
          Push your current boards and settings to the cloud so another device can download them.
        </div>
        <button
          onClick={handlePush}
          disabled={sync.syncing}
          style={{ ...primaryBtn(), width: "100%", padding: "12px 0", opacity: sync.syncing ? 0.6 : 1 }}
        >
          {sync.syncing ? "⏳ Syncing…" : "⬆️ Upload Now"}
        </button>
        {sync.lastSync && !sync.syncError && (
          <div style={{ fontSize: 11, color: "#10B981", marginTop: 6, fontWeight: 600 }}>
            ✅ Last synced: {sync.lastSync.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* ── Pull ────────────────────────────────────────── */}
      <div style={{ paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
        <span style={label}>Download from Cloud</span>
        <div style={{ fontSize: 13, color: T.subtext, marginBottom: 10 }}>
          Enter a sync code from another device to download its boards and settings.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Enter 6-char code"
            value={pullCode}
            onChange={(e) => setPullCode(e.target.value.toUpperCase().slice(0, 6))}
            onKeyDown={(e) => e.key === "Enter" && handlePull()}
            style={{
              flex: 1, padding: "11px 14px", borderRadius: 12,
              border: `2px solid ${T.border}`,
              background: T.bg, color: T.text,
              fontSize: 18, fontWeight: 900, letterSpacing: 6,
              fontFamily: "monospace", outline: "none",
              textTransform: "uppercase",
            }}
          />
          <button
            onClick={handlePull}
            disabled={sync.syncing || pullCode.length < 6}
            style={{ ...primaryBtn(), padding: "11px 18px", opacity: (sync.syncing || pullCode.length < 6) ? 0.5 : 1 }}
          >
            ⬇️
          </button>
        </div>

        {pullSuccess && (
          <div style={{ fontSize: 13, color: "#10B981", marginTop: 8, fontWeight: 700 }}>
            ✅ Data downloaded! Restart the app to see your boards.
          </div>
        )}
        {sync.syncError && (
          <div style={{ fontSize: 13, color: "#EF4444", marginTop: 8, fontWeight: 600 }}>
            ⚠️ {sync.syncError}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PINSettings
// ─────────────────────────────────────────────────────────────
function PINSettings({ T, pin }) {
  const [mode,  setMode]  = useState("idle");
  const [step1, setStep1] = useState("");
  const [step2, setStep2] = useState("");
  const [error, setError] = useState("");

  const enabled  = pin.isPINEnabled();
  const sanitise = (v) => v.replace(/\D/g, "").slice(0, 4);
  const reset    = () => { setMode("idle"); setStep1(""); setStep2(""); setError(""); };

  const label      = { fontSize: 11, fontWeight: 700, color: T.subtext, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, display: "block" };
  const pinInput   = { width: "100%", padding: "14px 0", borderRadius: 12, border: `2px solid ${T.border}`, fontSize: 32, letterSpacing: 16, textAlign: "center", background: T.bg, color: T.text, boxSizing: "border-box", outline: "none", fontFamily: "inherit" };
  const primaryBtn = { padding: "11px 22px", borderRadius: 12, border: "none", background: "#6366F1", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" };
  const dangerBtn  = { padding: "11px 22px", borderRadius: 12, border: "none", background: "#EF4444", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" };
  const ghostBtn   = { padding: "11px 22px", borderRadius: 12, border: `1px solid ${T.border}`, background: "transparent", color: T.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" };
  const btnRow     = { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" };
  const errStyle   = { color: "#EF4444", fontSize: 12, fontWeight: 600, marginTop: 8 };

  const verifyCurrentPIN = (candidate) => {
    if (!pin.checkPIN(candidate)) { setError("Incorrect PIN — try again"); setStep1(""); return; }
    setError(""); setStep1("");
    if (mode === "verify-change") setMode("change");
    if (mode === "verify-remove") setMode("confirm-remove");
  };

  const handleStep1Change = (val) => {
    const v = sanitise(val); setStep1(v); setError("");
    if ((mode === "verify-change" || mode === "verify-remove") && v.length === 4) setTimeout(() => verifyCurrentPIN(v), 100);
  };

  const handleSetNext    = () => { if (step1.length < 4) { setError("PIN must be exactly 4 digits"); return; } setMode("set-confirm"); setStep2(""); setError(""); };
  const handleSetSave    = () => { if (step1 !== step2) { setError("PINs don't match — try again"); setStep2(""); return; } pin.setPIN(step1); reset(); };
  const handleChangeNext = () => { if (step1.length < 4) { setError("PIN must be exactly 4 digits"); return; } setMode("change-confirm"); setStep2(""); setError(""); };
  const handleChangeSave = () => { if (step1 !== step2) { setError("PINs don't match — try again"); setStep2(""); return; } pin.setPIN(step1); reset(); };

  const infoBox = (text) => (
    <div style={{ fontSize: 13, color: T.subtext, lineHeight: 1.55, marginBottom: 16, background: `${T.border}44`, borderRadius: 10, padding: "10px 12px" }}>{text}</div>
  );

  return (
    <div>
      <span style={label}>Caregiver PIN Lock</span>

      {mode === "idle" && (
        <>
          {infoBox(enabled ? "🔒 PIN is active. My Boards, Builder, and Settings are locked for the app user." : "🔓 No PIN set. Add a 4-digit PIN to prevent the app user from accidentally changing settings or boards.")}
          <div style={btnRow}>
            {!enabled && <button style={primaryBtn} onClick={() => { setMode("set"); setStep1(""); setError(""); }}>Set PIN</button>}
            {enabled && (
              <>
                <button style={primaryBtn} onClick={() => { setMode("verify-change"); setStep1(""); setError(""); }}>Change PIN</button>
                <button style={dangerBtn}  onClick={() => { setMode("verify-remove"); setStep1(""); setError(""); }}>Remove PIN</button>
                {pin.isUnlocked && <button style={ghostBtn} onClick={() => pin.lock()}>🔒 Lock Now</button>}
              </>
            )}
          </div>
        </>
      )}

      {mode === "set" && (
        <>
          <p style={{ fontSize: 13, color: T.subtext, marginBottom: 10 }}>Enter a new 4-digit PIN:</p>
          <input type="password" inputMode="numeric" maxLength={4} placeholder="••••" autoFocus value={step1} onChange={(e) => { setStep1(sanitise(e.target.value)); setError(""); }} onKeyDown={(e) => e.key === "Enter" && handleSetNext()} style={pinInput} />
          {error && <p style={errStyle}>{error}</p>}
          <div style={btnRow}><button style={primaryBtn} onClick={handleSetNext}>Next →</button><button style={ghostBtn} onClick={reset}>Cancel</button></div>
        </>
      )}

      {mode === "set-confirm" && (
        <>
          <p style={{ fontSize: 13, color: T.subtext, marginBottom: 10 }}>Confirm your new PIN:</p>
          <input type="password" inputMode="numeric" maxLength={4} placeholder="••••" autoFocus value={step2} onChange={(e) => { setStep2(sanitise(e.target.value)); setError(""); }} onKeyDown={(e) => e.key === "Enter" && handleSetSave()} style={pinInput} />
          {error && <p style={errStyle}>{error}</p>}
          <div style={btnRow}><button style={primaryBtn} onClick={handleSetSave}>Save PIN ✓</button><button style={ghostBtn} onClick={reset}>Cancel</button></div>
        </>
      )}

      {(mode === "verify-change" || mode === "verify-remove") && (
        <>
          <p style={{ fontSize: 13, color: T.subtext, marginBottom: 10 }}>{mode === "verify-change" ? "Enter your current PIN to continue:" : "Enter your PIN to remove it:"}</p>
          <input type="password" inputMode="numeric" maxLength={4} placeholder="••••" autoFocus value={step1} onChange={(e) => handleStep1Change(e.target.value)} style={pinInput} />
          {error && <p style={errStyle}>{error}</p>}
          <div style={btnRow}><button style={ghostBtn} onClick={reset}>Cancel</button></div>
        </>
      )}

      {mode === "change" && (
        <>
          <p style={{ fontSize: 13, color: T.subtext, marginBottom: 10 }}>Enter your new 4-digit PIN:</p>
          <input type="password" inputMode="numeric" maxLength={4} placeholder="••••" autoFocus value={step1} onChange={(e) => { setStep1(sanitise(e.target.value)); setError(""); }} onKeyDown={(e) => e.key === "Enter" && handleChangeNext()} style={pinInput} />
          {error && <p style={errStyle}>{error}</p>}
          <div style={btnRow}><button style={primaryBtn} onClick={handleChangeNext}>Next →</button><button style={ghostBtn} onClick={reset}>Cancel</button></div>
        </>
      )}

      {mode === "change-confirm" && (
        <>
          <p style={{ fontSize: 13, color: T.subtext, marginBottom: 10 }}>Confirm your new PIN:</p>
          <input type="password" inputMode="numeric" maxLength={4} placeholder="••••" autoFocus value={step2} onChange={(e) => { setStep2(sanitise(e.target.value)); setError(""); }} onKeyDown={(e) => e.key === "Enter" && handleChangeSave()} style={pinInput} />
          {error && <p style={errStyle}>{error}</p>}
          <div style={btnRow}><button style={primaryBtn} onClick={handleChangeSave}>Save New PIN ✓</button><button style={ghostBtn} onClick={reset}>Cancel</button></div>
        </>
      )}

      {mode === "confirm-remove" && (
        <>
          {infoBox("Removing the PIN means anyone using the device can access Settings and the Builder. Are you sure?")}
          <div style={btnRow}>
            <button style={dangerBtn} onClick={() => { pin.removePIN(); reset(); }}>Yes, Remove PIN</button>
            <button style={ghostBtn}  onClick={reset}>Cancel</button>
          </div>
        </>
      )}
    </div>
  );
}
