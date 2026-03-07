import { useRef, useState, useEffect, useCallback } from "react";
import SymbolTile from "./SymbolTile";

const BUFFER_ROWS  = 2;
const ROW_ESTIMATE = 120;

/**
 * VirtualSymbolGrid — only renders tiles near the viewport.
 * Also handles:
 *   - Keyboard navigation (arrow keys + Enter/Space)
 *   - Switch scanning (focusedIndex prop from useSwitchScanning)
 */
export default function VirtualSymbolGrid({
  symbols, sz, T, theme, onPress,
  // Accessibility
  focusedIndex,   // controlled from switch scanner (or null for keyboard mode)
  onFocusedIndex, // callback when keyboard moves focus
}) {
  const containerRef  = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 40 });
  const [cols, setCols]                 = useState(4);
  const [rowHeight, setRowHeight]       = useState(ROW_ESTIMATE);
  const [kbIndex, setKbIndex]           = useState(-1); // keyboard focus index

  const shouldVirtualise = symbols.length >= 30;
  // Use switch scanner index if provided, otherwise keyboard index
  const activeIndex = focusedIndex != null ? focusedIndex : kbIndex;

  // Measure container
  useEffect(() => {
    if (!containerRef.current) return;
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
  }, [sz.tile]);

  // Virtualisation scroll handler
  const updateRange = useCallback(() => {
    const el = containerRef.current?.closest("[data-scroll-container]");
    if (!el) return;
    const scrollTop   = el.scrollTop;
    const viewHeight  = el.clientHeight;
    const firstRow    = Math.max(0, Math.floor(scrollTop / rowHeight) - BUFFER_ROWS);
    const visibleRows = Math.ceil(viewHeight / rowHeight) + BUFFER_ROWS * 2;
    const start       = firstRow * cols;
    const end         = Math.min(symbols.length, (firstRow + visibleRows) * cols);
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

  useEffect(() => {
    if (shouldVirtualise) updateRange();
  }, [symbols, cols, updateRange, shouldVirtualise]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!symbols.length) return;
    let next = kbIndex;
    if (e.key === "ArrowRight") next = Math.min(symbols.length - 1, kbIndex < 0 ? 0 : kbIndex + 1);
    else if (e.key === "ArrowLeft")  next = Math.max(0, kbIndex - 1);
    else if (e.key === "ArrowDown")  next = Math.min(symbols.length - 1, kbIndex < 0 ? cols : kbIndex + cols);
    else if (e.key === "ArrowUp")    next = Math.max(0, kbIndex - cols);
    else if (e.key === "Enter" || e.key === " ") {
      if (kbIndex >= 0 && kbIndex < symbols.length) {
        e.preventDefault();
        onPress(symbols[kbIndex]);
      }
      return;
    } else return;

    e.preventDefault();
    setKbIndex(next);
    onFocusedIndex?.(next);
  }, [kbIndex, cols, symbols, onPress, onFocusedIndex]);

  // Scroll focused tile into view
  useEffect(() => {
    if (activeIndex < 0) return;
    const el = containerRef.current?.querySelector(`[data-tile-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeIndex]);

  const renderTile = (sym, i) => (
    <SymbolTile
      key={`${sym.id}-${i}`}
      symbol={sym}
      sz={sz}
      T={T}
      theme={theme}
      onPress={() => { setKbIndex(i); onPress(sym); }}
      scanHighlight={i === activeIndex && activeIndex >= 0}
    />
  );

  if (!shouldVirtualise) {
    return (
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Symbol board"
        style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 10, outline: "none" }}
      >
        {symbols.map((sym, i) => (
          <div key={`${sym.id}-${i}`} data-tile-index={i}>
            {renderTile(sym, i)}
          </div>
        ))}
      </div>
    );
  }

  const totalRows   = Math.ceil(symbols.length / cols);
  const totalHeight = totalRows * rowHeight;
  const topPad      = Math.floor(visibleRange.start / cols) * rowHeight;
  const visibleSyms = symbols.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Symbol board"
      style={{ position: "relative", height: totalHeight, paddingTop: 10, outline: "none" }}
    >
      <div style={{ position: "absolute", top: topPad + 10, left: 0, right: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {visibleSyms.map((sym, i) => {
            const globalIdx = visibleRange.start + i;
            return (
              <div key={`${sym.id}-${globalIdx}`} data-tile-index={globalIdx}>
                {renderTile(sym, globalIdx)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
