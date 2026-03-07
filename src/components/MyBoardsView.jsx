import BoardCard from "./BoardCard";

export default function MyBoardsView({ boards, T, onLoad, onEdit, onDelete, onNewBoard }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>📋 My Boards</div>
          <div style={{ fontSize: 13, color: T.subtext, marginTop: 2 }}>
            {boards.length} saved board{boards.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button onClick={onNewBoard} style={{
          background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
          color: "#fff", border: "none", borderRadius: 12,
          padding: "10px 18px", fontWeight: 800, fontSize: 14, cursor: "pointer",
        }}>
          ＋ New Board
        </button>
      </div>

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
            />
          ))}
        </div>
      )}
    </div>
  );
}
