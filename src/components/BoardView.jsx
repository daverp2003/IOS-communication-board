import SymbolTile from "./SymbolTile";
import { CATEGORIES } from "../constants/config";

export default function BoardView({ symbols, activeCategory, setActiveCategory, searchQuery, setSearchQuery, tileSize, activeBoard, T, theme }) {
  const sz = {
    tile: tileSize,
    font: Math.max(10, Math.round(10 + (tileSize - 70) * 0.11)),
    emoji: Math.max(22, Math.round(22 + (tileSize - 70) * 0.46)),
  };

  return (
    <>
      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.bg, border: `2px solid ${T.border}`, borderRadius: 12, padding: "7px 12px", marginBottom: 10 }}>
        <span>🔍</span>
        <input
          style={{ border: "none", background: "none", outline: "none", flex: 1, fontSize: 14, color: T.text, fontFamily: "inherit" }}
          placeholder="Search all symbols…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15 }} onClick={() => setSearchQuery("")}>✕</button>
        )}
      </div>

      {/* Size slider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 2px 8px", borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 13, color: T.subtext, fontWeight: 700, whiteSpace: "nowrap" }}>🔲 Icon Size</span>
        <span style={{ fontSize: 13, fontWeight: 900 }}>A</span>
        <input type="range" min={70} max={350} step={5} value={tileSize}
          onChange={(e) => {}} // controlled from App
          readOnly
          style={{ flex: 1, accentColor: "#6366F1", cursor: "pointer" }}
        />
        <span style={{ fontSize: 24, fontWeight: 900 }}>A</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#6366F1", background: "#EEF2FF", borderRadius: 6, padding: "2px 7px", minWidth: 32, textAlign: "center" }}>
          {tileSize < 100 ? "XS" : tileSize < 130 ? "S" : tileSize < 175 ? "M" : tileSize < 230 ? "L" : tileSize < 290 ? "XL" : "XXL"}
        </span>
      </div>

      {/* Category tabs */}
      {!searchQuery && !activeBoard && (
        <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              style={{
                flexShrink: 0, background: activeCategory === cat.id ? cat.color : "none",
                border: "none", borderRadius: "10px 10px 0 0", padding: "7px 12px",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
                color: activeCategory === cat.id ? "#1A1A2E" : T.subtext,
                display: "flex", alignItems: "center", gap: 5,
              }}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.emoji}</span><span>{cat.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Symbol grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 12 }}>
        {symbols.length === 0 && searchQuery && (
          <div style={{ textAlign: "center", padding: 40, color: T.subtext, width: "100%" }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <p style={{ fontWeight: 700, marginTop: 12 }}>No symbols found</p>
          </div>
        )}
        {symbols.map((sym, i) => (
          <SymbolTile key={`${sym.id}-${i}`} symbol={sym} sz={sz} T={T} theme={theme} onPress={() => {}} />
        ))}
      </div>
    </>
  );
}
