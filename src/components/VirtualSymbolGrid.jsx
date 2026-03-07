import { useRef, useState, useEffect, useCallback } from "react";
import SymbolTile from "./SymbolTile";

const BUFFER_ROWS  = 2;   // extra rows rendered above/below viewport
const ROW_ESTIMATE = 120; // estimated row height in px for initial layout

/**
 * VirtualSymbolGrid — only renders tiles that are near the viewport.
 * Falls back to full render for small lists (< 30 items) where
 * virtualisation overhead isn't worth it.
 */
export default function VirtualSymbolGrid({ symbols, sz, T, theme, onPress }) {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 40 });
  const [cols, setCols]                 = useState(4);
  const [rowHeight, setRowHeight]       = useState(ROW_ESTIMATE);

  // Small lists — skip virtualisation entirely
  const shouldVirtualise = symbols.length >= 30;

  // Measure container width → compute column count
  useEffect(() => {
    if (!shouldVirtualise || !containerRef.current) return;
    const measure = () => {
      const width = containerRef.current?.clientWidth ?? 0;
      const gap   = 10;
      const c     = Math.max(1, Math.floor((width + gap) / (sz.tile + gap)));
      setCols(c);
      setRowHeight(sz.tile + gap);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [sz.tile, shouldVirtualise]);

  // Scroll handler — recalculate visible range
  const updateRange = useCallback(() => {
    const el = containerRef.current?.closest("[data-scroll-container]");
    if (!el) return;
    const scrollTop    = el.scrollTop;
    const viewHeight   = el.clientHeight;
    const firstRow     = Math.max(0, Math.floor(scrollTop / rowHeight) - BUFFER_ROWS);
    const visibleRows  = Math.ceil(viewHeight / rowHeight) + BUFFER_ROWS * 2;
    const start        = firstRow * cols;
    const end          = Math.min(symbols.length, (firstRow + visibleRows) * cols);
    setVisibleRange({ start, end });
  }, [cols, rowHeight, symbols.length]);

  useEffect(() => {
    if (!shouldVirtualise) return;
    const el = containerRef.current?.closest("[data-scroll-container]");
    if (!el) return;
    el.addEventListener("scroll", updateRange, { passive: true });
    updateRange();
    return () => el.removeEventListener("scroll", updateRange);
  }, [updateRange, shouldVirtualise]);

  // Also update when symbols/cols change
  useEffect(() => {
    if (shouldVirtualise) updateRange();
  }, [symbols, cols, updateRange, shouldVirtualise]);

  if (!shouldVirtualise) {
    return (
      <div ref={containerRef} style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 10 }}>
        {symbols.map((sym, i) => (
          <SymbolTile key={`${sym.id}-${i}`} symbol={sym} sz={sz} T={T} theme={theme} onPress={() => onPress(sym)} />
        ))}
      </div>
    );
  }

  const totalRows    = Math.ceil(symbols.length / cols);
  const totalHeight  = totalRows * rowHeight;
  const topPad       = Math.floor(visibleRange.start / cols) * rowHeight;
  const visibleSyms  = symbols.slice(visibleRange.start, visibleRange.end);

  return (
    <div ref={containerRef} style={{ position: "relative", height: totalHeight, paddingTop: 10 }}>
      {/* Spacer pushes visible tiles to correct scroll position */}
      <div style={{ position: "absolute", top: topPad + 10, left: 0, right: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {visibleSyms.map((sym, i) => (
            <SymbolTile
              key={`${sym.id}-${visibleRange.start + i}`}
              symbol={sym} sz={sz} T={T} theme={theme}
              onPress={() => onPress(sym)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
