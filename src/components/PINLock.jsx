import { useState } from "react";

/**
 * PINLock — full-screen PIN-pad overlay.
 *
 * Props:
 *   T          — theme object (supports both config.js and styles/theme.js shapes)
 *   onSuccess  — called when correct PIN is entered
 *   onCancel   — called when Cancel is tapped (omit to hide Cancel button)
 *   checkPIN   — optional (pin) => bool function; falls back to localStorage if omitted
 */
export default function PINLock({ T, onSuccess, onCancel, checkPIN }) {
  const [entered, setEntered] = useState("");
  const [shake,   setShake]   = useState(false);
  const [error,   setError]   = useState("");

  // FIX 1: Support both config.js T shape (panel/subtext/bg) and styles/theme.js shape (surface/textSub/surfaceAlt)
  const surface    = T.panel      ?? T.surface    ?? "#fff";
  const surfaceAlt = T.bg         ?? T.surfaceAlt ?? "#f3f4f6";
  const textSub    = T.subtext    ?? T.textSub    ?? "#6b7280";
  const primary    = T.primary    ?? "#6366F1";
  const text       = T.text       ?? "#1a1a2e";
  const border     = T.border     ?? "#e5e7eb";

  const handleDigit = (d) => {
    if (entered.length >= 4) return;
    const next = entered + d;
    setEntered(next);
    setError("");

    if (next.length === 4) {
      setTimeout(() => {
        // FIX 7: Use checkPIN prop if provided, else fall back to localStorage
        const correct = checkPIN
          ? checkPIN(next)
          : next === localStorage.getItem("symbosay_caregiver_pin");

        if (correct) {
          setEntered("");
          onSuccess();
        } else {
          setShake(true);
          setError("Incorrect PIN — try again");
          setEntered("");
          setTimeout(() => setShake(false), 450);
        }
      }, 120);
    }
  };

  const handleBack = () => {
    setEntered((e) => e.slice(0, -1));
    setError("");
  };

  const keys = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.72)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999,
      backdropFilter: "blur(6px)",
    }}>
      <style>{`
        @keyframes pinShake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-10px); }
          40%      { transform: translateX(10px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
        @keyframes pinPop {
          from { transform: scale(0.88); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .pin-card { animation: pinPop 0.22s cubic-bezier(0.34,1.56,0.64,1) both; }
        .pin-card.shaking { animation: pinShake 0.45s ease; }
      `}</style>

      <div
        className={`pin-card${shake ? " shaking" : ""}`}
        style={{
          background: surface,
          borderRadius: 24,
          padding: "32px 24px 28px",
          width: 300,
          maxWidth: "90vw",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          border: `1px solid ${border}`,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: `linear-gradient(135deg, ${primary}, #8B5CF6)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, margin: "0 auto 12px",
          }}>🔒</div>
          <div style={{ fontWeight: 900, fontSize: 18, color: text }}>
            Caregiver Access
          </div>
          <div style={{ fontSize: 13, color: textSub, marginTop: 4 }}>
            Enter your 4-digit PIN
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: error ? 10 : 24 }}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: "50%",
              background: i < entered.length ? primary : "transparent",
              border: `2.5px solid ${i < entered.length ? primary : border}`,
              transition: "background 0.15s, border-color 0.15s",
            }} />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            textAlign: "center", color: "#EF4444",
            fontSize: 12, fontWeight: 600, marginBottom: 14,
          }}>
            {error}
          </div>
        )}

        {/* Keypad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {keys.map((k, i) =>
            k === "" ? <div key={i} /> : (
              <button
                key={i}
                onClick={() => k === "⌫" ? handleBack() : handleDigit(k)}
                style={{
                  padding: "16px 0",
                  fontSize: k === "⌫" ? 20 : 22,
                  fontWeight: 800,
                  background: k === "⌫" ? "transparent" : surfaceAlt,
                  color: text,
                  border: `1px solid ${border}`,
                  borderRadius: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "transform 0.08s",
                  WebkitTapHighlightColor: "transparent",
                }}
                onPointerDown={(e) => e.currentTarget.style.transform = "scale(0.90)"}
                onPointerUp={(e)   => e.currentTarget.style.transform = "scale(1)"}
                onPointerLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                {k}
              </button>
            )
          )}
        </div>

        {/* Cancel */}
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              marginTop: 16, width: "100%", padding: "11px 0",
              background: "transparent",
              border: `1px solid ${border}`,
              borderRadius: 12, color: textSub,
              cursor: "pointer", fontSize: 13, fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
