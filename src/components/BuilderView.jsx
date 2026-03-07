import { useState, useRef } from "react";
import { CATEGORIES, GRID_SIZES, BOARD_COLORS, BOARD_EMOJIS } from "../constants/config";
import { getAllSymbols, EMOJI_SYMBOLS } from "../constants/symbols";
import { useCustomIcons } from "../hooks/useCustomIcons";

export default function BuilderView({ T, theme, initialBoard, onSave, onBack }) {
  const editing = !!initialBoard?.id && !initialBoard.id.startsWith("default-");

  const [cells, setCells]               = useState(initialBoard?.cells || {});
  const [gridSize, setGridSize]         = useState(initialBoard?.gridSize || GRID_SIZES[2]);
  const [name, setName]                 = useState(initialBoard?.name || "");
  const [color, setColor]               = useState(initialBoard?.color || BOARD_COLORS[0]);
  const [emoji, setEmoji]               = useState(initialBoard?.emoji || "⭐");
  const [category, setCategory]         = useState("greetings");
  const [libTab, setLibTab]             = useState("symbols"); // "symbols" | "photos"
  const [search, setSearch]             = useState("");
  const [dragSymbol, setDragSymbol]     = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [saveSuccess, setSaveSuccess]   = useState(false);

  // Upload modal state
  const [uploadModal, setUploadModal]   = useState(null); // null | { dataUrl }
  const [uploadLabel, setUploadLabel]   = useState("");
  const [uploadError, setUploadError]   = useState("");
  const fileInputRef                    = useRef(null);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null); // icon id

  const { icons: customIcons, addIcon, deleteIcon } = useCustomIcons();

  const boardId = initialBoard?.id || null;

  const libSymbols = search.trim()
    ? getAllSymbols().filter((s) => s.label.toLowerCase().includes(search.toLowerCase()))
    : EMOJI_SYMBOLS[category] || [];

  // ── Drag handlers ─────────────────────────────────────────
  const handleDragStart   = (sym, fromCell) => setDragSymbol(fromCell !== undefined ? { ...sym, _fromCell: fromCell } : sym);
  const handleDragOver    = (e, idx) => { e.preventDefault(); setDragOverCell(idx); };
  const handleDragEnd     = () => { setDragSymbol(null); setDragOverCell(null); };

  const handleCellDrop = (e, idx) => {
    e.preventDefault();
    if (!dragSymbol) return;
    const { _fromCell, ...sym } = dragSymbol;
    setCells((prev) => {
      const next = { ...prev };
      if (_fromCell !== undefined) delete next[_fromCell];
      next[idx] = sym;
      return next;
    });
    setDragSymbol(null);
    setDragOverCell(null);
  };

  const removeFromCell = (idx) => setCells((p) => { const n = { ...p }; delete n[idx]; return n; });

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id: boardId, name: name.trim(), color, emoji, gridSize, cells });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // ── Photo upload handlers ─────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5 MB."); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadModal({ dataUrl: ev.target.result });
      setUploadLabel("");
      setUploadError("");
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleUploadSave = () => {
    if (!uploadLabel.trim()) { setUploadError("Please enter a label for this icon."); return; }
    addIcon({ label: uploadLabel.trim(), dataUrl: uploadModal.dataUrl });
    setUploadModal(null);
    setUploadLabel("");
  };

  // ── Styles ────────────────────────────────────────────────
  const css = {
    label:     { fontSize: 11, fontWeight: 700, color: T.subtext, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, marginTop: 14, display: "block" },
    formInput: { background: T.bg, border: `2px solid ${T.border}`, borderRadius: 10, padding: "9px 13px", fontSize: 15, fontWeight: 700, color: T.text, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" },
    input:     { border: "none", background: "none", outline: "none", flex: 1, fontSize: 14, color: T.text, fontFamily: "inherit" },
    libTab:    (active) => ({ padding: "5px 11px", border: "none", borderRadius: 20, fontWeight: 700, fontSize: 10, cursor: "pointer", fontFamily: "inherit", background: active ? "#6366F1" : T.bg, color: active ? "#fff" : T.subtext, flexShrink: 0 }),
  };

  return (
    <div style={{ background: T.panel, borderRadius: 16, overflow: "hidden", boxShadow: `0 4px 20px ${T.shadow}` }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 14, color: T.text }}>← Back</button>
        <div style={{ fontSize: 17, fontWeight: 900 }}>✏️ {editing ? "Edit Board" : "New Board"}</div>
      </div>

      {/* ── Meta controls ───────────────────────────────── */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
        <input style={css.formInput} placeholder="Board name (e.g. Morning Routine…)" value={name} onChange={(e) => setName(e.target.value)} />

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <span style={css.label}>Color</span>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {BOARD_COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: "50%", background: c, border: color === c ? "3px solid #1A1A2E" : "3px solid transparent", cursor: "pointer", outline: color === c ? "3px solid #fff" : "none", outlineOffset: 1, transform: color === c ? "scale(1.15)" : "scale(1)", transition: "transform 0.1s" }} />
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <span style={css.label}>Board Icon</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {BOARD_EMOJIS.map((e) => (
                <button key={e} onClick={() => setEmoji(e)} style={{ fontSize: 20, background: emoji === e ? `${color}33` : "none", border: emoji === e ? `2px solid ${color}` : "2px solid transparent", borderRadius: 8, padding: "3px 5px", cursor: "pointer", transform: emoji === e ? "scale(1.2)" : "scale(1)", transition: "transform 0.1s" }}>{e}</button>
              ))}
            </div>
          </div>
        </div>

        <span style={css.label}>Grid Size</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {GRID_SIZES.map((gs) => (
            <button key={gs.label} onClick={() => setGridSize(gs)} style={{ padding: "6px 12px", border: `2px solid ${gridSize.label === gs.label ? color : T.border}`, borderRadius: 10, background: gridSize.label === gs.label ? `${color}18` : T.bg, color: gridSize.label === gs.label ? color : T.text, fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              {gs.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-panel ───────────────────────────────────── */}
      <div style={{ display: "flex", minHeight: 380 }}>

        {/* Left: grid template */}
        <div style={{ flex: "0 0 55%", padding: 12, borderRight: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.subtext, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            📐 Template Grid — drag symbols in
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridSize.cols},1fr)`, gap: 6 }}>
            {Array.from({ length: gridSize.cells }, (_, i) => {
              const sym  = cells[i];
              const over = dragOverCell === i;
              return (
                <div key={i}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={(e) => handleCellDrop(e, i)}
                  style={{
                    aspectRatio: "1", borderRadius: 12, position: "relative",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    border: over ? `2px dashed ${color}` : sym ? `2px solid ${sym.color}66` : `2px dashed ${T.border}`,
                    background: over ? `${color}18` : sym ? `${sym.color}15` : T.bg,
                    transition: "all 0.15s", cursor: sym ? "grab" : "default", minHeight: 55, overflow: "hidden",
                  }}
                >
                  {sym ? (
                    <>
                      <div draggable onDragStart={() => handleDragStart(sym, i)} onDragEnd={handleDragEnd}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: "100%", padding: 4, cursor: "grab" }}>
                        {/* Photo or emoji */}
                        {sym.dataUrl ? (
                          <img src={sym.dataUrl} alt={sym.label} style={{ width: "min(34px,5.5vw)", height: "min(34px,5.5vw)", objectFit: "cover", borderRadius: 6, pointerEvents: "none" }} />
                        ) : (
                          <span style={{ fontSize: "min(30px,5vw)" }}>{sym.emoji}</span>
                        )}
                        <span style={{ fontSize: "min(9px,1.6vw)", fontWeight: 800, textAlign: "center", color: T.text, lineHeight: 1.1, maxWidth: "88%", padding: "0 2px" }}>{sym.label}</span>
                      </div>
                      <button onClick={() => removeFromCell(i)} style={{ position: "absolute", top: 3, right: 3, background: "#EF444499", border: "none", borderRadius: "50%", width: 17, height: 17, fontSize: 9, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>✕</button>
                    </>
                  ) : (
                    <span style={{ fontSize: 20, opacity: 0.18 }}>＋</span>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: T.subtext, marginTop: 10, textAlign: "center" }}>
            {Object.keys(cells).length}/{gridSize.cells} slots filled · drag icons from the right panel
          </div>
        </div>

        {/* Right: symbol browser */}
        <div style={{ flex: 1, padding: 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Tab switcher: Symbols | My Photos */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <button style={css.libTab(libTab === "symbols")} onClick={() => { setLibTab("symbols"); setSearch(""); }}>
              🔠 Symbols
            </button>
            <button style={css.libTab(libTab === "photos")} onClick={() => { setLibTab("photos"); setSearch(""); }}>
              📷 My Photos {customIcons.length > 0 && `(${customIcons.length})`}
            </button>
          </div>

          {/* ── SYMBOLS tab ──────────────────────────────── */}
          {libTab === "symbols" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: "5px 10px", marginBottom: 8 }}>
                <span style={{ fontSize: 12 }}>🔍</span>
                <input style={{ ...css.input, fontSize: 12 }} placeholder="Search symbols…" value={search} onChange={(e) => setSearch(e.target.value)} />
                {search && <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: T.subtext }} onClick={() => setSearch("")}>✕</button>}
              </div>
              {!search && (
                <div style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: 8, paddingBottom: 2 }}>
                  {CATEGORIES.map((cat) => (
                    <button key={cat.id} onClick={() => setCategory(cat.id)} style={{ flexShrink: 0, padding: "4px 9px", borderRadius: 20, border: "none", fontWeight: 700, fontSize: 10, cursor: "pointer", fontFamily: "inherit", background: category === cat.id ? cat.color : T.bg, color: category === cat.id ? "#1A1A2E" : T.subtext }}>
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, overflowY: "auto", flex: 1, alignContent: "flex-start" }}>
                {libSymbols.map((sym) => (
                  <div key={sym.id} draggable onDragStart={() => handleDragStart(sym)} onDragEnd={handleDragEnd}
                    style={{ width: 64, height: 64, background: `${sym.color}22`, border: `2px solid ${sym.color}55`, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "grab", gap: 2, userSelect: "none", flexShrink: 0 }}>
                    <span style={{ fontSize: 24 }}>{sym.emoji}</span>
                    <span style={{ fontSize: 8, fontWeight: 800, textAlign: "center", color: T.text, padding: "0 3px", lineHeight: 1.1 }}>{sym.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── MY PHOTOS tab ────────────────────────────── */}
          {libTab === "photos" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>

              {/* Upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "9px 14px", marginBottom: 10,
                  background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                  color: "#fff", border: "none", borderRadius: 12,
                  fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                📷 Upload Photo
              </button>

              {customIcons.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 12px", color: T.subtext }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>No custom icons yet</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>Upload a photo to get started</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, overflowY: "auto", flex: 1, alignContent: "flex-start" }}>
                  {customIcons.map((icon) => (
                    <div key={icon.id} style={{ position: "relative", width: 64, flexShrink: 0 }}>
                      <div
                        draggable
                        onDragStart={() => handleDragStart(icon)}
                        onDragEnd={handleDragEnd}
                        style={{
                          width: 64, height: 64,
                          background: `${icon.color}18`,
                          border: `2px solid ${icon.color}55`,
                          borderRadius: 12,
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                          cursor: "grab", gap: 2, userSelect: "none", overflow: "hidden",
                        }}
                      >
                        <img src={icon.dataUrl} alt={icon.label} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, pointerEvents: "none" }} />
                        <span style={{ fontSize: 8, fontWeight: 800, textAlign: "center", color: T.text, padding: "0 3px", lineHeight: 1.1, maxWidth: "100%" }}>{icon.label}</span>
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={() => setDeleteConfirm(icon.id)}
                        title="Delete this icon"
                        style={{ position: "absolute", top: -5, right: -5, width: 18, height: 18, borderRadius: "50%", background: "#EF4444", border: "2px solid #fff", color: "#fff", fontSize: 9, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Save bar ───────────────────────────────────── */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center", background: T.panel }}>
        <div style={{ flex: 1 }}>
          {saveSuccess
            ? <span style={{ fontSize: 14, fontWeight: 800, color: "#10B981" }}>✅ Board saved!</span>
            : name.trim()
              ? <span style={{ fontSize: 13, fontWeight: 700, color: T.subtext }}>{emoji} <strong style={{ color: T.text }}>{name}</strong></span>
              : <span style={{ fontSize: 12, color: T.subtext }}>Enter a board name above to save</span>
          }
        </div>
        <button onClick={handleSave} disabled={!name.trim()} style={{ background: name.trim() ? `linear-gradient(135deg,${color},${color}bb)` : T.border, color: name.trim() ? "#fff" : T.subtext, border: "none", borderRadius: 12, padding: "10px 22px", fontWeight: 900, fontSize: 14, cursor: name.trim() ? "pointer" : "default", fontFamily: "inherit", boxShadow: name.trim() ? `0 4px 12px ${color}44` : "none", transition: "all 0.2s" }}>
          💾 {editing ? "Update Board" : "Save Board"}
        </button>
      </div>

      {/* ── Upload label modal ──────────────────────────── */}
      {uploadModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)" }}>
          <div style={{ background: T.panel, borderRadius: 20, padding: "28px 24px", width: 300, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", border: `1px solid ${T.border}` }}>
            <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 16, textAlign: "center" }}>📷 Name Your Icon</div>

            {/* Preview */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <img src={uploadModal.dataUrl} alt="preview" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 14, border: `2px solid ${T.border}` }} />
            </div>

            <input
              autoFocus
              placeholder="Enter a label (e.g. My Bedroom)"
              value={uploadLabel}
              onChange={(e) => { setUploadLabel(e.target.value); setUploadError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleUploadSave()}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `2px solid ${uploadError ? "#EF4444" : T.border}`, background: T.bg, color: T.text, fontSize: 14, fontWeight: 700, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            />
            {uploadError && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 6, fontWeight: 600 }}>{uploadError}</p>}

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={handleUploadSave} style={{ flex: 1, padding: "11px 0", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                Save Icon ✓
              </button>
              <button onClick={() => setUploadModal(null)} style={{ padding: "11px 16px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 12, color: T.subtext, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ─────────────────────────── */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)" }}>
          <div style={{ background: T.panel, borderRadius: 20, padding: "24px", width: 280, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", border: `1px solid ${T.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>Delete this icon?</div>
            <div style={{ fontSize: 12, color: T.subtext, marginBottom: 18, lineHeight: 1.5 }}>
              It will be removed from your library. Any boards using it will still show the image.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { deleteIcon(deleteConfirm); setDeleteConfirm(null); }} style={{ flex: 1, padding: "10px 0", background: "#EF4444", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Delete
              </button>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "10px 0", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 12, color: T.subtext, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
