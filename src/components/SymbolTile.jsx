import { useState, useRef } from "react";

export default function SymbolTile({ symbol, sz, T, theme, onPress, draggable, onDragStart, onDragEnd, compact }) {
  const [pressed, setPressed] = useState(false);
  const didFireRef = useRef(false); // prevent double-fire on touch devices

  const w  = compact ? 72 : sz.tile;
  const ef = compact ? 26 : sz.emoji;
  const ff = compact ? 9  : sz.font;

  const handleTouchStart = (e) => {
    setPressed(true);
    if (!draggable) {
      didFireRef.current = true;
      onPress?.();
    }
  };

  const handleTouchEnd = () => {
    setPressed(false);
    // Reset after delay so click can check it
    setTimeout(() => { didFireRef.current = false; }, 500);
  };

  const handleClick = () => {
    // Only fire from click if NOT already fired from touch
    if (draggable) return;
    if (didFireRef.current) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 150);
    onPress?.();
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
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
        touchAction: "manipulation",
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
