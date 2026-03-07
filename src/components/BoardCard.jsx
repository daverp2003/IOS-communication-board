export default function BoardCard({ board, T, onLoad, onEdit, onDelete }) {
  const previewSymbols = Object.values(board.cells).slice(0, 6);

  return (
    <div style={{
      background: T.panel, borderRadius: 16, overflow: "hidden",
      boxShadow: `0 4px 20px ${T.shadow}`,
      border: `1px solid ${T.border}`,
    }}>
      {/* Header */}
      <div style={{ background: `${board.color}22`, borderBottom: `2px solid ${board.color}44`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 28 }}>{board.emoji}</span>
        <div>
          <div style={{ fontWeight: 900, fontSize: 15, color: T.text }}>{board.name}</div>
          <div style={{ fontSize: 11, color: T.subtext, marginTop: 2 }}>
            {Object.keys(board.cells).length} symbols · {board.gridSize.label} grid
          </div>
        </div>
      </div>

      {/* Symbol preview */}
      <div style={{ padding: "10px 14px", display: "flex", gap: 6, flexWrap: "wrap", minHeight: 54 }}>
        {previewSymbols.map((sym, i) => (
          <div key={i} style={{
            width: 40, height: 40, background: `${sym.color}22`,
            border: `1.5px solid ${sym.color}55`,
            borderRadius: 8, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 1,
          }}>
            <span style={{ fontSize: 18 }}>{sym.emoji}</span>
            <span style={{ fontSize: 7, fontWeight: 800, color: T.subtext, textAlign: "center", maxWidth: 36, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{sym.label}</span>
          </div>
        ))}
        {Object.keys(board.cells).length > 6 && (
          <div style={{ width: 40, height: 40, background: T.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: T.subtext }}>
            +{Object.keys(board.cells).length - 6}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: "10px 14px", display: "flex", gap: 8, borderTop: `1px solid ${T.border}` }}>
        <button onClick={onLoad} style={{ flex: 2, background: `linear-gradient(135deg,${board.color},${board.color}bb)`, color: "#fff", border: "none", borderRadius: 10, padding: "8px 0", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
          Open
        </button>
        <button onClick={onEdit} style={{ flex: 1, background: T.bg, color: T.text, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          ✏️ Edit
        </button>
        <button onClick={onDelete} style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FCA5A5", borderRadius: 10, padding: "8px 10px", fontSize: 13, cursor: "pointer" }}>
          🗑️
        </button>
      </div>
    </div>
  );
}
