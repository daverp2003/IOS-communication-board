import { useState } from "react";

export default function SettingsView({ tileSize, setTileSize, theme, setTheme, T, pin, sync, boards, settings, speech, onPullSuccess, lastLocalUpdate, conflictPending, setConflictPending, isOnline, scanEnabled, setScanEnabled, scanInterval, setScanInterval }) {
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
        <button style={tabStyle("access")}  onClick={() => setTab("access")}>♿ Access</button>
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

      {tab === "voice" && <VoiceSettings T={T} speech={speech} />}

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

      {tab === "pin"    && <PINSettings T={T} pin={pin} />}
      {tab === "sync"   && <SyncSettings T={T} sync={sync} boards={boards} settings={{ tileSize, theme }} onPullSuccess={onPullSuccess} lastLocalUpdate={lastLocalUpdate} conflictPending={conflictPending} setConflictPending={setConflictPending} isOnline={isOnline} />}
      {tab === "access" && <AccessSettings T={T} scanEnabled={scanEnabled} setScanEnabled={setScanEnabled} scanInterval={scanInterval} setScanInterval={setScanInterval} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SyncSettings
// ─────────────────────────────────────────────────────────────
function SyncSettings({ T, sync, boards, settings, onPullSuccess, lastLocalUpdate, conflictPending, setConflictPending, isOnline }) {
  const [pullCode,       setPullCode]       = useState("");
  const [pullSuccess,    setPullSuccess]    = useState(false);
  const [copied,         setCopied]         = useState(false);
  const [pendingResult,  setPendingResult]  = useState(null); // holds data during conflict review

  const syncCode = sync.getSyncCode();

  const handlePush = async () => {
    await sync.pushAll(boards, settings);
  };

  const handlePull = async () => {
    if (pullCode.length < 8) return;
    const result = await sync.pullAll(pullCode);
    if (!result) return;

    // Conflict check — does remote have boards newer than our local data?
    const hasConflict = await sync.checkConflict(lastLocalUpdate);
    if (hasConflict && boards.length > 0) {
      setPendingResult(result);
      setConflictPending(true);
    } else {
      onPullSuccess?.(result.boards, result.settings);
      setPullSuccess(true);
      setTimeout(() => setPullSuccess(false), 3000);
    }
  };

  const handleConflictMerge = () => {
    if (pendingResult) onPullSuccess?.(pendingResult.boards, pendingResult.settings);
    setPendingResult(null);
    setPullSuccess(true);
    setTimeout(() => setPullSuccess(false), 3000);
  };

  const handleConflictKeepLocal = () => {
    setPendingResult(null);
    setConflictPending(false);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(syncCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const label      = { fontSize: 11, fontWeight: 700, color: T.subtext, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, display: "block" };
  const infoBox    = (text) => (
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

      {/* Offline notice */}
      {!isOnline && (
        <div style={{ background: "#1F2937", borderRadius: 10, padding: "10px 12px", marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: "#F9FAFB", fontWeight: 600 }}>
            📡 You're offline — sync is unavailable right now.
          </span>
        </div>
      )}

      {/* Auto-sync status */}
      {sync.lastSync && !sync.syncError && (
        <div style={{ fontSize: 12, color: "#10B981", fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 5 }}>
          <span>✅</span>
          <span>Auto-synced at {sync.lastSync.toLocaleTimeString()}</span>
        </div>
      )}

      {infoBox("Boards auto-upload 30 seconds after any change. Use your sync code on another device to download your boards.")}

      {/* ── Your sync code ──────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <span style={label}>Your Sync Code</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            flex: 1, padding: "14px 16px", borderRadius: 12,
            border: `2px solid ${T.border}`,
            background: T.bg, color: T.text,
            fontSize: 22, fontWeight: 900, letterSpacing: 6,
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

      {/* ── Manual push ─────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <span style={label}>Upload Now</span>
        <button
          onClick={handlePush}
          disabled={sync.syncing || !isOnline}
          style={{ ...primaryBtn(), width: "100%", padding: "12px 0", opacity: (sync.syncing || !isOnline) ? 0.5 : 1 }}
        >
          {sync.syncing ? "⏳ Syncing…" : "⬆️ Upload Now"}
        </button>
      </div>

      {/* ── Conflict resolution ──────────────────────────── */}
      {conflictPending && pendingResult && (
        <div style={{
          background: "#FFFBEB", border: "2px solid #FDE68A",
          borderRadius: 12, padding: 16, marginBottom: 20,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#92400E", marginBottom: 8 }}>
            ⚠️ Conflict detected
          </div>
          <div style={{ fontSize: 13, color: "#78350F", lineHeight: 1.5, marginBottom: 12 }}>
            The downloaded data has boards that are newer than some of your local boards.
            Merging will update your local boards with the newer remote versions while keeping anything that's newer locally.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleConflictMerge}      style={{ ...primaryBtn("#10B981"), flex: 1 }}>Merge (recommended)</button>
            <button onClick={handleConflictKeepLocal}  style={{ ...primaryBtn("#6B7280"), flex: 1 }}>Keep local only</button>
          </div>
        </div>
      )}

      {/* ── Pull ────────────────────────────────────────── */}
      <div style={{ paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
        <span style={label}>Download from Another Device</span>
        <div style={{ fontSize: 13, color: T.subtext, marginBottom: 10 }}>
          Enter the 8-character sync code from another device.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Enter 8-char code"
            value={pullCode}
            onChange={(e) => setPullCode(e.target.value.toUpperCase().slice(0, 8))}
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
            disabled={sync.syncing || pullCode.length < 8 || !isOnline}
            style={{ ...primaryBtn(), padding: "11px 18px", opacity: (sync.syncing || pullCode.length < 8 || !isOnline) ? 0.5 : 1 }}
          >
            ⬇️
          </button>
        </div>

        {pullSuccess && (
          <div style={{ fontSize: 13, color: "#10B981", marginTop: 8, fontWeight: 700 }}>
            ✅ Data downloaded and applied!
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
//  VoiceSettings — shows real device voices
// ─────────────────────────────────────────────────────────────
function VoiceSettings({ T, speech }) {
  const { voices, voiceReady, setVoiceByName, selectedVoiceRef, speak } = speech;
  const [selected, setSelected] = useState(selectedVoiceRef.current?.name || "");
  const [testing,  setTesting]  = useState(null);

  const handleSelect = (name) => {
    setSelected(name);
    setVoiceByName(name);
  };

  const handleTest = (e, v) => {
    e.stopPropagation();
    setTesting(v.name);
    speak(`Hello, my name is ${v.name.split(" ")[0]}. I can help you communicate.`, { pitch: 1, rate: 0.95 });
    setTimeout(() => setTesting(null), 3000);
  };

  if (!voiceReady) return (
    <div style={{ textAlign: "center", padding: 32, color: T.subtext }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🔊</div>
      <div style={{ fontWeight: 700 }}>Loading voices…</div>
    </div>
  );

  if (!voices.length) return (
    <div style={{ padding: 16, background: `${T.border}44`, borderRadius: 12, color: T.subtext, fontSize: 13, lineHeight: 1.6 }}>
      ⚠️ No voices found on this device. Make sure your device has text-to-speech voices installed in your system settings.
    </div>
  );

  return (
    <div>
      <div style={{ fontSize: 12, color: T.subtext, marginBottom: 12, background: `${T.border}44`, borderRadius: 10, padding: "8px 12px", lineHeight: 1.5 }}>
        🎙️ These are the real voices installed on your device. Tap a voice to select it, then tap ▶ Test to hear it.
      </div>
      {voices.map((v) => {
        const active = selected === v.name || (!selected && selectedVoiceRef.current?.name === v.name);
        return (
          <div key={v.name} onClick={() => handleSelect(v.name)}
            style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderRadius: 12, border: `2px solid ${active ? "#6366F1" : T.border}`, background: active ? "#EEF2FF" : T.bg, cursor: "pointer", marginBottom: 8, gap: 12, touchAction: "manipulation" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: active ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {active ? "✓" : "🔊"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: active ? "#6366F1" : T.text }}>{v.name}</div>
              <div style={{ fontSize: 11, color: T.subtext }}>{v.lang}{v.localService ? " · On-device" : " · Network"}</div>
            </div>
            <button
              onClick={(e) => handleTest(e, v)}
              style={{ background: testing === v.name ? "#10B981" : "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", border: "none", borderRadius: 8, padding: "5px 11px", fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0, touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
              {testing === v.name ? "…" : "▶ Test"}
            </button>
          </div>
        );
      })}
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

  const verifyCurrentPIN = async (candidate) => {
    const ok = await pin.checkPIN(candidate);
    if (!ok) { setError("Incorrect PIN — try again"); setStep1(""); return; }
    setError(""); setStep1("");
    if (mode === "verify-change") setMode("change");
    if (mode === "verify-remove") setMode("confirm-remove");
  };

  const handleStep1Change = (val) => {
    const v = sanitise(val); setStep1(v); setError("");
    if ((mode === "verify-change" || mode === "verify-remove") && v.length === 4) setTimeout(() => verifyCurrentPIN(v), 100);
  };

  const handleSetNext    = () => { if (step1.length < 4) { setError("PIN must be exactly 4 digits"); return; } setMode("set-confirm"); setStep2(""); setError(""); };
  const handleSetSave    = async () => { if (step1 !== step2) { setError("PINs don't match — try again"); setStep2(""); return; } await pin.setPIN(step1); reset(); };
  const handleChangeNext = () => { if (step1.length < 4) { setError("PIN must be exactly 4 digits"); return; } setMode("change-confirm"); setStep2(""); setError(""); };
  const handleChangeSave = async () => { if (step1 !== step2) { setError("PINs don't match — try again"); setStep2(""); return; } await pin.setPIN(step1); reset(); };

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


// ─────────────────────────────────────────────────────────────
//  AccessSettings — switch scanning + keyboard nav info
// ─────────────────────────────────────────────────────────────
function AccessSettings({ T, scanEnabled, setScanEnabled, scanInterval, setScanInterval }) {
  const label    = { fontSize: 11, fontWeight: 700, color: T.subtext, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, display: "block" };
  const infoBox  = (text) => (
    <div style={{ fontSize: 13, color: T.subtext, lineHeight: 1.55, marginBottom: 16, background: `${T.border}44`, borderRadius: 10, padding: "10px 12px" }}>
      {text}
    </div>
  );

  return (
    <div>
      <span style={label}>♿ Accessibility</span>

      {/* Switch scanning */}
      <div style={{ marginBottom: 24 }}>
        <span style={label}>Switch Scanning</span>
        {infoBox("Automatically highlights tiles one by one. Press Space, Enter, or your connected switch to select the highlighted tile.")}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Enable switch scanning</span>
          <button
            onClick={() => setScanEnabled((v) => !v)}
            style={{
              width: 52, height: 28, borderRadius: 14, border: "none",
              background: scanEnabled ? "#6366F1" : T.border,
              cursor: "pointer", position: "relative", transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <div style={{
              position: "absolute", top: 3,
              left: scanEnabled ? 26 : 3,
              width: 22, height: 22, borderRadius: "50%",
              background: "#fff",
              transition: "left 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }} />
          </button>
        </div>

        {scanEnabled && (
          <div>
            <span style={label}>Scan speed: {(scanInterval / 1000).toFixed(1)}s per tile</span>
            <input
              type="range" min={500} max={5000} step={250}
              value={scanInterval}
              onChange={(e) => setScanInterval(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#6366F1", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.subtext, marginTop: 4 }}>
              <span>Fast (0.5s)</span><span>Slow (5s)</span>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard navigation info */}
      <div style={{ paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
        <span style={label}>Keyboard Navigation</span>
        {infoBox("On the symbol board: use Arrow keys to move between tiles, Enter or Space to select. PIN screen supports number keys and Backspace.")}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", fontSize: 13 }}>
          {[["↑↓←→", "Move between tiles"], ["Enter / Space", "Select tile or activate scan switch"], ["Ctrl+Z", "Undo last change in builder"], ["Ctrl+Y", "Redo in builder"]].map(([k, v]) => (
            <>
              <span key={k} style={{ fontFamily: "monospace", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, padding: "2px 6px", fontWeight: 700, color: T.text, whiteSpace: "nowrap", alignSelf: "start" }}>{k}</span>
              <span key={v} style={{ color: T.subtext, alignSelf: "center" }}>{v}</span>
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
