import { useState } from "react";
import BoardCard from "./BoardCard";

export default function MyBoardsView({
  boards, T, onLoad, onEdit, onDelete, onNewBoard,
  boardShare, onImportBoard, profileName,
}) {
  const [importCode,   setImportCode]   = useState("");
  const [importResult, setImportResult] = useState(null);  // { board, sharedBy }
  const [shareModal,   setShareModal]   = useState(null);  // { code, boardName }
  const [copied,       setCopied]       = useState(false);

  // ── Import shared board ─────────────────────────────────────
  const handleImport = async () => {
    if (importCode.length < 6) return;
    boardShare.clearError?.();
    const result = await boardShare.importSharedBoard(importCode.trim());
    if (result) {
      setImportResult(result);
      setImportCode("");
    }
  };

  const handleConfirmImport = () => {
    if (importResult) {
      onImportBoard(importResult.board);
      setImportResult(null);
    }
  };

  // ── Share a board ────────────────────────────────────────────
  const handleShare = async (board) => {
    boardShare.clearError?.();
    const code = await boardShare.shareBoard(board, profileName);
    if (code) setShareModal({ code, boardName: board.name });
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareModal.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const primaryBtn = (color = "#6366F1") => ({
    background: `linear-gradient(135deg,${color},${color}bb)`,
    color: "#fff", border: "none", borderRadius: 12,
    padding: "10px 18px", fontWeight: 800, fontSize: 14,
    cursor: "pointer", fontFamily: "inherit",
    touchAction: "manipulation",
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>📋 My Boards</div>
          <div style={{ fontSize: 13, color: T.subtext, marginTop: 2 }}>
            {boards.length} saved board{boards.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button onClick={onNewBoard} style={primaryBtn()}>＋ New Board</button>
      </div>

      {/* Import shared board */}
      <div style={{
        background: T.panel, borderRadius: 14, padding: 14,
        border: `1px solid ${T.border}`, marginBottom: 16,
        boxShadow: `0 2px 8px ${T.shadow}`,
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 8 }}>
          📥 Import a shared board
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Enter 6-char share code"
            value={importCode}
            onChange={(e) => { setImportCode(e.target.value.toUpperCase().replace(/\s/g, "").slice(0, 6)); boardShare.clearError?.(); }}
            onKeyDown={(e) => e.key === "Enter" && handleImport()}
            style={{
              flex: 1, padding: "9px 12px", borderRadius: 10,
              border: `2px solid ${T.border}`, background: T.bg,
              color: T.text, fontSize: 16, fontWeight: 900,
              letterSpacing: 4, fontFamily: "monospace", outline: "none",
              textTransform: "uppercase",
            }}
          />
          <button
            onClick={handleImport}
            disabled={boardShare.sharing || importCode.length < 6}
            style={{ ...primaryBtn(), opacity: (boardShare.sharing || importCode.length < 6) ? 0.5 : 1 }}
          >
            {boardShare.sharing ? "⏳" : "Import"}
          </button>
        </div>
        {boardShare.shareError && (
          <p style={{ fontSize: 12, color: "#EF4444", marginTop: 6, fontWeight: 600 }}>
            ⚠️ {boardShare.shareError}
          </p>
        )}
      </div>

      {/* Board grid */}
      {boards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: T.subtext }}>
          <div style={{ fontSize: 56 }}>📝</div>
          <p style={{ fontWeight: 700, fontSize: 16, marginTop: 12 }}>No boards yet</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Tap "New Board" to create your first custom board</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 12 }}>
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              T={T}
              onLoad={() => onLoad(board)}
              onEdit={() => onEdit(board)}
              onDelete={() => onDelete(board.id)}
              onShare={() => handleShare(board)}
              sharing={boardShare.sharing}
            />
          ))}
        </div>
      )}

      {/* Import confirmation modal */}
      {importResult && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)" }}>
          <div style={{ background: T.panel, borderRadius: 20, padding: "28px 24px", width: 320, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 36, textAlign: "center", marginBottom: 10 }}>📥</div>
            <div style={{ fontWeight: 900, fontSize: 17, textAlign: "center", marginBottom: 6 }}>Import board?</div>
            <div style={{ fontSize: 13, color: T.subtext, textAlign: "center", marginBottom: 4 }}>
              <strong style={{ color: T.text }}>{importResult.board.emoji} {importResult.board.name}</strong>
            </div>
            <div style={{ fontSize: 12, color: T.subtext, textAlign: "center", marginBottom: 20 }}>
              Shared by {importResult.sharedBy} · {Object.keys(importResult.board.cells).length} symbols
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleConfirmImport} style={{ ...primaryBtn(), flex: 1, padding: "11px 0" }}>Add to My Boards</button>
              <button onClick={() => setImportResult(null)} style={{ flex: 1, padding: "11px 0", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 12, color: T.subtext, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Share code modal */}
      {shareModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)" }}>
          <div style={{ background: T.panel, borderRadius: 20, padding: "28px 24px", width: 320, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 36, textAlign: "center", marginBottom: 10 }}>🔗</div>
            <div style={{ fontWeight: 900, fontSize: 17, textAlign: "center", marginBottom: 6 }}>Share "{shareModal.boardName}"</div>
            <div style={{ fontSize: 13, color: T.subtext, textAlign: "center", marginBottom: 16 }}>Give this code to another device to import the board.</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <div style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: `2px solid ${T.border}`, background: T.bg, fontSize: 28, fontWeight: 900, letterSpacing: 10, textAlign: "center", fontFamily: "monospace", color: "#6366F1" }}>
                {shareModal.code}
              </div>
              <button onClick={handleCopy} style={{ ...primaryBtn(copied ? "#10B981" : "#6366F1"), padding: "14px 16px", fontSize: 18 }}>
                {copied ? "✓" : "📋"}
              </button>
            </div>
            <div style={{ fontSize: 11, color: T.subtext, textAlign: "center", marginBottom: 16 }}>Code is valid for 30 days.</div>
            <button onClick={() => { setShareModal(null); setCopied(false); }} style={{ width: "100%", padding: "11px 0", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 12, color: T.subtext, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
