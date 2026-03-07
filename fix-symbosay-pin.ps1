# =============================================================
#  fix-symbosay-pin.ps1
#  SymboSay — Feature: Caregiver PIN Lock
#
#  What this does:
#    • Creates src/hooks/usePIN.js
#    • Creates src/components/PINLock.jsx  (animated PIN-pad modal)
#    • Patches  src/components/App.jsx     (intercepts tab navigation)
#    • Patches  src/components/Settings.jsx (PIN setup / change / remove UI)
#
#  Usage:
#    1. Place this file in your symbosay project root
#    2. powershell -ExecutionPolicy Bypass -File fix-symbosay-pin.ps1
#    3. npm start  (test locally)
#    4. git add . && git commit -m "feat: caregiver PIN lock" && git push
# =============================================================

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$src  = Join-Path $root "src"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SymboSay — Caregiver PIN Lock           " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ── helpers ──────────────────────────────────────────────────
function Patch-File($path, $anchor, $insertion, $label) {
    $content = Get-Content $path -Raw
    if ($content -match [regex]::Escape($anchor)) {
        $content = $content.Replace($anchor, $anchor + $insertion)
        Set-Content $path $content -Encoding UTF8 -NoNewline
        Write-Host "  ✅  Patched $label" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️   Could not auto-patch $label — see MANUAL NOTE below" -ForegroundColor Yellow
    }
}

# ── 1. usePIN.js ──────────────────────────────────────────────
$usePINPath = Join-Path $src "hooks\usePIN.js"

Set-Content $usePINPath -Encoding UTF8 -Value @'
import { useState, useCallback, useRef } from "react";

const PIN_KEY = "symbosay_pin";
const AUTO_LOCK_MS = 10 * 60 * 1000; // 10 minutes

export function usePIN() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Is a PIN currently set?
  const isPINEnabled = useCallback(
    () => !!localStorage.getItem(PIN_KEY),
    []
  );

  // Verify a candidate PIN; returns true/false
  const checkPIN = useCallback((candidate) => {
    return candidate === localStorage.getItem(PIN_KEY);
  }, []);

  // Save a new PIN and immediately unlock
  const setPIN = useCallback((pin) => {
    localStorage.setItem(PIN_KEY, pin);
    setIsUnlocked(true);
    clearTimer();
    timerRef.current = setTimeout(() => setIsUnlocked(false), AUTO_LOCK_MS);
  }, []);

  // Unlock after a successful PIN entry (called by PINLock modal)
  const unlock = useCallback(() => {
    setIsUnlocked(true);
    clearTimer();
    timerRef.current = setTimeout(() => setIsUnlocked(false), AUTO_LOCK_MS);
  }, []);

  // Remove PIN entirely
  const removePIN = useCallback(() => {
    localStorage.removeItem(PIN_KEY);
    setIsUnlocked(false);
    clearTimer();
  }, []);

  // Manual lock (e.g. caregiver hands device back to user)
  const lock = useCallback(() => {
    setIsUnlocked(false);
    clearTimer();
  }, []);

  return { isPINEnabled, checkPIN, setPIN, unlock, removePIN, lock, isUnlocked };
}
'@

Write-Host "  ✅  Created src/hooks/usePIN.js" -ForegroundColor Green


# ── 2. PINLock.jsx ────────────────────────────────────────────
$pinLockPath = Join-Path $src "components\PINLock.jsx"

Set-Content $pinLockPath -Encoding UTF8 -Value @'
import { useState } from "react";

// Theme colour tokens
const T = {
  light:          { bg:"#ffffff", card:"#f9fafb", fg:"#1a1a2e", sub:"rgba(26,26,46,0.55)", btn:"#f3f4f6", accent:"#6366f1", err:"#ef4444" },
  dark:           { bg:"rgba(0,0,0,0.85)", card:"#1a1a2e", fg:"#ffffff", sub:"rgba(255,255,255,0.55)", btn:"#2d2d4e", accent:"#818cf8", err:"#f87171" },
  "high-contrast":{ bg:"rgba(0,0,0,0.92)", card:"#111111", fg:"#ffffff", sub:"rgba(255,255,255,0.6)",  btn:"#222222", accent:"#facc15", err:"#f87171" },
};

