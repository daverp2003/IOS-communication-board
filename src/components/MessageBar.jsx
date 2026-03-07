export default function MessageBar({ message, speaking, onSpeak, onBackspace, onClear, T }) {
  return (
    <div style={{
      background: T.msgBg,
      border: `2px solid #C7D2FE`,
      borderRadius: 14,
      padding: "8px 12px",
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 8,
      minHeight: 54,
    }}>
      <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {message.length === 0
          ? <span style={{ color: T.subtext, fontSize: 13, fontStyle: "italic" }}>Tap symbols to build a message…</span>
          : message.map((s) => (
            <span key={s._key} style={{
              background: "#6366F1", color: "#fff", borderRadius: 20,
              padding: "3px 10px", fontSize: 13, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              {s.emoji} {s.label}
            </span>
          ))
        }
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          style={{ background: T.border, border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 15, color: T.text }}
          onClick={onBackspace}
        >⌫</button>
        <button
          style={{ background: T.border, border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 15, color: T.text }}
          onClick={onClear}
        >🗑️</button>
        <button
          disabled={message.length === 0}
          style={{
            background: speaking
              ? "linear-gradient(135deg,#F59E0B,#EF4444)"
              : "linear-gradient(135deg,#6366F1,#8B5CF6)",
            color: "#fff", border: "none", borderRadius: 10,
            padding: "7px 14px", fontWeight: 800, fontSize: 13,
            cursor: message.length === 0 ? "default" : "pointer",
            whiteSpace: "nowrap", opacity: message.length === 0 ? 0.5 : 1,
          }}
          onClick={onSpeak}
        >
          {speaking ? "⏹ Stop" : "▶ Speak"}
        </button>
      </div>
    </div>
  );
}
