import { useState, useRef } from "react";

// How many pixels of movement counts as a scroll (not a tap)
const SCROLL_THRESHOLD = 8;

export default function SymbolTile({ symbol, sz, T, theme, onPress, draggable, onDragStart, onDragEnd, compact }) {
  const [pressed, setPressed] = useState(false);
  const touchStartRef = useRef(null); // { x, y } of touch start
  const didScrollRef  = useRef(false);

  const w  = compact ? 72 : sz.tile;
  const ef = compact ? 26 : sz.emoji;
  const ff = compact ? 9  : sz.font;

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
    didScrollRef.current  = false;
    setPressed(true);
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    const t  = e.touches[0];
    const dx = Math.abs(t.clientX - touchStartRef.current.x);
    const dy = Math.abs(t.clientY - touchStartRef.current.y);
    if (dx > SCROLL_THRESHOLD || dy > SCROLL_THRESHOLD) {
      didScrollRef.current = true;
      setPressed(false); // remove pressed highlight while scrolling
    }
  };

  const handleTouchEnd = () => {
    setPressed(false);
    if (!didScrollRef.current && !draggable) {
      // Finger barely moved — it's a tap, fire the press
      onPress?.();
    }
    touchStartRef.current = null;
    didScrollRef.current  = false;
  };

  const handleClick = (e) => {
    // Desktop mouse click only — touch is handled above
    if (draggable) return;
    onPress?.();
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: w, height: w,
        background: pressed ? symbol.color : theme === "highcontrast" ? "#111" : `${symbol.color}22`,
        border: `2px solid ${pressed ? symbol.color : `${symbol.color}66`}`,
        borderRadius: Math.max(10, w * 0.12),
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        cursor: draggable ? "grab" : "pointer",
        gap: Math.max(2, w * 0.02),
        userSelect: "none",
        WebkitUserSelect: "none",
        transform: pressed ? "scale(0.93)" : "scale(1)",
        transition: "transform 0.1s, background 0.1s",
        animation: "pop 0.2s ease",
        flexShrink: 0,
        boxShadow: pressed ? `0 0 0 3px ${symbol.color}55` : "none",
        overflow: "hidden",
        touchAction: "pan-y",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {symbol.dataUrl ? (
        <img
          src={symbol.dataUrl}
          alt={symbol.label}
          style={{
            width: ef * 1.5, height: ef * 1.5,
            objectFit: "cover",
            borderRadius: Math.max(6, w * 0.08),
            flexShrink: 0,
            pointerEvents: "none",
          }}
        />
      ) : (
        <span style={{ fontSize: ef, lineHeight: 1 }}>{symbol.emoji}</span>
      )}
      <span style={{
        fontSize: ff, fontWeight: 800, textAlign: "center",
        color: pressed ? "#fff" : T.text,
        lineHeight: 1.15, maxWidth: "90%", padding: "0 3px", wordBreak: "break-word",
      }}>
        {symbol.label}
      </span>
    </div>
  );
}