/**
 * PINLock — full-screen overlay PIN-pad modal.
 *
 * Props:
 *   theme      — "light" | "dark" | "high-contrast"   (default "light")
 *   onSuccess  — called when the correct PIN is entered
 *   onCancel   — called when Cancel is pressed (pass null to hide Cancel)
 */
export default function PINLock({ onSuccess, onCancel, theme = "light" }) {
  const [entered, setEntered] = useState("");
  const [shake,   setShake]   = useState(false);
  const [error,   setError]   = useState("");

  const c = T[theme] ?? T.light;

  // ── handle digit / backspace ──────────────────────────────
  const handleDigit = (d) => {
    if (entered.length >= 4) return;
    const next = entered + d;
    setEntered(next);
    setError("");

    if (next.length === 4) {
      setTimeout(() => {
        const stored = localStorage.getItem("symbosay_pin");
        if (next === stored) {
          setEntered("");
          onSuccess();
        } else {
          setShake(true);
          setError("Incorrect PIN — try again");
          setEntered("");
          setTimeout(() => setShake(false), 500);
        }
      }, 150);
    }
  };

  const handleBack = () => { setEntered((e) => e.slice(0, -1)); setError(""); };

  // ── keypad layout ─────────────────────────────────────────
  const keys = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  // ── styles ────────────────────────────────────────────────
  const overlay = {
    position:"fixed", inset:0,
    background: c.bg,
    display:"flex", alignItems:"center", justifyContent:"center",
    zIndex:9999,
  };
  const card = {
    background:c.card, color:c.fg,
    borderRadius:24, padding:"36px 28px",
    width:300, maxWidth:"90vw",
    boxShadow:"0 24px 64px rgba(0,0,0,0.45)",
    animation: shake ? "pinShake 0.42s" : "none",
  };
  const dotStyle = (filled) => ({
    width:16, height:16, borderRadius:"50%",
    background: filled ? c.accent : "transparent",
    border:`2px solid ${filled ? c.accent : c.fg}`,
    transition:"background 0.15s",
  });
  const keyBtn = (k) => ({
    padding:"17px 0",
    fontSize: k === "⌫" ? 22 : 24,
    fontWeight:700,
    background: k === "⌫" ? "transparent" : c.btn,
    color:c.fg, border:"none",
    borderRadius:14, cursor:"pointer",
    transition:"transform 0.08s, opacity 0.08s",
    WebkitTapHighlightColor:"transparent",
  });

  return (
    <div style={overlay}>
      <style>{`
        @keyframes pinShake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-10px)}
          40%{transform:translateX(10px)}
          60%{transform:translateX(-7px)}
          80%{transform:translateX(7px)}
        }
      `}</style>

      <div style={card}>
        {/* Header */}
        <div style={{textAlign:"center", marginBottom:28}}>
          <div style={{fontSize:40, marginBottom:8}}>🔒</div>
          <div style={{fontSize:20, fontWeight:800, letterSpacing:"-0.3px"}}>
            Caregiver Access
          </div>
          <div style={{fontSize:13, color:c.sub, marginTop:5}}>
            Enter your 4-digit PIN
          </div>
        </div>

        {/* Dots */}
        <div style={{display:"flex", justifyContent:"center", gap:16, marginBottom: error ? 10 : 28}}>
          {Array(4).fill(0).map((_,i) => (
            <div key={i} style={dotStyle(i < entered.length)} />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div style={{textAlign:"center", color:c.err, fontSize:13, marginBottom:14, fontWeight:500}}>
            {error}
          </div>
        )}

        {/* Keypad */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10}}>
          {keys.map((k, i) =>
            k === "" ? <div key={i} /> : (
              <button key={i}
                style={keyBtn(k)}
                onClick={() => k === "⌫" ? handleBack() : handleDigit(k)}
                onMouseDown={e  => e.currentTarget.style.transform = "scale(0.90)"}
                onMouseUp={e    => e.currentTarget.style.transform = "scale(1)"}
                onTouchStart={e => e.currentTarget.style.opacity   = "0.55"}
                onTouchEnd={e   => e.currentTarget.style.opacity   = "1"}
              >{k}</button>
            )
          )}
        </div>

        {/* Cancel */}
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              marginTop:20, width:"100%", padding:"11px 0",
              background:"transparent",
              border:`1px solid ${c.fg}2a`,
              borderRadius:12, color:c.fg, opacity:0.55,
              cursor:"pointer", fontSize:13, fontWeight:500,
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
'@

Write-Host "  ✅  Created src/components/PINLock.jsx" -ForegroundColor Green


# ── 3. Patch App.jsx ─────────────────────────────────────────
$appPath = Join-Path $src "components\App.jsx"
$app = Get-Content $appPath -Raw

$patched = $false

# 3a — Add imports (insert after the last 'import' line)
if ($app -notmatch "usePIN") {
    # Find the last import line and append after it
    $app = $app -replace '(import\s+\S[^\n]*\n)(?!\s*import)', @'
$1import { usePIN }  from "../hooks/usePIN";
import PINLock     from "./PINLock";
'@
    $patched = $true
}

# 3b — Inject hook + protected-tab state inside the App function body
#       (anchor: right after the opening brace of the default export function)
if ($app -notmatch "usePIN\(\)") {
    $app = $app -replace '(export default function App\s*\([^)]*\)\s*\{)', @'
$1
  // ── Caregiver PIN lock ──────────────────────────────────
  const pin = usePIN();
  const [pinModalFor, setPinModalFor] = React.useState(null);
  const PROTECTED = ["builder", "myboards", "settings"];
'@
    $patched = $true
}

# 3c — Wrap the tab-change handler or setActiveTab calls
#       Strategy A: named handler already exists
if ($app -match "const handleTabChange\s*=") {
    $app = $app -replace '(const handleTabChange\s*=\s*\([^)]*\)\s*=>\s*\{)', @'
$1
    if (PROTECTED.includes(tab) && pin.isPINEnabled() && !pin.isUnlocked) {
      setPinModalFor(tab);
      return;
    }
'@
    $patched = $true
}
#       Strategy B: no named handler — inline setActiveTab calls
elseif ($app -match "setActiveTab\(") {
    # Rename direct calls to a guarded helper
    $app = $app -replace '\bsetActiveTab\(([^)]+)\)', 'guardedTabChange($1)'
    # Inject the helper before the return()
    $app = $app -replace '(\n\s*return\s*\()', @'

  const guardedTabChange = (tab) => {
    if (PROTECTED.includes(tab) && pin.isPINEnabled() && !pin.isUnlocked) {
      setPinModalFor(tab);
      return;
    }
    setActiveTab(tab);
  };
$1
'@
    $patched = $true
}

# 3d — Add PINLock modal JSX just before the outermost closing </div>
if ($app -notmatch "<PINLock") {
    # Insert before the last </div> in the return block
    $app = $app -replace '([ \t]*</div>\s*\);\s*\}[\s\S]*$)', @'

      {/* Caregiver PIN modal */}
      {pinModalFor && (
        <PINLock
          theme={settings?.theme ?? "light"}
          onSuccess={() => {
            pin.unlock();
            setActiveTab(pinModalFor);
            setPinModalFor(null);
          }}
          onCancel={() => setPinModalFor(null)}
        />
      )}
$1
'@
    $patched = $true
}

if ($patched) {
    Set-Content $appPath $app -Encoding UTF8 -NoNewline
    Write-Host "  ✅  Patched src/components/App.jsx" -ForegroundColor Green
} else {
    Write-Host "  ⚠️   App.jsx — no changes needed (already patched?)" -ForegroundColor Yellow
}


# ── 4. Patch Settings.jsx ─────────────────────────────────────
$settingsPath = Join-Path $src "components\Settings.jsx"
$settings = Get-Content $settingsPath -Raw

# 4a — Add usePIN + PINLock imports
if ($settings -notmatch "usePIN") {
    $settings = $settings -replace '(import\s+\S[^\n]*\n)(?!\s*import)', @'
$1import { usePIN } from "../hooks/usePIN";
import PINLock    from "./PINLock";
'@
}

# 4b — Add React import alias if not present (needed for React.useState in sub-component)
if ($settings -notmatch 'import React') {
    $settings = "import React from `"react`";`n" + $settings
}

# 4c — Inject <PINSection /> just before the final </div> of the Settings return
if ($settings -notmatch "<PINSection") {
    $settings = $settings -replace '([ \t]*</div>\s*\);\s*\})', @'
        {/* ── Caregiver PIN Lock ─────────────────── */}
        <PINSection />
$1
'@
}

# 4d — Append the PINSection sub-component to the bottom of the file
if ($settings -notmatch "function PINSection") {
    $settings += @'


// ═══════════════════════════════════════════════════════════
//  PINSection — sub-component rendered inside Settings
// ═══════════════════════════════════════════════════════════
function PINSection() {
  const pin = usePIN();

  // mode: "idle" | "set" | "set-confirm" | "change-verify" | "change" | "change-confirm" | "remove-verify" | "remove-confirm"
  const [mode,       setMode]       = React.useState("idle");
  const [newPIN,     setNewPIN]     = React.useState("");
  const [confirmPIN, setConfirmPIN] = React.useState("");
  const [error,      setError]      = React.useState("");

  const enabled = pin.isPINEnabled();

  const reset = () => { setMode("idle"); setNewPIN(""); setConfirmPIN(""); setError(""); };

  // ── Shared styles ───────────────────────────────────────
  const label = {
    fontSize:12, fontWeight:700, opacity:0.55,
    textTransform:"uppercase", letterSpacing:"0.07em",
    marginBottom:6,
  };
  const numInput = {
    width:"100%", padding:"12px 16px", borderRadius:12,
    border:"1px solid rgba(128,128,128,0.25)",
    fontSize:28, letterSpacing:12, textAlign:"center",
    background:"transparent", color:"inherit", boxSizing:"border-box",
    outline:"none",
  };
  const btn = (bg, fg = "#fff") => ({
    padding:"10px 22px", borderRadius:12, border:"none",
    background:bg, color:fg, fontWeight:600,
    cursor:"pointer", fontSize:14,
  });
  const ghostBtn = {
    padding:"10px 22px", borderRadius:12,
    border:"1px solid rgba(128,128,128,0.25)",
    background:"transparent", color:"inherit",
    fontWeight:500, cursor:"pointer", fontSize:14,
  };
  const row = { display:"flex", gap:10, marginTop:14, flexWrap:"wrap" };
  const errMsg = { color:"#ef4444", fontSize:12, marginTop:6 };

  const sanitise = (v) => v.replace(/\D/g, "").slice(0, 4);

  // ── verify → proceed flows ───────────────────────────────
  const handleVerifySuccess = () => {
    if (mode === "change-verify") { setMode("change");  setNewPIN(""); setError(""); }
    if (mode === "remove-verify") { setMode("remove-confirm"); }
  };

  // ── set-PIN flow ─────────────────────────────────────────
  const handleSet = () => {
    if (mode === "set") {
      if (newPIN.length < 4) { setError("PIN must be exactly 4 digits"); return; }
      setMode("set-confirm"); setConfirmPIN(""); setError("");
    } else {
      if (newPIN !== confirmPIN) { setError("PINs do not match — try again"); setConfirmPIN(""); return; }
      pin.setPIN(newPIN);
      reset();
    }
  };

  // ── change-PIN flow ──────────────────────────────────────
  const handleChange = () => {
    if (mode === "change") {
      if (newPIN.length < 4) { setError("PIN must be exactly 4 digits"); return; }
      setMode("change-confirm"); setConfirmPIN(""); setError("");
    } else {
      if (newPIN !== confirmPIN) { setError("PINs do not match — try again"); setConfirmPIN(""); return; }
      pin.setPIN(newPIN);
      reset();
    }
  };

  // ── render: verification modal ───────────────────────────
  if (mode === "change-verify" || mode === "remove-verify") {
    return (
      <PINLock
        onSuccess={handleVerifySuccess}
        onCancel={reset}
      />
    );
  }

  return (
    <div style={{
      marginTop:32, paddingTop:24,
      borderTop:"1px solid rgba(128,128,128,0.18)",
    }}>
      <div style={label}>🔒 Caregiver PIN Lock</div>

      {/* ── IDLE state ─────────────────────────────────── */}
      {mode === "idle" && (
        <div>
          <p style={{fontSize:13, opacity:0.6, marginBottom:16, lineHeight:1.5}}>
            {enabled
              ? "PIN is active. Builder, My Boards, and Settings require the PIN to access."
              : "Prevent accidental changes by locking caregiver sections behind a 4-digit PIN."}
          </p>
          <div style={row}>
            {!enabled && (
              <button style={btn("#6366f1")} onClick={() => setMode("set")}>Set PIN</button>
            )}
            {enabled && (
              <>
                <button style={btn("#6366f1")} onClick={() => setMode("change-verify")}>Change PIN</button>
                <button style={btn("#ef4444")} onClick={() => setMode("remove-verify")}>Remove PIN</button>
                {!pin.isUnlocked && (
                  <span style={{fontSize:12, opacity:0.45, alignSelf:"center"}}>
                    (you are currently locked)
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── SET — enter new PIN ─────────────────────────── */}
      {(mode === "set" || mode === "set-confirm") && (
        <div>
          <p style={{fontSize:13, opacity:0.6, marginBottom:12}}>
            {mode === "set" ? "Enter a new 4-digit PIN:" : "Confirm your new PIN:"}
          </p>
          <input
            type="password" inputMode="numeric" maxLength={4}
            placeholder="••••" autoFocus
            value={mode === "set" ? newPIN : confirmPIN}
            onChange={e => mode === "set"
              ? setNewPIN(sanitise(e.target.value))
              : setConfirmPIN(sanitise(e.target.value))}
            onKeyDown={e => e.key === "Enter" && handleSet()}
            style={numInput}
          />
          {error && <p style={errMsg}>{error}</p>}
          <div style={row}>
            <button style={btn("#6366f1")} onClick={handleSet}>
              {mode === "set" ? "Next →" : "Save PIN ✓"}
            </button>
            <button style={ghostBtn} onClick={reset}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── CHANGE — enter new PIN ──────────────────────── */}
      {(mode === "change" || mode === "change-confirm") && (
        <div>
          <p style={{fontSize:13, opacity:0.6, marginBottom:12}}>
            {mode === "change" ? "Enter your new 4-digit PIN:" : "Confirm the new PIN:"}
          </p>
          <input
            type="password" inputMode="numeric" maxLength={4}
            placeholder="••••" autoFocus
            value={mode === "change" ? newPIN : confirmPIN}
            onChange={e => mode === "change"
              ? setNewPIN(sanitise(e.target.value))
              : setConfirmPIN(sanitise(e.target.value))}
            onKeyDown={e => e.key === "Enter" && handleChange()}
            style={numInput}
          />
          {error && <p style={errMsg}>{error}</p>}
          <div style={row}>
            <button style={btn("#6366f1")} onClick={handleChange}>
              {mode === "change" ? "Next →" : "Save New PIN ✓"}
            </button>
            <button style={ghostBtn} onClick={reset}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── REMOVE — confirm ────────────────────────────── */}
      {mode === "remove-confirm" && (
        <div>
          <p style={{fontSize:13, opacity:0.6, marginBottom:16, lineHeight:1.5}}>
            Remove the PIN? All sections will be accessible to everyone on this device.
          </p>
          <div style={row}>
            <button style={btn("#ef4444")} onClick={() => { pin.removePIN(); reset(); }}>
              Yes, Remove PIN
            </button>
            <button style={ghostBtn} onClick={reset}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
'@
}

Set-Content $settingsPath $settings -Encoding UTF8 -NoNewline
Write-Host "  ✅  Patched src/components/Settings.jsx" -ForegroundColor Green


# ── Done ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  🎉  Caregiver PIN Lock — COMPLETE!       " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "What was added:" -ForegroundColor Cyan
Write-Host "  • PINLock modal   — animated number pad, shake on wrong PIN" -ForegroundColor White
Write-Host "  • Auto-lock       — unlocks for 10 min, then re-locks" -ForegroundColor White
Write-Host "  • Protected tabs  — Builder, My Boards, Settings" -ForegroundColor White
Write-Host "  • Settings UI     — Set / Change / Remove PIN flows" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  npm start" -ForegroundColor White
Write-Host "  git add ." -ForegroundColor White
Write-Host '  git commit -m "feat: caregiver PIN lock"' -ForegroundColor White
Write-Host "  git push" -ForegroundColor White
Write-Host ""
Write-Host "MANUAL NOTE (only needed if ⚠️ warnings appeared above):" -ForegroundColor Magenta
Write-Host "  In App.jsx, wrap any call that changes the active tab like so:" -ForegroundColor White
Write-Host '  Before:  setActiveTab("settings")' -ForegroundColor DarkGray
Write-Host '  After:   guardedTabChange("settings")' -ForegroundColor DarkGray
Write-Host "  And add <PINLock> JSX + usePIN() hook as shown in the new files." -ForegroundColor DarkGray
Write-Host ""
